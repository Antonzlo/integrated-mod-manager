import { invoke } from "@tauri-apps/api/core";
import { confirm } from "@tauri-apps/plugin-dialog";
import { DOWNLOAD_LIST, store } from "./vars";
import { DownloadItem, DownloadList } from "./types";
import { cleanCancelledDownload } from "./filesys";

export function activeDownloads(downloads: DownloadList): DownloadItem[] {
	const downloading = Array.isArray(downloads.downloading) ? downloads.downloading : downloads.downloading ? [downloads.downloading] : [];
	return [...downloading, ...(downloads.extracting || [])];
}

export async function confirmAndCancelDownloadsForGameSwitch() {
	const downloads = store.get(DOWNLOAD_LIST);
	const active = activeDownloads(downloads);
	if (!active.length) return true;

	const list = active.map((item) => `- ${item.name || item.fname || item.key} (${item.status || "downloading"})`).join("\n");
	const queued = downloads.queue?.length ? `\n\nQueued downloads: ${downloads.queue.length}` : "";
	const ok = await confirm(
		`Downloads are still running:\n\n${list}${queued}\n\nWait for them to complete, or continue and cancel all downloads.`,
		{
			title: "Cancel Downloads?",
			kind: "warning",
			okLabel: "Cancel Downloads",
			cancelLabel: "Keep Downloading",
		}
	);
	if (!ok) return false;

	await invoke("get_username").catch(() => {});
	await Promise.all(active.map((item) => (item.dlPath ? cleanCancelledDownload(item.dlPath).catch(() => {}) : undefined)));
	store.set(DOWNLOAD_LIST, (prev) => ({
		...prev,
		queue: [],
		downloading: [],
		extracting: [],
	}));
	return true;
}
