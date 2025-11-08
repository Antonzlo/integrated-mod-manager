import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { managedSRC } from "@/utils/consts";
import { applyPreset, folderSelector, verifyDirStruct } from "@/utils/filesys";
import { getDataDir } from "@/utils/init";
import { CHANGES, GAME, SOURCE, TARGET, TEXT_DATA } from "@/utils/vars";
import { useAtomValue, useSetAtom } from "jotai";
import { useState } from "react";
const dataDir = getDataDir();
function Page4({ setPage }: { setPage: (page: number) => void }) {
	const [tgt, setTgt] = useState(dataDir);
	const [src, setSrc] = useState(tgt+"\\Mods");
	const [checked, setChecked] = useState(true);
	const setSource = useSetAtom(SOURCE);
	const setTarget = useSetAtom(TARGET);
	const textData = useAtomValue(TEXT_DATA);
	const game = useAtomValue(GAME);
	const setChanges = useSetAtom(CHANGES);
	return (
		<div className="text-muted-foreground fixed flex flex-col items-center justify-center w-screen h-screen">
			<div className="fixed z-20 flex flex-col items-center justify-center w-full duration-200">
				{tgt == "" ? (
					<div className=" text-accent flex flex-col items-center gap-5 my-2 text-2xl">
						{textData._Checklist.NotFound}
						<Button
							className="w-1/2 mt-2"
							onClick={async () => {
								let path = ((await folderSelector(tgt)) as string) || tgt || "";
								setTgt(path);
								setSrc(path+"\\Mods");
							}}
						>
							{textData.Browse}
						</Button>
					</div>
				) : (
					<div className="text-accent flex flex-col items-center gap-5 my-2 text-2xl">
						{textData._Checklist.ConfirmDir}
						<div className="flex items-center gap-2">
							<Label>{game}MI Dir :</Label>
							<Input
								type="text"
								className="w-96 border-border/0 bg-input/50 text-accent/75 text-ellipsis h-10 overflow-hidden text-center cursor-default"
								value={tgt?.replace("/", "\\") ?? "-"}
							/>
							<Button
								className="w-32"
								onClick={async () => {
									let path = ((await folderSelector(tgt)) as string) || tgt || "";
									if (path.endsWith("\\Mods")) {
										path = path.slice(0, -5);
									}
									setTgt(path);
									if (checked) {
										setSrc(path+"\\Mods");
									}
								}}
							>
								{textData.Browse}
							</Button>
						</div>
						<div
							className="flex overflow-y-hidden items-center gap-2"
							style={{
								opacity: checked ? 0 : 1,
								height: checked ? "0px" : "40px",
								transition: "all 0.3s ease-in-out",
								pointerEvents: checked ? "none" : "auto",
								marginTop: checked ? "-10px" : 0,
								marginBottom: checked ? "-10px" : 0,
							}}
						>
							<Label>Mods Dir :</Label>
							<Input
								type="text"
								className="w-96 border-border/0 bg-input/50 text-accent/75 text-ellipsis h-10 overflow-hidden text-center cursor-default"
								value={src?.replace("/", "\\") ?? "-"}
							/>
							<Button
								className="w-32"
								onClick={async () => {
									if (checked) return;
									let path = ((await folderSelector(src)) as string) || src || "";
									setSrc(path);
								}}
							>
								{textData.Browse}
							</Button>
						</div>

						<div className=" flex min-w-fit  items-center gap-2">
							<Checkbox checked={checked} onClick={() => setChecked(!checked)} className=" checked:bg-accent bgaccent  " />
							<label className="text-accent/75 text-sm min-w-fit">
								{" "}
								{textData._Checklist.ModsIn.replace("{game}", game)}{" "}
							</label>
						</div>

						<Button
							className={"w-32 mt-2"}
							onClick={async () => {
								setTarget(tgt);
								setSource(checked ? (tgt+"\\Mods") : src.endsWith(managedSRC)?src.split(managedSRC)[0]:src);
								applyPreset([])
								setChanges(await verifyDirStruct());
								setPage(4);
							}}
						>
							{textData.Confirm}
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
export default Page4;
