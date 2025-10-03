import img1 from "@/demo/02_online.png"
import img2 from "@/demo/03_online_home.png"
import img3 from "@/demo/04_online_mod.png"
import { ArrowRightIcon } from "lucide-react";
function Page5({ setPage }: { setPage: (page: number) => void }) {
	return (
		<div
			className="text-muted-foreground fixed flex flex-col items-center justify-center w-screen h-screen gap-16"
			onClick={() => {
				setPage(5);
			}}>
				<div className=" text-3xl">
					{"Browse & Install Mods".split("").map((letter, index) => (
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
				<div className="flex items-center gap-4">
					<div className="flex flex-col gap-4">
						<img src={img1} className="max-h-[50vh] rounded-lg border border-border shadow-lg" />
						<div className="text-muted-foreground/50 text-center">Switch to Online Mode</div>
						</div>
					<ArrowRightIcon className="text-accent w-8 h-8" />
					<div className="flex flex-col gap-4">
						<img src={img2} className="max-h-[66vh] rounded-lg border border-border shadow-lg" />
						<div className="text-muted-foreground/50 text-center">Browse Mods from Gamebanana</div>
						</div>
					<ArrowRightIcon className="text-accent w-8 h-8" />
					<div className="flex flex-col gap-4">
						<img src={img3} className="max-h-[66vh] rounded-lg border border-border shadow-lg" />
						<div className="text-muted-foreground/50 text-center">Update & Install Mods</div>
					</div>
				</div>
				
			</div>
	);
}
export default Page5;