import { cn } from "@/lib/utils";
import { getConfig } from "@/utils/filesys";
import { ChevronRightIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";

type JSONValue = unknown;

function getType(value: unknown) {
	if (value === null) return "null";
	if (Array.isArray(value)) return "array";
	return typeof value;
}

function getEntries(value: JSONValue): [string, JSONValue][] {
	if (Array.isArray(value)) return value.map((child, index) => [String(index), child]);
	if (value && typeof value === "object") return Object.entries(value as Record<string, JSONValue>);
	return [];
}

function getSummary(value: unknown) {
	const type = getType(value);
	if (type !== "array" && type !== "object") return type;

	const count = getEntries(value).length;
	const label = type === "array" ? "item" : "key";
	return `${count} ${label}${count === 1 ? "" : "s"}`;
}

function formatValue(value: unknown) {
	if (value === null) return "null";
	if (typeof value === "string") return value ? `"${value}"` : '""';
	if (typeof value === "boolean") return value ? "true" : "false";
	if (value === undefined) return "undefined";
	return String(value);
}

function JSONEditor({
	rootJSON = {},
	rootKey = "config",
}: {
	even?: boolean;
	rootPath?: string;
	rootJSON?: JSONValue;
	rootKey?: string;
	isRoot?: boolean;
	parent?: string[];
	onChange?: (path: string[], key: string, value: JSONValue) => void;
}) {
	const [json, setJson] = useState<JSONValue>(rootJSON);
	const [expanded, setExpanded] = useState<Set<string>>(new Set(["json.root"]));
	console.log("JSONEditor rendered", { rootKey, rootJSON, json, parent });
	useEffect(() => {
		if (rootKey === "config") {
			setJson(getConfig().gameConfig);
			return;
		}
		setJson(rootJSON ?? {});
	}, [rootJSON, rootKey]);

	const rootSummary = useMemo(() => getSummary(json), [json]);

	const expand = useCallback((path: string) => {
		setExpanded((prev) => {
			const next = new Set(prev);
			if (next.has(path)) next.delete(path);
			else next.add(path);
			return next;
		});
	}, []);

	const renderChildren = (value: JSONValue, name = "root", parent = "json", depth = 0) => {
		const entries = getEntries(value);
		const path = `${parent}.${name}`;

		if (!entries.length) {
			return <div className="px-3 py-3 text-xs text-muted-foreground">Empty {getType(value)}</div>;
		}

		return entries.map(([key, child], index) => {
			const type = getType(child);
			const childPath = `${path}.${key}`;
			const isExpandable = type === "array" || type === "object";
			const isOpen = expanded.has(childPath);
			const tone =
				type === "string"
					? "text-emerald-300"
					: type === "number"
						? "text-sky-300"
						: type === "boolean"
							? "text-amber-300"
							: type === "null"
								? "text-muted-foreground"
								: "text-accent";

			return (
				<div key={childPath} className="w-full">
					<button
						type="button"
						className={cn(
							"group grid min-h-9 w-full grid-cols-[1.75rem_minmax(8rem,0.8fr)_auto_minmax(10rem,1.2fr)] items-center gap-2 border-t px-2 text-left text-sm transition-colors hover:bg-accent/5",
							index === 0 && "border-t-0",
							depth > 0 && "border-l border-l-border/70"
						)}
						style={{ paddingLeft: `${0.5 + depth * 0.75}rem` }}
						onClick={() => isExpandable && expand(childPath)}
						onContextMenu={(event) => {
							event.preventDefault();
							if (isExpandable) expand(childPath);
						}}
					>
						<span className="flex h-7 w-7 items-center justify-center">
							<ChevronRightIcon
								className={cn(
									"h-4 w-4 text-muted-foreground transition-transform",
									isOpen && "rotate-90",
									!isExpandable && "opacity-0"
								)}
							/>
						</span>
						<span className="truncate font-mono text-xs text-foreground" title={key}>
							{key}
						</span>
						<span
							className={cn(
								"rounded border border-border/70 bg-background/60 px-1.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-normal",
								tone
							)}
						>
							{type}
						</span>
						<span
							className={cn("truncate font-mono text-xs", isExpandable ? "text-muted-foreground" : tone)}
							title={formatValue(child)}
						>
							{isExpandable ? getSummary(child) : formatValue(child)}
						</span>
					</button>
					<AnimatePresence initial={false}>
						{isOpen && isExpandable && (
							<motion.div
								key={`${childPath}-children`}
								initial={{ height: 0, opacity: 0 }}
								animate={{ height: "auto", opacity: 1 }}
								exit={{ height: 0, opacity: 0 }}
								transition={{ duration: 0.16 }}
								className="overflow-hidden"
							>
								{renderChildren(child, key, path, depth + 1)}
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			);
		});
	};

	return (
		<div className="flex w-full flex-col overflow-hidden rounded-md border bg-background/70 text-gray-300">
			<div className="grid min-h-10 grid-cols-[1.75rem_minmax(8rem,0.8fr)_auto_minmax(10rem,1.2fr)] items-center gap-2 border-b bg-muted/20 px-2 text-left text-xs text-muted-foreground">
				<span />
				<span className="truncate font-medium text-accent" title={rootKey}>
					{rootKey}
				</span>
				<span className="rounded border border-border/70 bg-background/60 px-1.5 py-0.5 font-mono text-[0.65rem] uppercase">
					{getType(json)}
				</span>
				<span className="truncate font-mono">{rootSummary}</span>
			</div>
			<div className="flex h-96 w-full flex-col overflow-y-auto overflow-x-hidden">
				{renderChildren(json)}
			</div>
		</div>
	);
}

export default JSONEditor;
