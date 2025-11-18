import { GAME } from "@/utils/vars";
import { useAtomValue } from "jotai";
import Help from "./Help";

function Page5({setPage}: {setPage: (page: number) => void}) {
	const game = useAtomValue(GAME);
	return (
		<div className="fixed flex flex-col items-center justify-center w-screen h-screen gap-2">
			<div className="logo min-h-40 data-gi:min-h-44 data-gi:mb-4 aspect-square"></div>
			<div className="text-accent textaccent flex text-2xl opacity-50">{{ WW: "WuWa", ZZ: "Z·Z·Z","":"",GI:"Genshin" }[game] || "Integrated"} Mod Manager</div>
			<Help setPage={setPage} />
		</div>
	);
}
export default Page5;
