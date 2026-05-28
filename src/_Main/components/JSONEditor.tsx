import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { getConfig } from "@/utils/filesys";
import { ChevronRightIcon, EditIcon, TrashIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";

function JSONEditor({
	rootJSON = {},
	rootKey = "config",
	isRoot = false,
	parent = [],
	onChange = () => {},
	even = true,
}: {
	even?: boolean;
	rootPath?: string;
	rootJSON?: any;
	rootKey?: string;
	isRoot?: boolean;
	parent?: string[];
	onChange?: (path: string[], key: string, value: any) => void;
}) {
	const [json, setJson] = useState(rootJSON);
	const [key, setKey] = useState(rootKey);
	const [expanded, setExpanded] = useState<Set<string>>(new Set());
	useEffect(() => {
		if (key == "config") {
			setJson(getConfig().gameConfig);
		}
	}, [key]);
	const expand = useCallback((k: string) => {
		setExpanded((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(k)) {
				newSet.delete(k);
			} else {
				newSet.add(k);
			}
			return newSet;
		});
	}, []);

	const renderChildren = (obj: any, name: string = "root", parent: string = "json") => {
		const isArray = Array.isArray(obj);
		const path = `${parent}.${name}`;
		const entries: [string | number, any][] = isArray ? obj.map((v: any, i: number) => [i, v]) : Object.entries(obj);
		return entries.map(([k, v], index: number) => {
			const type = typeof v;
			const currentPath = `${path}.${k}`;
			const open = +expanded.has(currentPath) * -1 + (rootKey == "config" ? 0 : 1);
			return (
				<div
					className={cn("w-full flex select-none pointer-events-auto flex-col", parent != "json" && "border-l")}
					style={{
						backgroundColor: index % 2 == 0 ? "#1b1b1b50" : "#31313150",
					}}
				>
					<div
						className={
							"w-full h-10 flex gap-2 items-center pr-2 py-4 " +
							(index !== 0 ? "border-t " : "") +
							(index !== entries.length - 1 || type === "object" ? "border-b" : "")
						}
						onContextMenu={(e) => {
							e.preventDefault();
							expand(currentPath);
						}}
						// onClick={(e) => {
						// 	if (e.currentTarget !== e.target || item.path === managedTGT) return;
						// 	const newChecked = new Set(checked);
						// 	if (shiftDown && prevSelectedIndices.length > 0) {
						// 		setCurSelectedIndices([...indices, index]);
						// 		return;
						// 	}
						// 	setCurSelectedIndices([...indices, index]);
						// 	if (newChecked.has(item.path)) {
						// 		newChecked.delete(item.path);
						// 	} else {
						// 		newChecked.add(item.path);
						// 	}
						// 	setChecked(newChecked);
						// }}
					>
						<ChevronRightIcon
							onClick={() => {
								expand(currentPath);
							}}
							className="min-w-6 w-6 h-4 pl-2 duration-200 cursor-pointer pointer-events-auto"
							style={{
								transform: open ? "rotate(90deg) translateX(-5px) translateY(-2px)" : "",
								opacity: type === "object" ? 1 : 0,
							}}
						/>
						<div className="flex gap-1">
							{/* <Button
								className="h-7 w-7"
								variant={"destructive"}
								onClick={(e) => {
									let prev = e.currentTarget?.nextSibling as HTMLInputElement;
									prev?.focus();
								}}
							>
								<TrashIcon className="scale-75 pointer-events-auto" />
							</Button>
							<Button
								className="h-7 w-7"
								onClick={(e) => {
									let prev = e.currentTarget?.nextSibling as HTMLInputElement;
									prev?.focus();
								}}
							>
								<EditIcon className="scale-75 pointer-events-auto" />
							</Button> */}
						</div>

						<Input
							// autoFocus={index === focusedPreset}
							onFocus={(e) => {
								e.currentTarget.select();
								// focusedPreset = index;
							}}
							onBlur={(e) => {
								// if (e.currentTarget.value !== preset.name) {
								//  focusedPreset = -1;
								// 	updatePreset(index, e.currentTarget.value);
								// }
							}}
							type="text"
							className="w-full h-full p-2  pointer-events-none focus-within:pointer-events-auto overflow-hidden focus-visible:ring-[0px] border-0  text-ellipsis"
							style={{ backgroundColor: "#fff0" }}
							defaultValue={k}
						/>

						{type !== "object" && (
							<Input className="text-muted-foreground h-8 w-full bg-transparent duration-200" defaultValue={v} />
						)}
					</div>
					<AnimatePresence>
						{open && type === "object" && (
							<motion.div
								initial={{ height: 0, opacity: 0 }}
								animate={{ height: "auto", opacity: 1 }}
								exit={{ height: 0, opacity: 0 }}
								key={currentPath}
								className="flex1 flex-col items-center w-full pl-6"
							>
								{renderChildren(v, k.toString(), path)}
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			);
		});
	};
	return (
		<div
			className={cn("w-full flex select-none pointer-events-auto flex-col")}
			style={
				{
					// backgroundColor: parent.length ? (even ? "#1b1b1b50" : "#31313150") : "",
				}
			}
		>
			<div
				className="flex flex-col w-full h-full overflow-x-hidden overflow-y-scroll text-gray-300 border rounded-sm"
				style={{
					maxHeight: false ? "100%" : "24rem",
					height: false ? "100%" : "24rem",
				}}
			>
				{renderChildren(json)}
			</div>
			{false &&
				Object.keys(json).map((k, i) => {
					const type = typeof json[k];
					return (
						<div
							key={i}
							className="flex flex-col w-full gap-2 p-1"
							style={{
								backgroundColor: i % 2 == 0 ? "#1b1b1b50" : "#31313150",
							}}
						>
							{type == "object" ? (
								<Button variant="ghost" className="w-full active:scale-99 flex items-center justify-between">
									{k}
								</Button>
							) : (
								<div className="w-[calc(100%-256px)]">{k}</div>
							)}
							{type == "object" ? (
								<JSONEditor rootJSON={json[k]} rootKey={k} parent={[...parent, k]} onChange={onChange} even={!even} />
							) : (
								<></>
							)}
						</div>
					);
				})}
		</div>
	);
}

export default JSONEditor;
