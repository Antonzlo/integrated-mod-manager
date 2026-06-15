import { useAtom, useAtomValue, useSetAtom } from "jotai";
import "./App.css";
import {
	ANIMATIONS,
	BLUR,
	CHANGES,
	DEV_HIDE_PREVIEWS,
	ERR,
	GAME,
	INIT_DONE,
	LANG,
	LEFT_SIDEBAR_OPEN,
	MOD_CHECK_PROGRESS,
	MOD_LIST,
	ONLINE,
	PROGRESS_OVERLAY,
	RIGHT_SIDEBAR_OPEN,
	RIGHT_SLIDEOVER_OPEN,
	SCALE,
	SETTINGS,
} from "./utils/vars";
import { AnimatePresence, motion, MotionGlobalConfig } from "motion/react";
import Checklist from "./_Checklist/Checklist";
import { initializeThemes } from "./utils/theme";
import Changes from "./_Changes/Changes";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { refreshModList, saveConfigs } from "./utils/filesys";
import { SidebarProvider } from "./components/ui/sidebar";
import LeftSidebar from "./_LeftSidebar/Left";
import Main from "./_Main/Main";
import RightLocal from "./_RightSidebar/RightLocal";
import RightOnline from "./_RightSidebar/RightOnline";
import { main } from "./utils/init";
import ToastProvider from "./_Toaster/ToastProvider";
import Progress from "./_Progress/Progress";
import { setImageServer } from "./utils/utils";
// import { Button } from "./components/ui/button";

function App() {
	const initDone = useAtomValue(INIT_DONE);
	const lang = useAtomValue(LANG);
	const err = useAtomValue(ERR);
	const online = useAtomValue(ONLINE);
	const game = useAtomValue(GAME);
	const changes = useAtomValue(CHANGES);
	const settings = useAtomValue(SETTINGS);
	const animations = useAtomValue(ANIMATIONS);
	const leftSidebarOpen = useAtomValue(LEFT_SIDEBAR_OPEN);
	// const setOnlineSelected = useSetAtom(ONLINE_SELECTED);
	const scale = useAtomValue(SCALE);
	const blur = useAtomValue(BLUR);
	const [rightSidebarOpen, setRightSidebarOpen] = useAtom(RIGHT_SIDEBAR_OPEN);
	const [rightSlideOverOpen, setRightSlideOverOpen] = useAtom(RIGHT_SLIDEOVER_OPEN);
	const setModList = useSetAtom(MOD_LIST);
	const modCheckProgress = useAtomValue(MOD_CHECK_PROGRESS);
	const progressOverlay = useAtomValue(PROGRESS_OVERLAY);
	const [_, setShowModeSwitch] = useState(false);
	const [previousOnline, setPreviousOnline] = useState(online);
	const initializedRef = useRef(false);
	const devHidePreviews = useAtomValue(DEV_HIDE_PREVIEWS);
	const afterInit = useCallback(async () => {
		saveConfigs();
		setModList(await refreshModList());
		return Promise.resolve();
	}, []);
	useEffect(() => {
		if (initializedRef.current) return;
		initializedRef.current = true;
		initializeThemes();
		main();
	}, []);
	useEffect(() => {
		if (err) {
			throw new Error(err);
		}
	}, [err]);
	// useEffect(() => {
	// 	if(devHidePreviews && import.meta.env.DEV)
	// 	setImageServer("");
	// }, [devHidePreviews]);
	useEffect(() => {
		if (scale) document.documentElement.style.fontSize = 16 * Math.pow(2, scale / 50) + "px";
		if (typeof blur === "number") {
			document.documentElement.style.setProperty("--blur-xs", `${4 * blur}px`);
			document.documentElement.style.setProperty("--blur-sm", `${8 * blur}px`);
			document.documentElement.style.setProperty("--blur-md", `${12 * blur}px`);
			document.documentElement.style.setProperty("--blur-2xl", `${40 * blur}px`);
		}
		if (!animations) {
			const style = document.createElement("style");
			style.id = "disabled-animations-override"; // Added unique ID
			style.textContent = `
    *, *::before, *::after {
        animation-delay: 0s !important;
        animation-duration: 0s !important;
        animation-iteration-count: 1 !important;
        transition-delay: 0s !important;
        transition-duration: 0s !important;
        scroll-behavior: auto !important;
    }
`;
			MotionGlobalConfig.skipAnimations = true;
			document.head.appendChild(style);
		} else {
			const styleElement = document.getElementById("disabled-animations-override");
			if (styleElement) {
				styleElement.remove();
			}
			MotionGlobalConfig.skipAnimations = false;
		}
	}, [scale, blur, animations]);
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
		<div id="background" className="game-font fixed border-b flex flex-row items-start justify-start w-full h-full">
			<div
				className="bg-bgg fixed w-screen h-screen"
				style={{
					opacity: (settings.global.display.bgOpacity || 1) * 0.1,
					animation: settings.global.display.bgType == 2 ? "moveDiagonal 15s linear infinite" : "",
					backgroundImage: settings.global.display.bgType == 0 ? "none" : "",
					backgroundRepeat: settings.global.display.bgType == 0 ? "no-repeat" : "",
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
							className="w-full pointer-events-auto h-full bg-background/40 backdrop-blur-[calc(var(--blur-xs)*0.5)]"
						/>
					)}
				</AnimatePresence>
			</div>

			<div
				className="fixed pointer-events-none duration-300 text-[0.5rem] opacity-50 rounded-tl-md flex pl-2 gap-1.5 flex-row items-center right-0 h-8 w-72 bg-sidebar border z-10"
				style={{ bottom: modCheckProgress.open ? "0px" : "-3rem" }}
				role="progressbar"
				aria-valuemin={0}
				aria-valuemax={modCheckProgress.total}
				aria-valuenow={modCheckProgress.checked}
			>
				Mods Checked :
				<div className="w-42 border flex h-4 rounded-sm overflow-hidden">
					<div
						className="bg-accent duration-100 h-full rounded-r-sm"
						style={{
							width: `${modCheckProgress.total ? (modCheckProgress.checked / modCheckProgress.total) * 100 : 0}%`,
						}}
					></div>
				</div>
				<div className="flex font-en min-w-fit text-center flex-col">
					<label>{modCheckProgress.checked}</label>
					<div className="w-full h-[0.0625rem] bg-border rounded-full"></div>
					<label>{modCheckProgress.total}</label>
				</div>
			</div>
			<AnimatePresence>{(!initDone || !lang || !game) && <Checklist />}</AnimatePresence>
			<AnimatePresence>{changes.title && <Changes afterInit={afterInit} />}</AnimatePresence>
			<AnimatePresence>{progressOverlay.open && <Progress />}</AnimatePresence>
			<ToastProvider />
		</div>
	);
}
export default App;
