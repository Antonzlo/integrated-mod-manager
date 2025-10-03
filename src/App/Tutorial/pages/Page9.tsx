import logo from "@/logo.png";
import { firstLoadAtom, tutorialModeAtom } from "@/utils/vars";
import { useSetAtom } from "jotai";
import { ArrowUpIcon } from "lucide-react";
function Page9() {
	const setTutorialMode = useSetAtom(tutorialModeAtom);
	const setFirstLoad = useSetAtom(firstLoadAtom)
	return (
		<div
			className="text-muted-foreground fixed flex flex-col items-center justify-center w-screen h-screen"
			onClick={() => {
				setTutorialMode(false);
				setFirstLoad(false);
			}}>
			<div className="mb-8 text-3xl">
				{"Tutorial Finished!".split("").map((letter, index) => (
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
			<div className="min-h-16 min-w-16  flex items-center justify-center h-32 gap-5 p-0">
				<div
					id="WWMMLogo"
					className="aspect-square h-20"
					style={{
						background: "url(" + logo + ")",
						backgroundSize: "contain",
						backgroundRepeat: "no-repeat",
						backgroundPosition: "center",
					}}></div>
				<div className="flex flex-col w-48 text-center duration-200 ease-linear">
					<label className="text-5xl text-[#eaeaea] min-w-fit font-bold">WuWa</label>
					<label className="min-w-fit text-accent/75 text-2xl">Mod Manager</label>
				</div>
			</div>
			<div className="text-muted-foreground/50 -ml-52 flex flex-col items-center -mt-4 text-sm">
				<ArrowUpIcon className="h-8" />
				<div>You can go through the tutorial again by</div>
				<div> clicking on the App Icon on the top left</div>
			</div>
			<div className="text-muted-foreground/50 top-1 right-3 fixed text-sm">More interactive tutorials will be added in the future. Stay tuned!</div>
			<div className="text-muted-foreground/50 bottom-8 fixed">Click anywhere to end the tutorial</div>
		</div>
	);
}
export default Page9;