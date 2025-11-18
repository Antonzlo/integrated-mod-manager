import { useAtom, useAtomValue, useSetAtom } from "jotai";
import "./App.css";
import {
	CHANGES,
	GAME,
	INIT_DONE,
	LANG,
	LEFT_SIDEBAR_OPEN,
	MOD_LIST,
	ONLINE,
	PROGRESS_OVERLAY,
	RIGHT_SIDEBAR_OPEN,
	RIGHT_SLIDEOVER_OPEN,
	SETTINGS,
} from "./utils/vars";
import { AnimatePresence, motion } from "motion/react";
import Checklist from "./_Checklist/Checklist";
import { initializeThemes } from "./utils/theme";
import Changes from "./_Changes/Changes";
import { useCallback, useEffect, useMemo, useState } from "react";
import { refreshModList, saveConfigs } from "./utils/filesys";
import { SidebarProvider } from "./components/ui/sidebar";
import LeftSidebar from "./_LeftSidebar/Left";
import Main from "./_Main/Main";
import RightLocal from "./_RightSidebar/RightLocal";
import RightOnline from "./_RightSidebar/RightOnline";
import { main } from "./utils/init";
import ToastProvider from "./_Toaster/ToastProvider";
import Progress from "./_Progress/Progress";

initializeThemes();
main();
function App() {
	const initDone = useAtomValue(INIT_DONE);
	const lang = useAtomValue(LANG);
	const online = useAtomValue(ONLINE);
	const game = useAtomValue(GAME);
	const changes = useAtomValue(CHANGES);
	const settings = useAtomValue(SETTINGS);
	const leftSidebarOpen = useAtomValue(LEFT_SIDEBAR_OPEN);
	// const setOnlineSelected = useSetAtom(ONLINE_SELECTED);
	const [rightSidebarOpen, setRightSidebarOpen] = useAtom(RIGHT_SIDEBAR_OPEN);
	const [rightSlideOverOpen, setRightSlideOverOpen] = useAtom(RIGHT_SLIDEOVER_OPEN);
	const setModList = useSetAtom(MOD_LIST);
	const progressOverlay = useAtomValue(PROGRESS_OVERLAY);
	const [_, setShowModeSwitch] = useState(false);
	const [previousOnline, setPreviousOnline] = useState(online);
	const afterInit = useCallback(async () => {
		saveConfigs();
		setModList(await refreshModList());
		return Promise.resolve();
	}, []);
	useEffect(() => {
		if (previousOnline !== online) {
			setShowModeSwitch(true);
			setPreviousOnline(online);
			const timer2 = setTimeout(() => {
				setRightSidebarOpen(!online);
			}, 300);

			const timer = setTimeout(() => {
				setShowModeSwitch(false);
			}, 1000);

			return () => {
				clearTimeout(timer);
				clearTimeout(timer2);
			};
		}
		return undefined;
	}, [online]);
	const leftSidebarStyle = useMemo(
		() => ({
			minWidth: leftSidebarOpen ? "20.95rem" : "3.95rem",
		}),
		[leftSidebarOpen]
	);
	const rightSidebarStyle = useMemo(
		() => ({
			minWidth: rightSidebarOpen ? "20.95rem" : "0rem",
		}),
		[rightSidebarOpen]
	);
	return (
		<div id="background" className="game-font fixed flex flex-row items-start justify-start w-full h-full">
			<div
				className="bg-bgg fixed w-screen h-screen"
				style={{
					opacity: (settings.global.bgOpacity || 1) * 0.1,
					animation: settings.global.bgType == 2 ? "moveDiagonal 15s linear infinite" : "",
					backgroundImage: settings.global.bgType == 0 ? "none" : "",
					backgroundRepeat: settings.global.bgType == 0 ? "no-repeat" : "",
				}}
			></div>
			<SidebarProvider open={leftSidebarOpen}>
				<LeftSidebar />
			</SidebarProvider>
			<SidebarProvider open={rightSidebarOpen}>
				<RightLocal />
			</SidebarProvider>
			<RightOnline open={online && rightSlideOverOpen} />
			<div className="fixed flex flex-row w-full h-full">
				<div className="h-full duration-200 ease-linear" style={leftSidebarStyle} />
				<Main />
				<div className="h-full duration-300 ease-linear" style={rightSidebarStyle} />
			</div>
			<div className="fixed flex flex-row w-full h-full pointer-events-none">
				<div className="h-full duration-200 ease-linear" style={leftSidebarStyle} />
				<AnimatePresence>
					{online && rightSlideOverOpen && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.3 }}
							onClick={() => setRightSlideOverOpen(false)}
							className="w-full pointer-events-auto h-full bg-background/40 backdrop-blur-[2px]"
						/>
					)}
				</AnimatePresence>
			</div>
			
			<AnimatePresence>{(!initDone || !lang || !game) && <Checklist />}</AnimatePresence>
			<AnimatePresence>{changes.title && <Changes afterInit={afterInit} />}</AnimatePresence>
			<AnimatePresence>{progressOverlay.open && <Progress />}</AnimatePresence>
			<ToastProvider />
		</div>
	);
}
export default App;
