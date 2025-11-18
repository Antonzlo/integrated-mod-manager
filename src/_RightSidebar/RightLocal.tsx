import { Input } from "@/components/ui/input";
import {
	CATEGORIES,
	DATA,
	LAST_UPDATED,
	MOD_LIST,
	ONLINE,
	ONLINE_SELECTED,
	RIGHT_SLIDEOVER_OPEN,
	SELECTED,
	SOURCE,
	TEXT_DATA,
} from "@/utils/vars";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
	ArrowUpRightFromSquareIcon,
	CheckIcon,
	ChevronDownIcon,
	EditIcon,
	LinkIcon,
	Settings2Icon,
	TrashIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { openPath } from "@tauri-apps/plugin-opener";
import { managedSRC } from "@/utils/consts";
import { getImageUrl, handleImageError, join, modRouteFromURL } from "@/utils/utils";
import { Sidebar, SidebarContent, SidebarGroup } from "@/components/ui/sidebar";

// import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { changeModName, deleteMod, saveConfigs, savePreviewImage } from "@/utils/filesys";
import { Label } from "@/components/ui/label";
import { Mod } from "@/utils/types";
import ManageCategories from "./components/ManageCategories";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatHotkeyDisplay, normalizeHotkey } from "@/utils/hotkeyUtils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatePresence, motion } from "motion/react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent } from "@/components/ui/alert-dialog";
let text = "";
function RightLocal() {
	const [tab, setTab] = useState<"notes" | "hotkeys">("hotkeys");
	const setOnline = useSetAtom(ONLINE);
	const setOnlineSelected = useSetAtom(ONLINE_SELECTED);
	const setRightSlideOverOpen = useSetAtom(RIGHT_SLIDEOVER_OPEN);
	function handleInAppLink(url: string) {
		if (!url.startsWith("http")) return;
		let mod = modRouteFromURL(url);
		if (mod) {
			setOnline(true);
			setOnlineSelected(mod);
			setRightSlideOverOpen(true);
		}
	}
	useEffect(() => {
		const handlePaste = (event: ClipboardEvent) => {
			let activeEl = document.activeElement;
			if (activeEl?.tagName === "BUTTON") activeEl = null;
			if (activeEl === document.body || activeEl === null) {
				let text = event.clipboardData?.getData("Text");
				if (text?.startsWith("http")) {
					event.preventDefault();
					handleInAppLink(text);
				}
			}
		};
		document.addEventListener("paste", handlePaste);
		return () => document.removeEventListener("paste", handlePaste);
	}, []);
	const categories = useAtomValue(CATEGORIES);
	const source = useAtomValue(SOURCE);
	const [deleteItemData, setDeleteItemData] = useState<Mod | null>(null);

	const [modList, setModList] = useAtom(MOD_LIST);
	const [selected, setSelected] = useAtom(SELECTED);
	const textData = useAtomValue(TEXT_DATA);
	const setData = useSetAtom(DATA);
	const [item, setItem] = useState<Mod | undefined>();
	const [dialogOpen, setDialogOpen] = useState(false);
	const [alertOpen, setAlertOpen] = useState(false);
	const [popoverOpen, setPopoverOpen] = useState(false);
	useEffect(() => {
		if (!alertOpen) {
			setDeleteItemData(null);
		}
	}, [alertOpen]);
	function manageCategoriesButton({ title = textData._RightSideBar._components._ManageCategories.ManageCat }: any) {
		return (
			<Button
				onClick={() => {
					setPopoverOpen(false);
					setDialogOpen(true);
				}}
				className="w-full mx-2 my-1"
			>
				<Settings2Icon className="w-4 h-4" />
				{title}
			</Button>
		);
	}
	const [category, setCategory] = useState({ name: "-1", icon: "" });
	const lastUpdated = useAtomValue(LAST_UPDATED);
	function renameMod(path: string, newPath: string) {
		changeModName(path, newPath).then((newPath) => {
			if (newPath) {
				setData((prev) => {
					if (prev[path]) {
						prev[newPath] = { ...prev[path] };
						delete prev[path];
					}
					return prev;
				});
				saveConfigs();
				const name = newPath.split("\\").pop();
				name &&
					newPath &&
					setModList((prev) => {
						return prev.map((m) => {
							if (m.path == path) {
								return { ...m, path: newPath, name, parent: newPath.split("\\")[0] };
							}
							return m;
						});
					});
				setSelected(newPath);
			}
		});
	}
	useEffect(() => {
		text = "";
		if (selected) {
			const mod = modList.find((m) => m.path == selected);
			text = mod?.note || "";
			setItem(mod);
		} else setItem(undefined);
	}, [selected]);
	useEffect(() => {
		if (item) {
			const cat = categories.find((c) => c._sName == item.parent) || { _sName: "-1", _sIconUrl: "" };
			setCategory({ name: cat._sName, icon: cat._sIconUrl });
		} else {
			setCategory({ name: "-1", icon: "" });
		}
	}, [item, modList]);
	return (
		<Sidebar side="right" className="bg-sidebar duration-300">
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<ManageCategories />
			</Dialog>
			<AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
				<AlertDialogContent>
					<div className="max-w-96 flex flex-col items-center gap-6 mt-6 text-center">
						<div className="max-w-96 text-xl text-gray-200 break-words">
							{textData._Main._MainLocal.Delete} <span className="text-accent ">{deleteItemData?.name}</span>?
						</div>
						<div className="text-destructive">{textData._Main._MainLocal.Irrev}</div>
					</div>
					<div className="flex justify-between w-full gap-4 mt-4">
						<AlertDialogCancel variant="default" className="w-24 duration-300">
							{textData.Cancel}
						</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							className=" w-24"
							onClick={async () => {
								if (!deleteItemData) return;
								setData((prev) => {
									const newData = { ...prev };
									if (deleteItemData.path) {
										delete newData[deleteItemData.path];
									}
									return newData;
								});
								deleteMod(deleteItemData.path);
								saveConfigs();
								setModList((prev) => {
									const newData = prev.filter((m) => m.path != deleteItemData.path);
									return newData;
								});
								setAlertOpen(false);
								setSelected("");
								// let items = await refreshRootDir("");
								// setRightSidebarOpen(false);
								// setLocalModList(items);
								// saveConfig();
							}}
						>
							{textData._Main._MainLocal.Delete}
						</AlertDialogAction>
					</div>
				</AlertDialogContent>
			</AlertDialog>
			<SidebarContent className="polka flex flex-row w-full h-full gap-0 p-0 overflow-hidden duration-300 border border-l-0">
				<div className=" flex flex-col items-center h-full min-w-full overflow-y-hidden" key={item?.path || "no-item"}>
					<div className="text-accent min-h-16 flex items-center justify-center h-16 min-w-full gap-3 px-3 border-b">
						{item ? (
							<>
								<Button
									className="aspect-square"
									onClick={() => {
										openPath(join(source, managedSRC, item.path));
									}}
								>
									<ArrowUpRightFromSquareIcon className="w-4 h-4" />
								</Button>
								<Input
									onFocus={(e) => {
										e.target.select();
									}}
									onBlur={(e) => {
										if (e.currentTarget.value != item.name) {
											renameMod(item.path, join(...item.path.split("\\").slice(0, -1), e.currentTarget.value));
										}
									}}
									type="text"
									key={item?.name || "no-item"}
									className="label text-muted-foreground"
									defaultValue={item?.name || ""}
								/>
								<Button
									className="aspect-square"
									variant="destructive"
									onClick={() => {
										setDeleteItemData((prev) => {
											if (prev) return prev;
											setAlertOpen(true);
											return item;
										});
									}}
								>
									<TrashIcon className="w-4 h-4" />
								</Button>
							</>
						) : (
							"---"
						)}
					</div>
					<SidebarGroup className="min-h-82 px-1 mt-1 select-none">
						<EditIcon
							onClick={() => {
								item && savePreviewImage(item.path);
							}}
							className="min-h-12 min-w-12 bg-background/50 z-25 text-accent data-zzz:rounded-tr-2xl data-zzz:rounded-bl-2xl rounded-tr-md rounded-bl-md self-end w-12 p-3 -mb-12 border"
						/>
						<img
							id="preview"
							className="w-82 h-82 data-zzz:rounded-[1px] data-zzz:rounded-tr-2xl data-zzz:rounded-bl-2xl bg-background/50 object-cover duration-150 border rounded-lg"
							onError={(e) => handleImageError(e)}
							src={`${getImageUrl(item?.path || "")}?${lastUpdated}`}
						></img>
					</SidebarGroup>
					<SidebarGroup className="px-1 min-h-27.5 my-1">
						<div className="flex flex-col w-full border rounded-lg">
							<div className="bg-pat2 flex items-center justify-between w-full p-1 rounded-lg">
								<Label className=" h-12  flex items-center justify-center  min-w-28.5 w-28.5 text-accent ">
									{textData.Category}
								</Label>
								{item?.depth == 1 ? (
									<Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
										<PopoverTrigger asChild>
											<div
												role="combobox"
												className="overflow-hidden text-ellipsis active:scale-90 whitespace-nowrap rounded-md text-sm font-medium transition-all p-2 gap-2 bg-sidebar text-accent shadow-xs hover:brightness-120  duration-300 h-12 flex items-center justify-between w-48.5"
											>
												{category.name != "-1" ? (
													<>
														{" "}
														{category.name != "Uncategorized" && (
															<img
																className=" aspect-square scale-120 outline bg-accent/10 items-center justify-center h-full text-white rounded-full pointer-events-none"
																onError={(e) => {
																	e.currentTarget.src = "/who.jpg";
																}}
																src={category.icon || "err"}
															/>
														)}
														<div className="w-30 text-ellipsis overflow-hidden break-words pointer-events-none">
															{category.name}
														</div>
													</>
												) : (
													textData.Select
												)}
												<ChevronDownIcon />
											</div>
										</PopoverTrigger>
										<PopoverContent className="w-80 p-0 my-2 mr-2 border rounded-lg">
											<Command>
												<CommandInput placeholder={textData.Search} className="h-12" />
												<CommandList>
													<CommandEmpty>{textData._RightSideBar._RightLocal.NoCat}</CommandEmpty>
													<CommandGroup>
														{categories.map((cat) => (
															<CommandItem
																key={cat._sName}
																value={cat._sName}
																onSelect={(currentValue) => {
																	renameMod(item.path, join(currentValue, item.name));
																	setPopoverOpen(false);
																}}
																className="button-like zzz-fg-text data-zzz:mt-1"
															>
																<img
																	className="aspect-square outline bg-accent/10 flex items-center justify-center h-12 text-white rounded-full pointer-events-none"
																	onError={(e) => {
																		e.currentTarget.src = "/who.jpg";
																	}}
																	src={cat._sIconUrl || "err"}
																/>

																<div className="w-35 min-w-fit text-ellipsis overflow-hidden break-words">
																	{cat._sName}
																</div>
																<CheckIcon
																	className={cn("ml-auto", category.name === cat._sName ? "opacity-100" : "opacity-0")}
																/>
															</CommandItem>
														))}
													</CommandGroup>
												</CommandList>

												{/* <div className="pr-5">{manageCategoriesButton({})}</div> */}
											</Command>
										</PopoverContent>
									</Popover>
								) : (
									<div className="w-48.5 flex items-center pr-2">
										{manageCategoriesButton({ title: textData._RightSideBar._RightLocal.Manage })}
									</div>
								)}
							</div>
							<div className="bg-pat1 flex justify-between w-full p-1 rounded-lg">
								<Label className="bg-input/0 flex items-center justify-center hover:bg-input/0 h-12 w-28.5 text-accent ">
									{textData._RightSideBar._RightLocal.Source}
								</Label>
								<div className="w-48.5 flex items-center px-1">
									<Input
										onBlur={(e) => {
											if (item && e.currentTarget.value !== item?.source) {
												setData((prev) => {
													prev[item.path] = {
														...prev[item.path],
														source: e.currentTarget.value,
														updatedAt: Date.now(),
														viewedAt: 0,
													};
													return { ...prev };
												});
												setModList((prev) => {
													return prev.map((m) => {
														if (m.path == item.path) {
															return { ...m, source: e.currentTarget.value };
														}
														return m;
													});
												});
												saveConfigs();
											}
										}}
										type="text"
										placeholder={textData._RightSideBar._RightLocal.NoSource}
										className="w-full select-none focus-within:select-auto overflow-hidden h-12 focus-visible:ring-[0px] border-0  text-ellipsis"
										style={{ backgroundColor: "#fff0" }}
										key={item?.source}
										defaultValue={item?.source}
									/>
									<div
										className="bg-pat2 hover:brightness-150 p-2 duration-200 rounded-lg"
										onClick={() => {
											if (item?.source && item?.source != "") {
												handleInAppLink(item.source || "");
											}
										}}
									>
										<LinkIcon className=" w-4 h-4" />
									</div>
									{}
								</div>
							</div>
						</div>
					</SidebarGroup>
					<SidebarGroup
						className="h-full duration-200 opacity-0"
						style={{
							opacity: item ? 1 : 0,
						}}
					>
						<div className=" flex flex-col w-full h-full p-2 overflow-hidden">
							<Tabs defaultValue={tab} onValueChange={(val: any) => setTab(val)} className="w-full min-h-full">
								<TabsList className="bg-background/0 w-full gap-2">
									<TabsTrigger
										value="hotkeys"
										nbg2
										className="transparent-bg w-1/2 h-10"
										style={{
											color: tab == "hotkeys" ? "var(--accent)" : "var(--muted-foreground)",
											border: "1px solid var(--border)",
											opacity: tab == "hotkeys" ? 1 : 0.4,
										}}
									>
										{textData._RightSideBar._RightLocal.HotKeys}
									</TabsTrigger>
									<TabsTrigger
										nbg2
										value="notes"
										className="transparent-bg w-1/2 h-10"
										style={{
											color: tab !== "hotkeys" ? "var(--accent)" : "var(--muted-foreground)",
											border: "1px solid var(--border)",
											opacity: tab !== "hotkeys" ? 1 : 0.4,
										}}
									>
										{textData._RightSideBar._RightLocal.Notes}
									</TabsTrigger>
								</TabsList>
								<AnimatePresence mode="wait" initial={false}>
									<motion.div
										key={tab + item?.note}
										initial={{ opacity: 0, x: tab == "hotkeys" ? "-25%" : "25%" }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: tab == "hotkeys" ? "-25%" : "25%" }}
										transition={{ duration: 0.2 }}
										className="flex w-full h-full gap-2 border rounded-md"
									>
										{tab == "hotkeys" ? (
											<div className="text-gray-300 h-full max-h-[calc(100vh-36.75rem)] flex flex-col w-full overflow-y-scroll overflow-x-hidden">
												{item?.keys?.map((hotkey, index) => (
													<div
														key={index + item.path}
														className={
															"flex border-b justify-center text-border items-center gap-2 w-full min-h-12 px-4 py-2 bg-pat" +
															(1 + (index % 2))
														}
													>
														<label className="min-w-1/3 max-w-1/3 text-accent flex-1 text-sm truncate">
															{hotkey.name}
														</label>
														|
														<div className=" flex items-center w-2/3 gap-1">
															{formatHotkeyDisplay(normalizeHotkey(hotkey.key))
																.split(" ﹢ ")
																.map((key, i, arr) => (
																	<span key={i} className="flex items-center">
																		<kbd className="text-accent bg-sidebar border-border min-w-8 px-2 py-1 text-sm font-semibold text-center border rounded-md shadow-sm">
																			{key}
																		</kbd>
																		{i < arr.length - 1 && (
																			<span className="text-muted-foreground mx-1 text-xs">+</span>
																		)}
																	</span>
																))}
														</div>
													</div>
												))}
											</div>
										) : (
											<div className="w-full h-full p-2">
												<textarea
													onBlur={(e) => {
														text = e.currentTarget.value;
														if (item && e.currentTarget.value !== item?.note) {
															setData((prev) => {
																prev[item.path] = {
																	...prev[item.path],
																	note: e.currentTarget.value,
																};
																return { ...prev };
															});
															setModList((prev) => {
																return prev.map((m) => {
																	if (m.path == item.path) {
																		return { ...m, note: e.currentTarget.value };
																	}
																	return m;
																});
															});
															saveConfigs();
														}
													}}
													className="w-full focus-within:outline-0 resize-none  select-none focus-within:select-auto overflow-y-scroll h-full  focus-visible:ring-[0px] border-0  text-ellipsis"
													style={{ backgroundColor: "#fff0" }}
													key={item?.note}
													placeholder={textData._RightSideBar._RightLocal.NoNotes}
													defaultValue={text}
												/>
											</div>
										)}
									</motion.div>
								</AnimatePresence>
							</Tabs>
						</div>
					</SidebarGroup>
				</div>
			</SidebarContent>
		</Sidebar>
	);
}

export default RightLocal;
