import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {  DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { deleteCategory, saveConfigs } from "@/utils/filesys";
import { setCategories } from "@/utils/init";

import { CATEGORIES, SETTINGS, TEXT_DATA } from "@/utils/vars";
import { Label } from "@radix-ui/react-dropdown-menu";
import { useAtom, useAtomValue } from "jotai";
import { EditIcon, RefreshCwIcon, TrashIcon } from "lucide-react";
import { useCallback, useRef, useState } from "react";

function useDebouncedCallback<T extends (...args: any[]) => void>(callback: T, delay = 200) {
	const timerRef = useRef<NodeJS.Timeout | null>(null);
	return useCallback(
		(...args: Parameters<T>) => {
			if (timerRef.current) clearTimeout(timerRef.current);
			timerRef.current = setTimeout(() => {
				callback(...args);
			}, delay);
		},
		[callback, delay]
	);
}
function ManageCategories() {
	const [alertOpen, setAlertOpen] = useState(false);
	const [alertData, setAlertData] = useState({
		_idRow: -1,
		_sName: "",
		_nItemCount: 0,
		_nCategoryCount: 0,
		_sUrl: "",
		_sIconUrl: "",
		_sAltIconUrl: "",
		index: -1,
	} as any);
	const [settings, setSettings] = useAtom(SETTINGS);
	const customCategories = settings.game.customCategories || ({} as any);
	const textData = useAtomValue(TEXT_DATA);
	const categories = useAtomValue(CATEGORIES);
	const categorySet = new Set(categories.map((cat) => cat._sName));
	const debouncedIconUpdate = useDebouncedCallback((value: string) => {
		setAlertData((prev: any) => {
			const curData = { ...prev };
			if (curData._idRow) {
				if (curData._sAltIconUrl && curData._sAltIconUrl === value) {
					curData._sAltIconUrl = "";
				} else if (curData._sIconUrl !== value && (!curData._sAltIconUrl || curData._sAltIconUrl.length === 0)) {
					curData._sAltIconUrl = curData._sIconUrl;
				}

			}
			curData._sIconUrl = value;
			return curData;
		});
	}, 400);
	return (
		<DialogContent>
			<Tooltip>
				<TooltipTrigger></TooltipTrigger>
				<TooltipContent className="opacity-0"></TooltipContent>
			</Tooltip>
			<AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
				<AlertDialogContent>
					<div className="max-w-96 flex flex-col items-center gap-2 mt-6 text-center">
						<img
							className="aspect-square outline bg-accent/10 z-10 flex text-white items-center justify-center h-20 rounded-full pointer-events-none"
							onError={(e) => {
								e.currentTarget.src = "/who.jpg";
							}}
							src={alertData._sIconUrl || "err"}
						/>

						<Input
							type="text"
							defaultValue={alertData._sName}
							disabled={!alertData.creating}
							onChange={(e) => {
								setAlertData((prev: any) => ({ ...prev, _sName: e.target.value }));
							}}
							placeholder="Category Name"
							style={{
								borderColor: alertData.creating && categorySet.has(alertData._sName) ? "var(--destructive)" : "",
							}}
							className="  text-center disabled:border-0  max-w-80 text-ellipsis overflow-hidden break-words"
						/>
						<Tooltip>
							<TooltipTrigger
								className="self-end duration-200 -mt-9 "
								style={{
									opacity: !alertData._sUrl && !alertData.creating ? 1 : 0,
									pointerEvents: !alertData._sUrl && !alertData.creating ? "auto" : "none",
								}}
								onClick={async () => {
									const success = await deleteCategory(alertData._sName);
									if (success) {
										delete customCategories[alertData._sName];
										setSettings((prev) => ({
											...prev,
											game: {
												...prev.game,
												customCategories,
											},
										}));
										saveConfigs();
										setCategories();
										setAlertOpen(false);
									} else {
										const deleteWarning = document.getElementById("deleteWarning");
										if (deleteWarning) {
											deleteWarning.style.opacity = "1";
											setTimeout(() => {
												deleteWarning.style.opacity = "0";
												deleteWarning.style.pointerEvents = "none";
											}, 3000);
										}
									}
								}}
							>
								<TrashIcon className="h-5 p-0.5 w-5 text-destructive cursor-pointer hover:text-accent/70" />
							</TooltipTrigger>
							<TooltipContent>Delete Category</TooltipContent>
						</Tooltip>
						<label
							className="select-none pointer-events-none text-destructive duration-300 text-sm -my-1"
							style={{
								opacity: alertData.creating && categorySet.has(alertData._sName) ? 1 : 0,
							}}
						>
							{"Category already exists!"}
						</label>
						<div className="flex flex-col gap-2 items-start w-120">
							<label className="min-w-fit text-xs -mb-2 ml-2 bg-background text-accent border border-b-0 rounded-t-md px-1.5 py-0.5">
								Icon URL
							</label>
							<Input
								type="text"
								placeholder="https://custom.image.url/here"
								defaultValue={alertData._sIconUrl}
								disabled={!!alertData.name}
								onChange={(e) => {
									debouncedIconUpdate((e.target as HTMLInputElement).value);
								}}
								className="w-full disabled:border-0 min-w-fit text-ellipsis overflow-hidden break-words"
							/>

							<Tooltip>
								<TooltipTrigger
									className="self-end duration-200 -mt-9 -mr-6"
									style={{
										opacity: alertData._sAltIconUrl ? 1 : 0,
										pointerEvents: alertData._sAltIconUrl ? "auto" : "none",
									}}
									onClick={() => {
										debouncedIconUpdate(alertData._sAltIconUrl || "");
									}}
								>
									<RefreshCwIcon className="h-5 p-0.5 w-5 text-accent cursor-pointer hover:text-accent/70" />
								</TooltipTrigger>
								<TooltipContent>Reset</TooltipContent>
							</Tooltip>
						</div>
					</div>
					<div className="flex justify-between items-center w-full gap-4 mt-4">
						<AlertDialogCancel
							variant="default"
							className="w-24 duration-300 text-destructive hover:bg-destructive data-zzz:hover:bg-destructive data-zzz:text-destructive data-zzz:hover:text-background hover:text-background"
						>
							{textData.Cancel}
						</AlertDialogCancel>
						<label
							id="deleteWarning"
							className="text-destructive duration-200 text-xs opacity-0 pointer-events-none"
							key={alertData._sName}
						>
							Cannot delete, folder is not empty.
						</label>
						<AlertDialogAction
							className="w-24 text-success hover:bg-success data-zzz:text-success data-zzz:hover:text-background hover:text-background"
							onClick={async () => {
								if (alertData._sName.trim().length === 0 || (alertData.creating && categorySet.has(alertData._sName))) {
									return;
								}
								if (alertData._sUrl && !alertData._sAltIconUrl) {
									delete customCategories[alertData._sName];
								} else
									customCategories[alertData._sName] = {
										_sIconUrl: alertData._sIconUrl,
										...(alertData._sAltIconUrl ? { _sAltIconUrl: alertData._sAltIconUrl } : {}),
									};
								setSettings((prev) => ({
									...prev,
									game: {
										...prev.game,
										customCategories,
									},
								}));
								saveConfigs();
								setCategories();
								setAlertOpen(false);
							}}
						>
							{textData.Confirm}
						</AlertDialogAction>
					</div>
				</AlertDialogContent>
			</AlertDialog>
			<div className="min-h-fit text-accent my-6 text-3xl">Manage Categories</div>
			<div className="flex flex-wrap gap-2 p-2 w-full h-full overflow-x-hidden overflow-y-scroll text-gray-300 border rounded-sm max-h-120 min-h-120">
				{categories.map((cat) => (
					<div
						key={cat._sName}
						onClick={() => {
							setAlertData(cat);
							setAlertOpen(true);
						}}
						className="data-zzz:rounded-full border-1 rounded-md hover:bg-accent/30 active:bg-accent/50 active:scale-90 group select-none  duration-300 flex w-80 p-2 items-center gap-2 data-zzz:text-foreground data-zzz:mt-1 data-zzz:border-2"
					>
						<img
							className="aspect-square outline bg-accent/10 z-10 flex text-white items-center justify-center h-12 rounded-full pointer-events-none"
							onError={(e) => {
								e.currentTarget.src = "/who.jpg";
							}}
							src={cat._sIconUrl || "err"}
						/>

						<Label
							// type="text"

							className="w-70 pointer-events-none group-hover:text-accent duration-300 border-0 text-ellipsis overflow-hidden whitespace-nowrap"
						>
							{cat._sName}
						</Label>
						<EditIcon className="z-20 h-full min-w-5 p-[3px] text-accent cursor-pointer" />
					</div>
				))}
			</div>
			<div className="w-full flex items-end">
				<Button
					variant="outline"
					className="w-full"
					onClick={() => {
						setAlertData({ _sName: "", _sIconUrl: "", _sAltIconUrl: "", creating: true });
						setAlertOpen(true);
					}}
				>
					Create New Category
				</Button>
			</div>
		</DialogContent>
	);
}

export default ManageCategories;
