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
	FileIcon,
	FolderIcon,
	LinkIcon,
	Settings2Icon,
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
import { changeModName, saveConfigs, savePreviewImage } from "@/utils/filesys";
import { Label } from "@/components/ui/label";
import { Mod } from "@/utils/types";
import ManageCategories from "./components/ManageCategories";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function RightLocal() {
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
	const [modList, setModList] = useAtom(MOD_LIST);
	const [selected, setSelected] = useAtom(SELECTED);
	const textData = useAtomValue(TEXT_DATA);
	const setData = useSetAtom(DATA);
	const [item, setItem] = useState<Mod | undefined>();
	const [dialogOpen, setDialogOpen] = useState(false);
	const [popoverOpen, setPopoverOpen] = useState(false);
	function manageCategoriesButton({ title = "Manage Categories" }: any) {
		return (
			<Button
				onClick={() => {
					setPopoverOpen(false);
					setDialogOpen(true);
			}}
			className="my-1 w-full mx-2">
				<Settings2Icon className="h-4 w-4" />
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
		if (selected) {
			const mod = modList.find((m) => m.path == selected);
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
			<SidebarContent className="flex polka duration-300 flex-row w-full h-full gap-0 p-0 overflow-hidden border border-l-0">
				<div className="flex flex-col items-center h-full min-w-full overflow-y-hidden " key={item?.path || "no-item"}>
					<div className="min-w-full text-accent flex items-center justify-center h-16 gap-3 px-3 border-b">
						{item ? (
							<>
								{item.isDir ? <FolderIcon className="scale-120" /> : <FileIcon className="scale-120" />}
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
								<div
									className="min-h-8 text-accent hover:border-border border-border/0 min-w-8 bg-pat2 hover:bg-pat1 flex items-center justify-center p-2 duration-200 border rounded-lg"
									onClick={() => {
										openPath(join(source, managedSRC, item.path));
									}}
								>
									<ArrowUpRightFromSquareIcon className="w-full h-full" />
								</div>
							</>
						) : (
							"---"
						)}
					</div>
					<SidebarGroup className="min-h-82  px-1 mt-1 select-none">
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
					<SidebarGroup className="px-1 min-h-42.5 mt-1">
						<div className="flex flex-col w-full border  rounded-lg">
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
																className=" items-center justify-center h-full rounded-full pointer-events-none aspect-square scale-120 outline bg-accent/10 text-white "
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
																className="data-zzz:rounded-full data-zzz:text-foreground data-zzz:mt-1 data-zzz:border-2"
															>
																<img
																	className="aspect-square outline bg-accent/10 flex text-white items-center justify-center h-12 rounded-full pointer-events-none"
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

												{manageCategoriesButton({})}
											</Command>
										</PopoverContent>
									</Popover>
								) : (
									<div className="w-48.5 flex items-center pr-2">{manageCategoriesButton({title:"Manage"})}</div>
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
							<div className="bg-pat2 flex justify-between w-full p-1 rounded-lg">
								<Label className="bg-input/0  flex items-center justify-center hover:bg-input/0 h-12 w-28.5 text-accent ">
									{textData._RightSideBar._RightLocal.Notes}
								</Label>
								<div className="w-48.5 flex items-center px-1">
									<Input
										onBlur={(e) => {
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
										type="text"
										className="w-full select-none focus-within:select-auto overflow-hidden h-12 focus-visible:ring-[0px] border-0  text-ellipsis"
										style={{ backgroundColor: "#fff0" }}
										key={item?.note}
										placeholder={textData._RightSideBar._RightLocal.NoNotes}
										defaultValue={item?.note}
									/>
								</div>
							</div>
						</div>
					</SidebarGroup>
					<SidebarGroup
						className="px-1 my-1 duration-200 opacity-0"
						style={{
							opacity: item && item?.keys?.length > 0 ? 1 : 0,
						}}
					>
						<div className="flex flex-col w-full h-full overflow-hidden border rounded-lg">
							<div className="bg-pat1 text-accent min-h-14 flex items-center justify-center w-full p-1 rounded-lg">
								{textData._RightSideBar._RightLocal.HotKeys}
							</div>
							<div className="w-full h-full">
								<div className="text-gray-300 h-full max-h-[calc(100vh-39.75rem)] w-full overflow-y-auto overflow-x-hidden">
									<div className="min-h-8 text-accent bg-pat2 flex items-center justify-center">
										<label className="text-c w-1/2 px-4">{textData._RightSideBar._RightLocal.Key}</label>
										<label className="text-c w-1/2 px-4">{textData._RightSideBar._RightLocal.Action}</label>
									</div>
									{item?.keys?.map((hotkey, index) => (
										<div
											key={index + item.path}
											className={"flex w-full items-center justify-center h-8 bg-pat" + (1 + (index % 2))}
										>
											<label className="text-c w-1/2 px-4">{hotkey.key}</label>
											<label className="text-c w-1/2 px-4">{hotkey.name}</label>
										</div>
									))}
								</div>
							</div>
						</div>
					</SidebarGroup>
				</div>
			</SidebarContent>
		</Sidebar>
	);
}

export default RightLocal;
