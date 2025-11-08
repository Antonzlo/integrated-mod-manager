import { addToast } from "@/_Toaster/ToastProvider";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { managedSRC, managedTGT, RESTORE, UNCATEGORIZED } from "@/utils/consts";
import {
	addToBatchPreview,
	changeModName,
	folderSelector,
	refreshModList,
	sourceBatchPreview,
	toggleMod,
} from "@/utils/filesys";
import { join } from "@/utils/hotreload";
import { CATEGORIES, MOD_LIST, SOURCE, TARGET, TEXT_DATA } from "@/utils/vars";
import { remove, rename } from "@tauri-apps/plugin-fs";
import { openPath } from "@tauri-apps/plugin-opener";
import { useAtomValue, useSetAtom } from "jotai";
import {
	CheckIcon,
	ChevronRightIcon,
	FileIcon,
	FolderCogIcon,
	FolderIcon,
	FolderInputIcon,
	GroupIcon,
	Maximize2Icon,
	Minimize2Icon,
	Settings2Icon,
	TrashIcon,
	XIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

type BatchNode = {
	children?: BatchNode[];
	depth: number;
	icon?: string;
	isDir: boolean;
	name: string;
	parent: string;
	path: string;
	isSkeleton?: boolean;
};
function editChild(name: string, parent: string[], treeData: BatchNode[], children: BatchNode[]): BatchNode[] {
	return treeData
		? treeData.map((node) => {
				if (node.name === name && node.parent === parent.join("\\")) {
					return {
						...node,
						children,
					};
				} else if (node.children) {
					return { ...node, children: editChild(name, parent, node.children, children) };
				}
				return node;
		  })
		: [];
}
function getChildrenAtPath(nodes: BatchNode[], indexPath: number[]): BatchNode[] {
	if (indexPath.length === 0) return nodes;
	let currentNodes = nodes;
	let current: BatchNode | undefined;
	for (const idx of indexPath) {
		current = currentNodes[idx];
		if (!current) return [];
		currentNodes = current.children || [];
	}
	return current?.children || [];
}
function normalizeManagedMods(targets: string[], tree: BatchNode[], categories: any[]): string[] {
	const normalized: Set<string> = new Set();
	categories = [...categories.map((cat) => cat._sName), UNCATEGORIZED];
	if (!targets.includes(managedSRC)) {
		categories = targets.filter((t) => t.split("\\").length == 2).map((t) => t.split("\\")[1]);
		targets.forEach((t) => {
			if (t.split("\\").length == 3) normalized.add(t);
		});
		// console.log(cats,mods);
	}
	function handleCategories(category: BatchNode) {
		// const isValid = categories.some((cat) => cat === category.name) ;
		if (categories.includes(category.name) && category.name !== RESTORE) {
			category.children?.forEach((mod) => {
				normalized.add(mod.path);
			});
		}
	}
	// console.log("Categories:",categories);
	tree.forEach((node) => {
		if (node.name === managedSRC) {
			node.children?.forEach((category) => {
				handleCategories(category);
			});
		}
	});
	// console.log("Normalized:", normalized);
	return Array.from(normalized.keys()) || [];
}
let prevSelectedIndices = [] as number[];
function BatchOperations({ leftSidebarOpen }: { leftSidebarOpen: boolean }) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [refresh, setRefresh] = useState(0);
	const [alertOpen, setAlertOpen] = useState(false);
	const [popoverOpen, setPopoverOpen] = useState(false);
	const textData = useAtomValue(TEXT_DATA);
	const [treeData, setTreeData] = useState<BatchNode[]>([]);
	const [expanded, setExpanded] = useState<Set<string>>(new Set());
	const [checked, setChecked] = useState<Set<string>>(new Set());
	const [shiftDown, setShiftDown] = useState<boolean>(false);
	const setModList = useSetAtom(MOD_LIST);
	const [curSelectedIndices, setCurSelectedIndices] = useState<number[]>([]);
	const cleanChecked = useMemo(() => {
		return Array.from(checked).filter((path) => {
			let isRedundant = false;
			checked.forEach((otherPath) => {
				if (otherPath !== path && path.startsWith(otherPath + "\\")) {
					isRedundant = true;
				}
			});
			return !isRedundant;
		});
	}, [checked]);
	useEffect(() => {
		if (checked.size === 0 && curSelectedIndices.length >0 ) {
			setCurSelectedIndices([]);
			prevSelectedIndices = [];
		} else {
			if (shiftDown && prevSelectedIndices.length > 0 && curSelectedIndices.length > 0) {
				const prevPath = [...prevSelectedIndices];
				const curPath = [...curSelectedIndices];
				const maxPrefix = Math.min(prevPath.length, curPath.length);
				let prefixLen = 0;
				while (prefixLen < maxPrefix && prevPath[prefixLen] === curPath[prefixLen]) {
					prefixLen++;
				}
				const common = prevPath.slice(0, prefixLen);
				const prevRemainder = prevPath.slice(prefixLen);
				const curRemainder = curPath.slice(prefixLen);
				const sameDepth = prevRemainder.length === curRemainder.length;
				if (sameDepth && prevRemainder.length === 1 && curRemainder.length === 1) {
					const siblings = getChildrenAtPath(treeData, common);
					if (siblings.length > 0) {
						const startIndex = Math.min(prevRemainder[0], curRemainder[0]);
						const endIndex = Math.max(prevRemainder[0], curRemainder[0]);
						const newChecked = new Set(checked);
						let changed = false;
						for (let i = startIndex; i <= endIndex; i++) {
							const node = siblings[i];
							if (!node) continue;
							if (!newChecked.has(node.path)) {
								newChecked.add(node.path);
								changed = true;
							}
						}
						if (changed) {
							setChecked(newChecked);
						}
					}
				}
				prevSelectedIndices = [...curPath];
			} else {
				prevSelectedIndices = [...curSelectedIndices];
			}
		}
	}, [checked, curSelectedIndices, shiftDown, treeData]);
	const source = useAtomValue(SOURCE);
	const target = useAtomValue(TARGET);
	const categories = useAtomValue(CATEGORIES);
	// console.log(normalizeManagedMods(cleanChecked, treeData, categories));
	function toggleSelectedMods(enable: boolean) {
		const promises = normalizeManagedMods(cleanChecked, treeData, categories).map((modPath) => {
			return toggleMod(modPath.replaceAll(managedSRC, ""), enable);
		});
		Promise.all(promises).then(() => {
			addToast({
				type: "success",
				message: `${enable ? "Enabled" : "Disabled"} ${promises.length} mod(s)`,
			});
		});
	}
	const toggleValid = useMemo(() => {
		return (
			cleanChecked.filter((path) => path.startsWith(managedSRC) && path.split("\\").length <= 3).length ==
				cleanChecked.length && cleanChecked.length > 0
		);
	}, [cleanChecked, treeData]);
	const moveValid = useMemo(() => {
		// console.log(cleanChecked.filter((path) => path.startsWith(managedSRC) && path.split("\\").length == 3).length, cleanChecked.filter((path)  => !path.startsWith(managedSRC) && path.split("\\").length == 1).length, cleanChecked.length );
		return (
			cleanChecked.filter((path) => path.startsWith(managedSRC) && path.split("\\").length == 3).length +
				cleanChecked.filter((path) => !path.startsWith(managedSRC) && path.split("\\").length == 1).length ==
				cleanChecked.length && cleanChecked.length > 0
		);
	}, [cleanChecked, treeData]);
	const deleteValid = useMemo(() => {
		return !(cleanChecked.includes(managedSRC) || cleanChecked.length == 0);
	}, [cleanChecked, treeData]);
	const [isMaximized, setIsMaximized] = useState<boolean>(false);
	useEffect(() => {
		if (!dialogOpen) {
			setTreeData([]);
			refreshModList().then((data) => {
				setModList(data);
			});

			return;
		}
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Shift") {
				setShiftDown(true);
				event.preventDefault();
			}
		};
		const handleKeyUp = (event: KeyboardEvent) => {
			if (event.key === "Shift") {
				setShiftDown(false);
				event.preventDefault();
			}
		};
		let cancelled = false;
		const loadTree = async () => {
			try {
				const entries = (await sourceBatchPreview()) as BatchNode[] | undefined;
				if (!cancelled && entries) {
					setTreeData([...entries]);
					setExpanded(new Set(entries.filter((entry) => entry.path === managedSRC).map((entry) => entry.path)));
				}
			} catch (error) {
				console.error("[IMM] Error loading batch preview tree:", error);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);
		loadTree();
		return () => {
			cancelled = true;
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
		};
	}, [dialogOpen, refresh]);
	const renderChildren = (nodes: BatchNode[], depth = 0, indices: number[] = []): JSX.Element[] => {
		return nodes.map((item, index) => (
			<div
				className={`w-full flex  ${depth > 0 && "border-l-1"} select-none pointer-events-auto flex-col`}
				style={{
					backgroundColor: checked.has(item.path)
						? index % 2 == 0
							? `color-mix(in oklab, var(--warn) 20%, ${index % 2 == 0 ? "#1b1b1b50" : "#31313150"})`
							: `color-mix(in oklab, var(--warn) 30%, ${index % 2 == 0 ? "#1b1b1b50" : "#31313150"})`
						: index % 2 == 0
						? "#1b1b1b50"
						: "#31313150",
				}}
				onClick={(e) => {
					if (e.target !== e.currentTarget || item.path === managedTGT) return;
					const newExpanded = new Set(expanded);
					if (expanded.has(item.path) || item.path === managedTGT) {
						newExpanded.delete(item.path);
					} else {
						if (item.children && item.children.length === 0) {
							const path = item.path.split("\\").slice(0, -1);
							setTreeData((prev) => {
								return [
									...editChild(item.name, path, prev, [
										{
											depth: item.depth + 1,
											isDir: false,
											name: "Loading...",
											parent: item.path,
											path: `${item.path}\\Loading...`,
											isSkeleton: true,
										},
									]),
								];
							});
							addToBatchPreview(item.path).then((children) => {
								// setTimeout(() => {
								setTreeData((prev) => {
									return [...editChild(item.name, path, prev, children)];
								});
								// }, 100);
							});
						}
						newExpanded.add(item.path);
					}
					setExpanded(newExpanded);
				}}
			>
				<div
					className={
						"w-full h-10 flex gap-2 pointer-events-none items-center pr-2 " +
						(index !== 0 ? "border-t " : "") +
						(index !== nodes.length - 1 || item.children?.length || 0 > 0 ? "border-b" : "")
					}
				>
					{" "}
					{item.isSkeleton ? (
						<div className="min-w-8"></div>
					) : (
						<>
							<ChevronRightIcon
								onClick={() => {
									const newExpanded = new Set(expanded);
									if (expanded.has(item.path) || item.path === managedTGT) {
										newExpanded.delete(item.path);
									} else {
										if (item.children && item.children.length === 0) {
											const path = item.path.split("\\").slice(0, -1);
											setTreeData((prev) => {
												return [
													...editChild(item.name, path, prev, [
														{
															depth: item.depth + 1,
															isDir: false,
															name: "Loading...",
															parent: item.path,
															path: `${item.path}\\Loading...`,
															isSkeleton: true,
														},
													]),
												];
											});
											addToBatchPreview(item.path).then((children) => {
												// setTimeout(() => {
												setTreeData((prev) => {
													return [...editChild(item.name, path, prev, children)];
												});
												// }, 100);
											});
										}
										newExpanded.add(item.path);
									}
									setExpanded(newExpanded);
								}}
								className="pl-2 w-6 h-4 min-w-6 pointer-events-auto duration-200 cursor-pointer"
								style={{
									transform:
										expanded.has(item.path) && !checked.has(item.path)
											? "rotate(90deg) translateX(-5px) translateY(-2px)"
											: "",
									opacity: item.path === managedTGT ? 0.25 : item.isDir ? 1 : 0,
								}}
							/>
							<Checkbox
								disabled={item.path === managedTGT}
								checked={checked.has(item.path)}
								className="pointer-events-auto z-20 mr-2"
								onCheckedChange={() => {
									const newChecked = new Set(checked);
									if (shiftDown && prevSelectedIndices.length > 0) {
										setCurSelectedIndices([...indices, index]);
										return;
									}
									setCurSelectedIndices([...indices, index]);
									if (newChecked.has(item.path)) {
										newChecked.delete(item.path);
									} else {
										newChecked.add(item.path);
									}
									setChecked(newChecked);
								}}
								style={{
									opacity: checked.has(item.path) ? 0.5 : "",
								}}
							/>
							{item.icon ? (
								<img src={item.icon} className="w-6 min-w-6 h-6 -ml-1 -mr-1 overflow-hidden rounded-full" alt="icon" />
							) : item.name == UNCATEGORIZED ? (
								<FolderCogIcon className="aspect-square w-5 h-5 -mr-1 pointer-events-none" />
							) : item.path === managedSRC ? (
								<label className="text-[0.6rem] px-1 wuwa-font border rounded-full text-success border-success/50 pointer-events-none">
									Source
								</label>
							) : item.path === managedTGT && source === target + "\\Mods" ? (
								<label className="text-[0.6rem] px-[5px] wuwa-font border rounded-full text-warn border-warn/50 pointer-events-none">
									Target
								</label>
							) : item.isDir ? (
								<FolderIcon className="w-4 h-4" />
							) : (
								<FileIcon className="w-4 h-4" />
							)}
						</>
					)}
					<Label className={"w-full pointer-events-none " + ((index % 2) + 1)}>{item.name}</Label>
					{item.path === managedTGT ? (
						<label className="text-destructive opacity-50 min-w-fit text-xs"> Cannot modify</label>
					) : (
						<></>
					)}
				</div>
				<AnimatePresence>
					{expanded.has(item.path) && !checked.has(item.path) && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							key={item.children?.length}
							className="flex1 flex-col items-center w-full pl-6  "
						>
							{renderChildren(
								item.children && item.children.length > 0
									? item.children
									: [
											{
												depth: item.depth + 1,
												isDir: false,
												name: "Empty Folder",
												parent: item.path,
												path: `${item.path}\\Loading...`,
												isSkeleton: true,
											},
									  ],
								depth + 1,
								[...indices, index]
							)}
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		));
	};

	return (
		<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
			<DialogTrigger asChild>
				<Button
					className="w-38.75 data-[theme=zzz]:bg-destructive text-ellipsis h-12 overflow-hidden"
					style={{ width: leftSidebarOpen ? "" : "3rem" }}
				>
					{/* <SaveAllIcon /> */}
					<GroupIcon />
					{"Batch Ops"}
					{/* {leftSidebarOpen && textData._LeftSideBar._components._Restore.Restore} */}
				</Button>
			</DialogTrigger>
			<DialogContent
				style={{
					maxHeight: isMaximized ? "98vh" : "",
					height: isMaximized ? "98vh" : "",
					maxWidth: isMaximized ? "98vw" : "",
					width: isMaximized ? "98vw" : "",
				}}
			>
				<Tooltip>
					<TooltipTrigger></TooltipTrigger>
					<TooltipContent className="opacity-0"></TooltipContent>
				</Tooltip>
				<AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
					<AlertDialogContent>
						<div className="max-w-96 flex flex-col items-center gap-6 mt-6 text-center">
							<div className="text-xl text-gray-200">
								{textData._Main._MainLocal.Delete} <span className="text-warn ">{cleanChecked.length} item(s)</span>?
							</div>
							<div className="text-destructive">{textData._Main._MainLocal.Irrev}</div>
						</div>
						<div className="flex justify-between w-full gap-4 mt-4">
							<AlertDialogCancel className="w-24 duration-300">{textData.Cancel}</AlertDialogCancel>
							<AlertDialogAction
								className="w-24 text-destructive hover:bg-destructive data-zzz:hover:text-background hover:text-background"
								onClick={async () => {
									if (!deleteValid || cleanChecked.length === 0) return;
									setAlertOpen(false);
									const promises = cleanChecked.map((modPath) => {
										return remove(join(source, modPath));
									});
									addToast({
										type: "success",
										message: `Deleting ${promises.length} item(s)`,
									});
									Promise.all(promises).then(() => {
										setChecked(new Set());
										setRefresh((prev) => prev + 1);
										addToast({
											type: "success",
											message: `Successfully deleted ${promises.length} item(s)`,
										});
									});
								}}
							>
								{textData._Main._MainLocal.Delete}
							</AlertDialogAction>
						</div>
					</AlertDialogContent>
				</AlertDialog>
				<div
					onClick={() => {
						setIsMaximized((prev) => !prev);
					}}
					className="ring-offset-background data-[state=open]:bg-accent scale-80  data-[state=open]:text-muted-foreground absolute top-4 right-10 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
				>
					{isMaximized ? <Minimize2Icon /> : <Maximize2Icon />}
				</div>
				<div className="min-h-fit text-accent my-6 text-3xl">Batch Operations</div>
				<label className="text-muted min-h-10 -mb-4 flex gap-1 items-center z-200">
					Showing content from:
					<label
						onClick={() => {
							openPath(source);
						}}
						className="text-blue-300 opacity-50 duration-200 hover:opacity-75 pointer-events-auto"
					>
						...\{source.split("\\").slice(-3).join("\\")}
					</label>
				</label>
				<label className="text-muted w-full justify-between min-h-10 -mb-4 flex gap-1 items-center z-200">
					Items selected: {cleanChecked.length}
					<label
						onClick={() => {
							setChecked(new Set());
						}}
						className="text-destructive ml-2 text-sm opacity-50 duration-200 hover:opacity-75 pointer-events-auto"
					>
						[Deselect all]
					</label>
				</label>
				<div
					className="flex flex-col w-full h-full overflow-x-hidden overflow-y-scroll text-gray-300 border rounded-sm"
					style={{
						maxHeight: isMaximized ? "100%" : "24rem",
						height: isMaximized ? "100%" : "24rem",
					}}
				>
					{renderChildren(treeData)}
				</div>
				<div className="flex w-110 gap-2 items-center flex-wrap justify-evenly">
					<Button
						disabled={!toggleValid}
						onClick={() => toggleSelectedMods(true)}
						className="w-34.5 active:bg-success/80 group"
					>
						<CheckIcon className="text-success/80 group-active:text-background duration-300" />
						Enable
					</Button>
					<Button
						disabled={!moveValid}
						onClick={() => {
							const selected = [...cleanChecked];
							folderSelector(source, "Select destination").then((dest) => {
								if (!dest) return;
								const promises = selected.map((modPath) => {
									const modName = modPath.split("\\").slice(-1)[0];
									const newPath = dest + "\\" + modName;
									return rename(join(source, modPath), newPath);
								});
								addToast({
									type: "success",
									message: `Moving ${selected.length} mod(s)`,
								});
								Promise.all(promises).then(() => {
									setChecked(new Set());
									setRefresh((prev) => prev + 1);
									addToast({
										type: "success",
										message: `Successfully moved ${selected.length} mod(s)`,
									});
								});
							});
						}}
						className="w-34.5 "
					>
						<FolderInputIcon className="" />
						Move
					</Button>
					<Button
						disabled={!toggleValid}
						onClick={() => toggleSelectedMods(false)}
						className="w-34.5 active:bg-destructive/80 group"
					>
						<XIcon className="text-destructive/80 group-active:text-background duration-300" />
						Disable
					</Button>
					<Button
						disabled={!deleteValid}
						onClick={() => setAlertOpen(true)}
						className="w-41 border-destructive/25 active:border-border active:bg-destructive/80 group"
					>
						<TrashIcon className="text-destructive group-active:text-background duration-300" />
						<label className="text-destructive group-active:text-background duration-300">Delete</label>
					</Button>

					<Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
						<PopoverTrigger asChild>
							<div
								role="combobox"
								style={{
									pointerEvents: moveValid ? "auto" : "none",
									opacity: moveValid ? "" : 0.5,
								}}
								className="w-41 item h-10 overflow-hidden border-accent/25 active:border-border pointer-events-auto text-ellipsis select-none data-zzz:border-2 active:text-background active:bg-accent/80 active:scale-90 whitespace-nowrap rounded-md data-zzz:rounded-full font-medium transition-all px-3 py-2 text-sm bg-button text-accent shadow-xs hover:brightness-120  duration-300 flex items-center justify-center"
							>
								<Settings2Icon className=" h-5 mr-1" /> Set Category
							</div>
						</PopoverTrigger>
						<PopoverContent className="w-80 p-0 -mt-12 mr-2 z-2000 pointer-events-auto absolute -translate-y-full -translate-x-1/2 border rounded-lg">
							<Command>
								<CommandList
									onWheel={(e) => {
										// console.log(e.currentTarget.scrollHeight,  e.currentTarget.scrollTop)
										e.currentTarget.scrollTop += e.deltaY;
									}}
								>
									<CommandEmpty>{textData._RightSideBar._RightLocal.NoCat}</CommandEmpty>
									<CommandGroup className=" z-20">
										{categories.map((cat) => (
											<CommandItem
												key={cat._sName}
												value={cat._sName}
												onSelect={(currentValue) => {
													// renameMod(item.path, join(currentValue, item.name));
													// setNewCategory(currentValue);
													let mods = [...cleanChecked];
													mods = mods.map((modPath) => `${currentValue}\\${modPath.split("\\").slice(-1)[0]}`);
													console.log(mods);
													let promises = mods.map((modPath, index) => {
														console.log(cleanChecked[index], modPath, !cleanChecked[index].startsWith(managedSRC));
														return changeModName(
															cleanChecked[index].replace(managedSRC + "\\", ""),
															modPath,
															!cleanChecked[index].startsWith(managedSRC)
														);
													});
													addToast({
														type: "success",
														message: `Moving ${mods.length} mod(s)`,
													});
													Promise.all(promises).then(() => {
														setChecked(new Set());
														setRefresh((prev) => prev + 1);
														addToast({
															type: "success",
															message: `Successfully moved ${mods.length} mod(s)`,
														});
													});
													setPopoverOpen(false);
												}}
												className="data-zzz:rounded-full data-zzz:text-foreground data-zzz:mt-1 data-zzz:border-2"
											>
												<img
													className="aspect-square outline bg-accent/10 flex text-white items-center justify-center h-6 rounded-full pointer-events-none"
													onError={(e) => {
														e.currentTarget.src = "/who.jpg";
													}}
													src={cat._sIconUrl || "err"}
												/>

												<div className="w-35 min-w-fit text-ellipsis overflow-hidden break-words">{cat._sName}</div>
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
								<CommandInput placeholder={textData.Search} className="h-12" />
							</Command>
						</PopoverContent>
					</Popover>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default BatchOperations;
