import { verifyDirStruct } from "@/utils/filesys";
import { CHANGES, GAME, SOURCE, TARGET, TEXT_DATA } from "@/utils/vars";
import { invoke } from "@tauri-apps/api/core";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";

function Page3({ setPage }: { setPage: (page: number) => void }) {
	const tgt = useAtomValue(TARGET);
	const src = useAtomValue(SOURCE);
	const game = useAtomValue(GAME);
	const [user, setUser] = useState("User");
	const textData = useAtomValue(TEXT_DATA);
	const setChanges = useSetAtom(CHANGES);
	//console.log(src,tgt)
	useEffect(() => {
		async function skip() {
			// setTgt(tgt);
			// setSrc(src);
			setPage(4);
			setChanges(await verifyDirStruct());
		}
		if (src && tgt) {
			skip();
		} else {
			invoke("get_username").then((name) => {
				if (name) setUser(name as string);
			});
		}
	}, [src, tgt]);
	return (
		<div
			className="text-muted-foreground fixed flex flex-col items-center justify-center w-screen h-screen"
			onClick={() => {
				setPage(3);
			}}
		>
			<div className="fixed z-20 flex flex-col items-center justify-center w-full h-full duration-200">
				<div className="text-accent text-5xl">
					{textData._Checklist.Greeting} <label id="user">{user}</label>
				</div>
				<div className="text-accent opacity-75 my-2 text-2xl">{textData._Checklist.Configure}</div>
				<div className=" mt-5 opacity-50">{textData._Checklist.Continue}</div>
			</div>
			{game == "WW" && (
				<div className="fixed z-30 opacity-70 flex flex-col items-center bottom-5 text-sm ">
					<label>{textData._Checklist.AutoMigration}</label>
					<label>{textData._Checklist.MigrationFailed}</label>
					<label>{textData._Checklist.AfterVerify}</label>
				</div>
			)}
		</div>
	);
}
export default Page3;
