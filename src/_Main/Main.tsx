import { AnimatePresence, motion } from "motion/react";
import { useAtomValue } from "jotai";
import { ONLINE } from "@/utils/vars";
import MainLocal from "./MainLocal";
import MainOnline from "./MainOnline";
import BottomBar from "./components/BottomBar";
import TopBar from "./components/TopBar";
import { ONLINE_TRANSITION } from "@/utils/consts";
import { useEffect, useState } from "react";

function Main() {
	const online = useAtomValue(ONLINE);
	const [debouncedOnline, setDebouncedOnline] = useState(online);
	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedOnline(online);
		}, 600);

		return () => {
			clearTimeout(handler);
		};
	}, [online]);
	return (
		<div className="border-border flex flex-col w-full h-full overflow-hidden duration-200 border">
			<TopBar />
			<div className="flex w-full h-full px-2 overflow-hidden">
				<AnimatePresence mode="popLayout" initial={false}>
					<motion.div
						{...ONLINE_TRANSITION(online)}
						key={online == debouncedOnline ? (online ? "online" : "local") : "transitioning"}
						className=" flex flex-col items-center h-full min-w-full overflow-y-hidden delay-200"
					>
						{online == debouncedOnline ? online ? <MainOnline /> : <MainLocal /> : <></>}
					</motion.div>
				</AnimatePresence>
			</div>
			<BottomBar />
		</div>
	);
}

export default Main;
