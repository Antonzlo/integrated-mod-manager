import { Sidebar, SidebarContent, SidebarFooter, SidebarGroupLabel } from "@/components/ui/sidebar";
import { Globe, HardDriveDownload, PlayIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { GAME, LEFT_SIDEBAR_OPEN, ONLINE, SETTINGS, TEXT_DATA } from "@/utils/vars";
import { AnimatePresence, motion } from "motion/react";
import LeftOnline from "./LeftOnline";
import LeftLocal from "./LeftLocal";
import Settings from "./components/Settings";
import { ONLINE_TRANSITION } from "@/utils/consts";
import { useInstalledItemsManager } from "@/utils/utils";
import Downloads from "./components/Downloads";
import BatchOperations from "./components/Batch";
function LeftSidebar() {
	const leftSidebarOpen = useAtomValue(LEFT_SIDEBAR_OPEN);
	const textData = useAtomValue(TEXT_DATA);
	const [online, setOnline] = useAtom(ONLINE);
	const setGame = useSetAtom(GAME);
	const game = useAtomValue(SETTINGS).global.game;
	useInstalledItemsManager();
	return (
		<Sidebar collapsible="icon" className="pointer-events-auto">
			<SidebarContent className="bg-sidebar polka h-full gap-0 overflow-hidden border border-r-0">
				<div className="flex flex-col min-h-full max-h-full w-full">
					<div className="min-h-16 min-w-16 flex items-center justify-center h-16 gap-5 p-0 border-b">
						<div
							id="IMMLogo"
							className="aspect-square logo h-10"
							onClick={() => {
								setGame("");
							}}
						></div>
						<div
							className="flex flex-col max-w-28 min-w-28 text-center duration-200 ease-linear"
							style={{
								marginRight: leftSidebarOpen ? "" : "-8.125rem",
								opacity: leftSidebarOpen ? "" : "0",
							}}
						>
							<label className="text-2xl text-[#eaeaea] min-w-fit">
								{{ "": "", WW: "WuWa", ZZ: "Z·Z·Z" }[game] || "Integrated"}
							</label>
							<label className="min-w-fit text-accent opacity-75 textaccent text-sm">Mod Manager</label>
						</div>
					</div>

					<div className="duration-200 px-0 w-full mt-2.5">
						<SidebarGroupLabel>Launch Game</SidebarGroupLabel>
						<div className="min-h-fit grid grid-cols-1 justify-between px-2 w-full gap-2 overflow-hidden">
							<Button
								className="text-ellipsis min-h-12 max-h-12 min-w -80 px-0 flex items-center w-full overflow-hidden"
								style={{ width: leftSidebarOpen ? "" : "3rem" }}
							>
								<PlayIcon className="w-6 h-6" />
								{leftSidebarOpen && `Start Game with ${game}MI`}
							</Button>
						</div>
					</div>
					<Separator
						className="w-full ease-linear duration-200 min-h-[1px] my-2.5 bg-border"
						style={{
							opacity: leftSidebarOpen ? "0" : "",
							height: leftSidebarOpen ? "0px" : "",
							marginBlock: leftSidebarOpen ? "4px" : "",
						}}
					/>
					<div className="duration-200 px-0 w-full mt-2.5">
						<SidebarGroupLabel>{textData._LeftSideBar._Left.Mode}</SidebarGroupLabel>
						<div
							className="min-h-fit grid grid-cols-2 justify-between px-2 w-full gap-2 overflow-hidden"
							style={{
								gridTemplateColumns: leftSidebarOpen ? "" : "repeat(1, minmax(0, 1fr))",
							}}
						>
							<Button
								onClick={() => {
									setOnline(false);
								}}
								className={
									"w-full overflow-hidden text-ellipsis " +
									(!online && "hover:brightness-125 bg-accent bgaccent   data-zzz:text-background text-background")
								}
							>
								<HardDriveDownload className="w-6 h-6" />
								{leftSidebarOpen && textData.Installed}
							</Button>
							<Button
								onClick={() => {
									setOnline(true);
								}}
								className={
									"w-full overflow-hidden text-ellipsis " +
									(online && "hover:brightness-125 bg-accent bgaccent   data-zzz:text-background text-background")
								}
							>
								<Globe className="w-6 h-6" />
								{leftSidebarOpen && textData._LeftSideBar._Left.Online}
							</Button>
						</div>
					</div>
					<Separator
						className="w-full ease-linear duration-200 min-h-[1px] my-2.5 bg-border"
						style={{
							opacity: leftSidebarOpen ? "0" : "",
							height: leftSidebarOpen ? "0px" : "",
							marginBlock: leftSidebarOpen ? "4px" : "",
						}}
					/>
					<div className="flex flex-row w-full max-h-full h-full p-0 overflow-hidden">
						<AnimatePresence mode="popLayout" initial={false}>
							<motion.div
								{...ONLINE_TRANSITION(online)}
								key={online ? "online" : "local"}
								className="flex flex-col  max-h-full min-w-full max-w-full "
							>
								{online ? <LeftOnline /> : <LeftLocal />}
							</motion.div>
						</AnimatePresence>
					</div>

					<Separator className="w-full ease-linear duration-200 min-h-[1px] mt-2.5 bg-border" />
					<SidebarFooter
						className="flex flex-col gap-0 items-center justify-between w-full overflow-hidden duration-200"
						style={{
							minHeight: leftSidebarOpen ? "7.5rem" : "11rem",
						}}
					>
						<Downloads />
						<div
							className="flex items-center justify-between w-full overflow-hidden duration-200"
							style={{
								flexDirection: leftSidebarOpen ? "row" : "column",
								minHeight: leftSidebarOpen ? "3rem" : "6.5rem",
							}}
						>
							{/* <Restore leftSidebarOpen={leftSidebarOpen} /> */}
							<BatchOperations leftSidebarOpen={leftSidebarOpen} />
							<Settings leftSidebarOpen={leftSidebarOpen} />
						</div>
					</SidebarFooter>
				</div>
			</SidebarContent>
		</Sidebar>
	);
}
export default LeftSidebar;
