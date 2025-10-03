import { useState } from "react";
import { Label } from "@/components/ui/label";
import { getCardClasses } from "@/utils/commonUtils";
import { COMMON_STYLES, CSS_CLASSES } from "@/utils/consts";
import { Folder, XIcon } from "lucide-react";
import wwmm from "@/wwmm.png";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
function Page2({ setPage }: { setPage: (page: number) => void }) {
	const [isEnabled, setIsEnabled] = useState(false);
	return (
		<div className="text-muted-foreground fixed flex flex-col items-center justify-center w-screen h-screen gap-8">
			<div className="mb-4 text-3xl">
				{"How to Toggle & Delete Mods".split("").map((letter, index) => (
					<span
						key={index}
						className="wave-letter"
						style={{
							animationDelay: `${index * 0.1}s`,
						}}>
						{letter === " " ? "\u00A0" : letter}
					</span>
				))}
			</div>
			<div
				className={getCardClasses(true)}
				style={{
					borderColor: isEnabled ? "var(--accent)" : "",
				}}
				onContextMenu={(e) => {
					e.preventDefault();
					setIsEnabled(!isEnabled);
				}}>
				<img className="object-cover w-full h-full opacity-0 pointer-events-none" src="" />
				<img style={{ filter: isEnabled ? "brightness(1)" : "brightness(0.5) saturate(0.5)" }} className="w-full h-[calc(100%-3.5rem)] -mt-71.5 duration-200 rounded-t-lg pointer-events-none object-cover" src={wwmm} />
				<div className={CSS_CLASSES.BG_BACKDROP + " flex items-center w-full min-h-14 gap-2 px-4 py-1"}>
					{<Folder style={{ filter: isEnabled ? "brightness(1)" : "brightness(0.5) saturate(0.5)" }} />}
					<Label className={CSS_CLASSES.INPUT_TRANSPARENT} style={{ ...COMMON_STYLES.TRANSPARENT_BG, filter: isEnabled ? "brightness(1)" : "brightness(0.5) saturate(0.5)" }}>
						Mod Name
					</Label>
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button
								
								disabled={!isEnabled}
								className="-mt-123 flex text-red-300 cursor-pointer items-center justify-center bg-white/0  px-2 w-8 h-6 z-200 -ml-5 -mr-5">
								<XIcon className="pointer-events-none" />
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent className="min-w-120 backdrop-blur-xs wuwa-ft bg-background/50 border-border flex flex-col items-center gap-4 p-4 overflow-hidden border-2 rounded-lg">
							<div className="max-w-96 flex flex-col items-center gap-6 mt-6 text-center">
								<div className="text-xl text-gray-200">
									Delete <span className="text-accent">Mod</span>?
								</div>
								<div className="text-red-300	">This action is irreversible.</div>
							</div>
							<div className="flex justify-between w-full gap-4 mt-4">
								<AlertDialogCancel className="w-24 duration-300">Cancel</AlertDialogCancel>
								<AlertDialogAction className="w-24 text-red-300 hover:bg-red-300 hover:text-background" onClick={() => setPage(2)}>
									Delete
								</AlertDialogAction>
							</div>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</div>
			<div className="text-muted-foreground/75 flex items-center gap-1 mt-8">
				{isEnabled ? (
					<>
						Great! Now delete the mod by clicking <XIcon className="pointer-events-none max-h-5 text-red-300" /> on the top right
					</>
				) : (
					"Right click on a mod to toggle it on/off"
				)}
			</div>
		</div>
	);
}
export default Page2;