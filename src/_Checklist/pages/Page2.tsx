import { saveConfigs } from "@/utils/filesys";
import { getPrevGame, initGame, main } from "@/utils/init";
import { switchGameTheme } from "@/utils/theme";
import { Games } from "@/utils/types";
import { GAME, INIT_DONE, SETTINGS, TEXT_DATA } from "@/utils/vars";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";

function Page2({ setPage }: { setPage: (page: number) => void }) {
	const text = useAtomValue(TEXT_DATA);
	const game = useAtomValue(GAME);
	const setInitDone = useSetAtom(INIT_DONE);
	const [settings, setSettings] = useAtom(SETTINGS);
	async function switchGame(gameCode: Games) {
		if(!gameCode) return;
		setInitDone(false);
		setSettings((prev) => ({ ...prev, global: { ...prev.global, game: gameCode } }));
		await saveConfigs(true);
		setTimeout(() => {
			switchGameTheme(gameCode);
		}, 100);

		setPage(0);
		setTimeout(() => {
			main();
		}, 100);
	}
	useEffect(() => {
		if (game) setPage(2);
	}, [game]);
	useEffect(() => {
		function checkEscape(event: KeyboardEvent) {
			if (event.key === "Escape") {
				const prevGame = getPrevGame();
				if (prevGame && !game) {
					switchGame(prevGame as Games);
				}
			}
		}
		window.addEventListener("keydown", checkEscape);
		return () => window.removeEventListener("keydown", checkEscape);
	}, []);
	return (
		<div className="text-muted-foreground fixed flex flex-col items-center justify-center w-screen h-screen gap-4">
			<div className="mb-4 text-3xl">
				{text.Select.split("").map((letter, index) => (
					<span
						key={index}
						className="wave-letter"
						style={{
							animationDelay: `${index * 0.1}s`,
						}}
					>
						{letter === " " ? "\u00A0" : letter}
					</span>
				))}
			</div>
			<div className="flex items-center justify-center gap-16 select-none">
				<div
					onClick={async () => {
						if (!settings.global.game) initGame("WW");
						else {
							switchGame("WW");
						}
					}}
					className="flex duration-200 border-2 border-wuwa-accent/30 hover:shadow-lg hover:-mt-2 active:scale-90 shadow-wuwa-accent bg-wuwa-accent/7 p-6 rounded-md aspect-[3/2] min-w-56 flex-col items-center wuwa-font"
				>
					<img src="/WWLogo.png" className="max-h-40 " />
					<label className="mt-8 text-2xl">WuWa</label>
				</div>
				<div
					onClick={async () => {
						if (!settings.global.game) initGame("ZZ");
						else {
							switchGame("ZZ");
						}
					}}
					className="flex duration-200 border-2 border-zzz-accent-2/30 hover:shadow-lg hover:-mt-2 active:scale-90 shadow-zzz-accent-2 bg-zzz-accent-2/7 p-6 rounded-md min-w-56.5 flex-col items-center zzz-font"
				>
					<img src="/ZZLogo.png" className="max-h-40 " />
					<label className="mt-8 text-2xl">Z·Z·Z</label>
				</div>
				<div
					onClick={async () => {
						if (!settings.global.game) initGame("GI");
						else {
							switchGame("GI");
						}
					}}
					className="flex duration-200 border-2 border-gi-accent/30 hover:shadow-lg hover:-mt-2 active:scale-90 shadow-gi-accent bg-gi-accent/7 p-6 rounded-md aspect-[3/2] min-w-56.5 flex-col items-center wuwa-font"
				>
					<img src="/GILogo.png" className="max-h-40 mb-2 -mt-2 scale-110" />
					<label className="mt-8 text-2xl">Genshin</label>
				</div>
			</div>
		</div>
	);
}
export default Page2;
