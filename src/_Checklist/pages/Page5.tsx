import { GAME } from "@/utils/vars";
import { useAtomValue } from "jotai";
import Help from "./Help";

function Page5({setPage}: {setPage: (page: number) => void}) {
	const game = useAtomValue(GAME);
	return (
		<div className="gap-2 fixed flex flex-col items-center justify-center w-screen h-screen">
			<div className="logo min-h-40 aspect-square"></div>
			<div className="text-accent textaccent opacity-50 flex text-2xl">{{ WW: "WuWa", ZZ: "Z·Z·Z","":"" }[game] || "Integrated"} Mod Manager</div>
			<Help setPage={setPage} />
		</div>
	);
}
export default Page5;
