import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Check, Clock, DownloadIcon, FileQuestionIcon, FolderArchiveIcon, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { CATEGORIES, DATA, DOWNLOAD_LIST, GAME, LEFT_SIDEBAR_OPEN, MOD_LIST, TEXT_DATA } from "@/utils/vars";
import { formatBytes, sanitizeFileName } from "@/utils/utils";
import {
	cleanCancelledDownload,
	createModDownloadDir,
	refreshModList,
	saveConfigs,
	validateModDownload,
} from "@/utils/filesys";
import { DownloadItem } from "@/utils/types";
import { UNCATEGORIZED } from "@/utils/consts";
import { info } from "@/lib/logger";

type DownloadQueueItem = Omit<DownloadItem, "status"> & {
	status: DownloadItem["status"];
	dlPath?: string;
	error?: string;
	path?: string;
	updatedAt?: number;
};

const externalExtracts = {} as Record<string, DownloadQueueItem>;
export function addToExtracts(key: string, element: any) {
	externalExtracts[key] = element;
}
const Icons = {
	pending: <Clock className="min-h-4 min-w-4 max-w-4" />,
	downloading: <Loader2 className="min-h-4 min-w-4 max-w-4 animate-spin" />,
	completed: <Check className="min-h-4 min-w-4 max-w-4" />,
	failed: <X className="min-h-4 min-w-4 max-w-4 text-destructive" />,
	extracting: <FolderArchiveIcon className="min-h-4 min-w-4 max-w-4 animate-pulse" />,
};
function Downloads() {
	const textData = useAtomValue(TEXT_DATA);
	const [downloads, setDownloads] = useAtom(DOWNLOAD_LIST);
	const categories = useAtomValue(CATEGORIES);
	const [data, setData] = useAtom(DATA);
	const [dialogOpen, setDialogOpen] = useState(false);
	const leftSidebarOpen = useAtomValue(LEFT_SIDEBAR_OPEN);
	const modList = useSetAtom(MOD_LIST);
	const game = useAtomValue(GAME);
	const downloadRef = useRef<HTMLDivElement>(null);
	const downloadRef2 = useRef<HTMLDivElement>(null);
	const downloadRef3 = useRef<HTMLDivElement>(null);
	const speedRef = useRef<HTMLDivElement>(null);
	const currentPathRef = useRef("");
	const activeDownloadRef = useRef<DownloadQueueItem | null>(null);
	const extractsRef = useRef<Record<string, DownloadQueueItem>>(externalExtracts);
	const progressRef = useRef({ percent: 0, text: " • " });
	const lastSpeedUpdate = useRef(0);
	const [progressView, setProgressView] = useState({ percent: 0, text: " • " });

	const resetProgress = () => {
		progressRef.current = { percent: 0, text: " • " };
		setProgressView(progressRef.current);
		if (speedRef.current) speedRef.current.textContent = " • ";
		if (downloadRef.current) downloadRef.current.style.width = "0%";
		if (downloadRef2.current) downloadRef2.current.style.width = "0%";
		if (downloadRef3.current) {
			downloadRef3.current.style.background = "conic-gradient( var(--accent) 0% 0%, var(--button) 0% 100%)";
		}
	};

	const markDownloadFailed = (key: string, message: string, stage = "download") => {
		const activeDownload = activeDownloadRef.current;
		const activeFailed = activeDownload?.key === key ? activeDownload : null;
		const extractingFailed = extractsRef.current[key] || externalExtracts[key];
		const failedItem = activeFailed || extractingFailed;
		if (!failedItem) return;

		info("[IMM] Download failed:", key, stage, message);
		if (activeFailed && currentPathRef.current) cleanCancelledDownload(currentPathRef.current);
		delete extractsRef.current[key];
		delete externalExtracts[key];
		if (activeFailed) {
			activeDownloadRef.current = null;
			currentPathRef.current = "";
		}
		resetProgress();
		setDownloads((prev) => ({
			...prev,
			downloading: activeFailed ? null : prev.downloading,
			extracting: prev.extracting?.filter((item) => item.key !== key) || [],
			completed: [
				...(prev.completed || []),
				{
					...failedItem,
					status: "failed",
					error: message || stage,
				} as DownloadItem,
			],
		}));
	};

	const downloadFile = async (item: DownloadItem) => {
		if (item.category == "Other/Misc") item.category = "Other";
		else if (!categories.find((cat) => cat._sName == item.category)) item.category = UNCATEGORIZED;
		item.name = sanitizeFileName(item.name);
		const dlPath = (await createModDownloadDir(item.category, item.name)) as string;
		const downloadElement: DownloadQueueItem = {
			...item,
			name: item.name,
			path: item.category + "\\" + item.name,
			source: item.source,
			fname: item.fname,
			category: item.category,
			updatedAt: item.updated * 1000,
			dlPath,
			key: `${item.name}_${item.file}_${item.fname}_${item.updated}`,
		};
		currentPathRef.current = dlPath;
		activeDownloadRef.current = downloadElement;
		setData((prevData) => {
			if (!downloadElement.path) return prevData;
			return {
				...prevData,
				[downloadElement.path]: {
					source: downloadElement.source,
					updatedAt: prevData[downloadElement.path]?.updatedAt || -1,
					...prevData[downloadElement.path],
				},
			};
		});
		saveConfigs();
		invoke("download_and_unzip", {
			fileName: item.name,
			downloadUrl: item.file,
			savePath: dlPath,
			key: downloadElement.key,
			emit: true,
		}).catch((err) => markDownloadFailed(downloadElement.key || "", String(err), "download"));
		if (item.preview) {
			invoke("download_and_unzip", {
				fileName: "preview",
				downloadUrl: item.preview,
				savePath: dlPath,
				key: "link_preview_" + item.name,
				emit: false,
			}).catch(() => {});
		}
	};
	useEffect(() => {
		const unlisteners: Array<() => void> = [];
		let disposed = false;
		const addListener = async (eventName: string, handler: (event: any) => void) => {
			const unlisten = await listen(eventName, handler);
			if (disposed) unlisten();
			else unlisteners.push(unlisten);
		};
		addListener("download-progress", (event) => {
			const payload = event.payload as any;
			const total = payload.total as number;
			const downloaded = payload.downloaded as number;
			const activeDownload = activeDownloadRef.current;
			if (!activeDownload || payload.key !== activeDownload.key) return;
			const percent = total > 0 ? Number(((downloaded / total) * 100).toFixed(2)) : 0;
			const text = ` • ${percent}% (${formatBytes(downloaded)}/${formatBytes(total)}) • ${payload.speed} • ${payload.eta} • `;
			progressRef.current = { percent, text };
			const now = Date.now();
			if (now - lastSpeedUpdate.current >= 1000) {
				setProgressView(progressRef.current);
				if (speedRef.current) speedRef.current.textContent = text;
				lastSpeedUpdate.current = now;
			}

			if (downloadRef.current) downloadRef.current.style.width = percent + "%";
			if (downloadRef2.current) downloadRef2.current.style.width = percent + "%";
			if (downloadRef3.current) {
				downloadRef3.current.style.background =
					"conic-gradient( var(--accent) 0% " + percent + "%, var(--button) 0% 100%)";
			}
		});
		addListener("ext", (event) => {
			const payload = event.payload as any;
			const downloadElement = activeDownloadRef.current;
			if (!downloadElement || payload.key !== downloadElement.key) return;
			currentPathRef.current = "";
			resetProgress();
			setDownloads((prev) => {
				return {
					...prev,
					downloading: null,
					extracting: [...(prev.extracting || []), downloadElement],
				};
			});
			extractsRef.current[payload.key] = {
				...downloadElement,
			};
			activeDownloadRef.current = null;
		});
		addListener("fin", async (event) => {
			const payload = event.payload as any;
			const key = payload.key as string;
			info("[IMM] Extraction finished for key:", key);
			const type = payload.type || ("auto" as string);
			const finishedElement = extractsRef.current[key] || externalExtracts[key];
			if (finishedElement && type == "auto") {
				delete extractsRef.current[key];
				delete externalExtracts[key];
				if (!finishedElement.dlPath) return;
				await validateModDownload(finishedElement.dlPath);
				const now = Date.now();
				setData((prev) => {
					if (!finishedElement.path) return prev;
					return {
						...prev,
						[finishedElement.path]: {
							addedAt: now,
							...prev[finishedElement.path],
							source: finishedElement.source,
							updatedAt: finishedElement.updatedAt || now,
							installedAt: now,
							viewedAt: now,
						},
					};
				});
				setDownloads((prev) => {
					return {
						...prev,
						completed: [...(prev.completed || []), { ...finishedElement, status: "completed" } as DownloadItem],
						extracting: prev.extracting?.filter((item: any) => item.key !== key) || [],
					};
				});
				modList(await refreshModList());
				saveConfigs();
				return;
			} else if (finishedElement && type == "manual") {
				delete extractsRef.current[key];
				delete externalExtracts[key];
				if (!finishedElement.dlPath) return;
				await validateModDownload(finishedElement.dlPath, true);
				setDownloads((prev) => {
					return {
						...prev,
						completed: [...(prev.completed || []), { ...finishedElement, status: "completed" } as DownloadItem],
						extracting: prev.extracting?.filter((item: any) => item.key !== key) || [],
					};
				});
			}
			return;
		});
		addListener("download-error", (event) => {
			const payload = event.payload as any;
			markDownloadFailed(payload.key || "", payload.message || "Download failed", payload.stage || "download");
		});
		return () => {
			disposed = true;
			unlisteners.forEach((unlisten) => unlisten());
		};
	}, []);
	useEffect(() => {
		currentPathRef.current = "";
		activeDownloadRef.current = null;
		resetProgress();
	}, [game]);
	useEffect(() => {
		if (downloads && downloads.queue.length < 1) return;
		if (currentPathRef.current !== "") return;
		if (!downloads.downloading || Object.keys(downloads.downloading).length < 1) {
			let item = downloads.queue[0];
			setDownloads((prev) => {
				return {
					...prev,
					queue: downloads.queue.slice(1),
					downloading: item,
				};
			});
			downloadFile(item as DownloadItem);
		}
	}, [downloads]);
	const clearCompleted = () => {
		setDownloads((prev) => ({ ...prev, completed: [] }));
	};
	const cancelExtract = (key: string) => {
		invoke("cancel_extract", { key }).then(() => {
			setDownloads((prev) => {
				return {
					...prev,
					extracting: prev.extracting?.filter((item) => item.key !== key) || [],
				};
			});
		});
	};
	const cancelDownload = (index: number) => {
		if (index == 0 && downloads?.downloading && Object.keys(downloads.downloading).length > 0) {
			invoke("get_username").then((_) => {
				cleanCancelledDownload(currentPathRef.current);
				currentPathRef.current = "";
				activeDownloadRef.current = null;
				resetProgress();
				setDownloads((prev) => {
					return {
						...prev,
						downloading: null,
					};
				});
			});
			return;
		}
		index =
			index -
			(downloads?.downloading && Object.keys(downloads.downloading).length > 0 ? 1 : 0) -
			downloads.extracting.length;
		const type = index < downloads?.queue.length ? "queue" : "completed";
		index = type == "queue" ? index : index - downloads.queue.length;
		setDownloads((prev) => ({
			...prev,
			[type]: prev[type].filter((_: any, i: number) => i !== index),
		}));
	};
	const done = downloads?.completed?.filter((item) => item.status !== "failed").length || 0;
	let downloadList: DownloadQueueItem[] = [];
	if (downloads?.downloading && Object.keys(downloads.downloading).length > 0)
		downloadList.push({ ...downloads.downloading, status: "downloading" as const });
	if (downloads?.extracting)
		downloadList = [...downloadList, ...downloads.extracting.map((item) => ({ ...item, status: "extracting" as const }))];
	if (downloads?.queue)
		downloadList = [...downloadList, ...downloads.queue.map((item) => ({ ...item, status: "pending" as const }))];
	if (downloads?.completed)
		downloadList = [
			...downloadList,
			...downloads.completed.map((item) => ({ ...item, status: (item.status || "completed") as DownloadItem["status"] })),
		];
	return (
		<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
			<DialogTrigger asChild>
				{
					<Button
						className="text-ellipsis min-h-12 max-h-12 min-w -80 flex flex-col items-center w-full px-0 overflow-hidden"
						style={{ width: leftSidebarOpen ? "" : "3rem" }}
					>
						{leftSidebarOpen ? (
							downloadList.length > 0 ? (
								<>
									<div className="fade-in min-h-12 flex flex-col items-center justify-center w-full overflow-hidden rounded-md pointer-events-none">
										<div
											ref={downloadRef}
											key={"down" + JSON.stringify(downloadList[0])}
											className="min-h-12 height-in zzz-rounded bg-accent bgaccent text-background hover:brightness-125 z-10 flex flex-col self-start justify-center -mb-12 overflow-hidden rounded-lg"
											style={{ width: progressView.percent + "%" }}
										>
											<div className="min-w-79 fade-in flex items-center justify-center gap-1 pointer-events-none">
												{Icons[downloadList[0].status as keyof typeof Icons] || (
													<FileQuestionIcon className="min-h-4 min-w-4" />
												)}
												<Label className="min-w-2 max-w-71.5 w-fit py-2 pr-2" style={{ backgroundColor: "#fff0" }}>
													{downloadList[0].status == "downloading"
														? `${textData._LeftSideBar._components._Downloads.Downloading} ${done + 1}/${
																downloadList.length
															}`
														: `${textData._LeftSideBar._components._Downloads.Downloaded} ${done}/${downloadList.length}`}
												</Label>
											</div>
										</div>
										<div
											key={"down2" + JSON.stringify(downloadList[0])}
											className="fade-in min-h-12 flex items-center justify-center w-full gap-1 pointer-events-none"
										>
											{Icons[downloadList[0].status as keyof typeof Icons] || (
												<FileQuestionIcon className="min-h-4 min-w-4" />
											)}
											<Label className=" w-fit max-w-72 pr-2 pointer-events-none">
												{downloadList[0].status == "downloading"
													? `${textData._LeftSideBar._components._Downloads.Downloading} ${done + 1}/${
															downloadList.length
														}`
													: `${textData._LeftSideBar._components._Downloads.Downloaded} ${done}/${downloadList.length}`}
											</Label>
										</div>
									</div>
								</>
							) : (
								<div className="fade-in min-h-12 flex items-center justify-center w-full gap-1 pl-2 pointer-events-none">
									<DownloadIcon className="min-h-4 min-w-4" />
									<Label className=" w-fit max-w-72 pr-2 pointer-events-none">{textData.Downloads}</Label>
								</div>
							)
						) : downloadList.length > 0 ? (
							<>
								<div
									ref={downloadRef3}
									className="min-h-12 min-w-12 max-w-12 max-h-12 flex items-center justify-center p-1 rounded-lg"
									style={{
										background:
											"conic-gradient( var(--accent) 0% " + progressView.percent + "%, var(--button) 0% 100%)",
										transition: "minHeight 0.3s, margin-bottom 0.3s, height 0.3s",
									}}
								>
									<Label className=" bg-button zzz-rounded zzz-fg-text text-accent flex items-center justify-center w-full h-full rounded-md pointer-events-none">{`${
										done + (downloadList[0].status == "downloading" ? 1 : 0)
									}/${downloadList.length}`}</Label>
								</div>
							</>
						) : (
							<div className="min-h-12 min-w-12 flex items-center justify-center rounded-md">
								<DownloadIcon className="min-h-4 min-w-4" />
							</div>
						)}
					</Button>
				}
			</DialogTrigger>
			<DialogContent className="min-w-180 min-h-150">
				<div className="min-h-fit text-accent my-6 text-3xl">{textData.Downloads}</div>
				<div className="h-116 flex flex-col items-center w-full gap-4 p-0">
					<div className="flex justify-between w-full">
						<div className="text-accent text-lg">{`${textData._LeftSideBar._components._Downloads.Queue} (${downloadList.length})`}</div>
						<Button
							variant="outline"
							size="sm"
							onClick={clearCompleted}
							style={{ backgroundColor: "#0000" }}
							disabled={!downloadList.some((item) => item.status === "completed" || item.status === "failed")}
						>
							{textData._LeftSideBar._components._Downloads.Clear}
						</Button>
					</div>
					<div className="data-wuwa:gap-0 data-wuwa:border flex flex-col w-full h-full gap-2 overflow-y-auto text-gray-300 border-0 rounded-sm">
						{downloadList.length > 0 ? (
							<>
								{
									<div
										className="button-like zzz-fg-text data-gi:rounded-sm duration-0 min-h-16 data-wuwa:-mb-16 -mb-18 data-wuwa:border-b flex items-center w-full h-16 min-w-0 overflow-hidden"
										style={{
											opacity: downloadList[0].status === "downloading" ? 1 : 0,
										}}
									>
										<div
											key={"cur" + JSON.stringify(downloadList[0])}
											ref={downloadRef2}
											className="bg-accent bgaccent data-zzz:zzz-rounded zzz-fg-text data-gi:rounded-sm duration-0 min-h-16 flex items-center w-0 h-16 min-w-0 opacity-50"
											style={{ width: progressView.percent + "%" }}
										></div>
									</div>
								}
								{downloadList.map((item, index) => (
									<div
										key={item.name.replaceAll("DISABLED_", "") + index}
										className="hover:bg-background/20 zzz-fg-text data-gi:border-1 data-gi:rounded-sm min-h-16 data-wuwa:border-b button-like flex items-center justify-between w-full px-4"
										style={{ backgroundColor: index % 2 == 0 ? "#1b1b1b50" : "#31313150" }}
									>
										<div className=" flex items-center flex-1 w-full gap-3">
											{Icons[item.status as keyof typeof Icons] || <FileQuestionIcon className="min-h-4 min-w-4" />}
											<div className="flex flex-col flex-1 w-full">
												<Label
													className="focus:border-0 border-border/0 max-w-142 text-ellipsis w-full h-8 overflow-hidden text-white rounded-none cursor-default pointer-events-none"
													style={{ backgroundColor: "#fff0" }}
												>
													{item.name.replaceAll("DISABLED_", "")}
												</Label>
												<div className="flex gap-1 text-xs text-gray-400 capitalize">
													{`${item.status + (item.status === "extracting" ? ` ${item.fname}` : "")}`}
													<div ref={index == 0 ? speedRef : null}>
														{item.status === "failed" ? ` • ${item.error || "failed"} • ` : index == 0 ? progressView.text : " • "}
													</div>
													{item.category}
												</div>
											</div>
										</div>
										<div className="flex items-center gap-2 z-20">
											{item.status === "pending" ? (
												<Button
													variant="ghost"
													size="sm"
													onClick={() => cancelDownload(index)}
													className="hover:text-destructive"
												>
													<X className="w-4 h-4" />
												</Button>
											) : item.status === "completed" || item.status === "failed" ? (
												<Button
													variant="ghost"
													size="sm"
													onClick={() => cancelDownload(index)}
													className="hover:text-gray-300 data-zzz:border-0 text-gray-400"
												>
													<X className="w-4 h-4" />
												</Button>
											) : item.status === "downloading" ? (
												<Button
													variant="ghost"
													size="sm"
													onClick={() => cancelDownload(index)}
													className="hover:text-destructive"
												>
													<X className="w-4 h-4" />
												</Button>
											) : item.status === "extracting" ? (
												<Button
													variant="ghost"
													size="sm"
													onClick={() => cancelExtract(item.key || "")}
													className="hover:text-destructive"
												>
													<X className="w-4 h-4" />
												</Button>
											) : (
												<></>
											)}
										</div>
									</div>
								))}
							</>
						) : (
							<div className="flex items-center justify-center h-full text-gray-400">
								{textData._LeftSideBar._components._Downloads.NoQ}
							</div>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
export default Downloads;
