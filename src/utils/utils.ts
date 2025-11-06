import { useEffect } from "react";
import { IMAGE_SERVER, managedSRC } from "./consts";
import { DATA, GAME, INSTALLED_ITEMS, LANG, ONLINE_DATA, SOURCE, store } from "./vars";
import { useAtom, useAtomValue } from "jotai";
import { apiClient } from "./api";
import { join } from "./hotreload";
import { addToast } from "@/_Toaster/ToastProvider";
import { TEXT } from "./text";
export { join };
let IMAGE_SERVER_URL = IMAGE_SERVER;
export function setImageServer(url: string) {
	IMAGE_SERVER_URL = url;
}
const reservedWindowsNames = /^(con|prn|aux|nul|com\d|lpt\d)$/i;
const illegalCharacters = /[<>:"/\\|?*\x00-\x1F]/g;
export function safeLoadJson(cur: any, neww: any) {
	if (!cur || !neww) return;
	Object.keys(neww).forEach((key) => {
		if (typeof neww[key] === "object" && !Array.isArray(neww[key])) {
			cur[key] = safeLoadJson(cur[key], neww[key]) || cur[key] || {};
		} else {
			cur[key] = neww[key];
		}
	});
	return cur;
}
export function sanitizeFileName(input: string, options: any = {}): string {
	const { replacement = "_", defaultName = "untitled", maxLength = 255 } = options;

	if (typeof input !== "string") {
		return defaultName;
	}

	let sanitized = input.replace(illegalCharacters, replacement);

	const baseName = sanitized.split(".")[0];
	if (reservedWindowsNames.test(baseName)) {
		sanitized = replacement + sanitized;
	}

	sanitized = sanitized.trim().replace(/^[.]+|[.]+$/g, "");

	if (sanitized.length > maxLength) {
		sanitized = sanitized.substring(0, maxLength);

		sanitized = sanitized.trim().replace(/^[.]+|[.]+$/g, "");
	}

	if (sanitized.length === 0) {
		return defaultName;
	}
	return sanitized;
}
export function formatSize(size: number): string {
	return size < 100
		? size.toFixed(2) + "B"
		: size < 100000
		? (size / 1000).toFixed(2) + "KB"
		: size < 100000000
		? (size / 1000000).toFixed(2) + "MB"
		: (size / 1000000000).toFixed(2) + "GB";
}
export function handleImageError(event: React.SyntheticEvent<HTMLImageElement, Event>, hideOnError = false): void {
	const target = event.currentTarget;
	if (hideOnError) {
		target.style.opacity = "0";
		target.classList.remove("fadein");
	}
	target.src = `/${store.get(GAME) || "WW"}mm.png`;
}
export function preventContextMenu(event: React.MouseEvent): void {
	event.preventDefault();
	// event.currentTarget.dispatchEvent(new MouseEvent("mouseup", { button: 2, bubbles: true }));
}
let src = "";
// let lastUpdated = 0;
// store.sub(LAST_UPDATED, () => {
// 	lastUpdated = Date.now();
// });
store.sub(SOURCE, () => {
	src = store.get(SOURCE);
});
export function getImageUrl(path: string): string {
	return `${IMAGE_SERVER_URL}/${src}/${managedSRC}/${path}`;
}
const PRIORITY_KEYS = ["Alt", "Ctrl", "Shift", "Capslock", "Tab", "Up", "Down", "Left", "Right"];
const PRIORITY_SET = new Set(PRIORITY_KEYS);
export function keySort(keys: string[]): string[] {
	const regularKeys = keys.filter((key) => !PRIORITY_SET.has(key));

	regularKeys.sort((a, b) => {
		if (a.length !== b.length) {
			return a.length - b.length;
		}

		return a.localeCompare(b);
	});

	const inputKeysSet = new Set(keys);
	const presentPriorityKeys = PRIORITY_KEYS.filter((pKey) => inputKeysSet.has(pKey));

	return [...presentPriorityKeys, ...regularKeys];
}
export function getTimeDifference(startTimestamp: number, endTimestamp: number) {
	const secInMinute = 60;
	const secInHour = secInMinute * 60;
	const secInDay = secInHour * 24;
	const secInYear = secInDay * 365;
	const diff = Math.abs(endTimestamp - startTimestamp);
	if (diff < secInMinute) {
		return "now";
	} else if (diff < secInHour) {
		const minutes = Math.floor(diff / secInMinute);
		return minutes + "m";
	} else if (diff < secInDay) {
		const hours = Math.floor(diff / secInHour);
		return hours + "h";
	} else if (diff < secInYear) {
		const days = Math.floor(diff / secInDay);
		return days + "d";
	} else {
		const years = Math.floor(diff / secInYear);
		return years + "y";
	}
}
export async function fetchMod(selected: string, controller?: AbortController) {
	let allData = {};
	//console.log(selected);
	await apiClient.updates(selected, controller?.signal).then(async (data) => {
		await apiClient.mod(selected, controller?.signal).then((data2) => {
			if (data._aRecords && data._aRecords.length > 0) {
				data2._eUpdate = true;
				data2._sUpdateText = data._aRecords[0]._sText;
				data2._sUpdateVersion = data._aRecords[0]._sVersion;
				data2._sUpdateDate = data._aRecords[0]._tsDateModified || data._aRecords[0]._tsDateAdded;
				data2._aUpdateChangeLog = data._aRecords[0]._aChangeLog;
				data2._sUpdateName = data._aRecords[0]._sName;
			}
			if (data2._idRow != selected.split("/").slice(-1)[0]) return;
			allData = data2;
			store.set(ONLINE_DATA, (prev) => {
				return {
					...prev,
					[selected]: data2,
				};
			});
		});
	});
	return allData;
}
export function modRouteFromURL(url: string): string {
	let modId = url?.split("mods/").pop()?.split("/")[0] || "";
	return modId ? "Mod/" + modId : "";
}
export function isOlderThanOneDay(dateStr: string) {
	const updateAgeMs = Date.now() - (dateStr ? new Date(dateStr).getTime() : 0);
	return Number.isFinite(updateAgeMs) && updateAgeMs > 86_400_000;
}
let initialCheck = true;
export function useInstalledItemsManager() {
	const [installedItems, setInstalledItems] = useAtom(INSTALLED_ITEMS);
	const localData = useAtomValue(DATA);
	const onlineData = useAtomValue(ONLINE_DATA);
	async function checkModStatus(item: any) {
		console.log("[IMM] Checking mod status for", item.name);
		let modStatus = 0;
		if (onlineData[item.name]) {
			modStatus = item.updated < onlineData[item.name] ? (item.viewed < onlineData[item.name] ? 2 : 1) : 0;
		} else {
			try {
				const data = (await fetchMod(modRouteFromURL(item.source))) as any;
				if (data._tsDateModified) {
					let latest = item.updated || 0;
					data._aFiles.forEach((file: any) => {
						latest = Math.max(latest, (file._tsDateModified || file._tsDateAdded || 0) * 1000);
					});
					// setUpdateCache((prev) => ({ ...prev, [item.name]: latest }));
					modStatus = item.updated < latest ? (item.viewed < latest ? 2 : 1) : 0;
				}
			} catch (error) {
				return 0;
			}
		}
		console.log("[IMM] Final mod status for", item.name, "is", modStatus);
		return modStatus;
	}
	async function updateInstalledItems(localDataSnapshot: any) {
		const itemsToProcess = Object.keys(localDataSnapshot)
			.filter((key) => localDataSnapshot[key].source)
			.map((key) => ({
				name: key,
				source: localDataSnapshot[key].source,
				updated: localDataSnapshot[key].updatedAt || 0,
				viewed: localDataSnapshot[key].viewedAt || 0,
				modStatus: 0,
			}));
		const processedItems = await Promise.all(
			itemsToProcess.map(async (item) => {
				const modStatus = await checkModStatus(item);

				return { ...item, modStatus };
			})
		);
		const newCount = processedItems.filter((item) => item.modStatus === 2).length;
		// const pendingCount = processedItems.filter((item) => item.modStatus === 1).length;

		if (initialCheck) {
			//console.log("Showing toast for new updates");
			initialCheck = false;
			setTimeout(() => {
				if (newCount > 0)
					addToast({
						type: "info",
						message: TEXT[(store.get(LANG) || "en") as keyof typeof TEXT]._Toasts.NewUpdates.replace(
							"<new/>",
							newCount.toString()
						),
						duration: 10000,
					});
				else
					addToast({ type: "info", message: TEXT[(store.get(LANG) || "en") as keyof typeof TEXT]._Toasts.ModsLoaded });
			}, 3500);
		}
		setInstalledItems(
			processedItems.sort((a: any, b: any) => {
				const flagDiff = b.modStatus - a.modStatus;
				if (flagDiff !== 0) return flagDiff;
				return a.name
					.toLocaleLowerCase()
					.split("\\")
					.slice(-1)[0]
					.localeCompare(b.name.toLocaleLowerCase().split("\\").slice(-1)[0]);
			})
		);
	}
	useEffect(() => {
		if (installedItems.length == 0) initialCheck = true;
	}, [installedItems]);
	useEffect(() => {
		if (Object.keys(localData).length > 0) {
			updateInstalledItems({ ...localData });
		} else {
			setInstalledItems([]);
		}
	}, [localData]);
}
