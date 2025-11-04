import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { GAME, HELP_OPEN, TEXT_DATA } from "@/utils/vars";
import { useAtom, useAtomValue } from "jotai";
import { ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";
import CarouselTut from "./CarouselTut";
import { AnimatePresence, motion } from "motion/react";

function Help() {
	const textData = useAtomValue(TEXT_DATA);
	const data = textData._Help;
	const keys = Object.keys(data);
	const [helpOpen, setHelpOpen] = useAtom(HELP_OPEN);
	const [selectedItem, setSelectedItem] = useState(-1);
	const [subIndex, setSubIndex] = useState(0);
	useEffect(() => {
		setSubIndex(0);
	}, [selectedItem]);
	const game = useAtomValue(GAME);
	return (
		<Dialog open={helpOpen} onOpenChange={setHelpOpen}>
			<DialogTrigger asChild>
				<Button className="aspect-square border text-ellipsis bg-sidebar p-0 flex flex-col h-full overflow-hidden text-xs">
					<HelpCircle className="scale-120 mb-0.5" />
				</Button>
			</DialogTrigger>
			<DialogContent className="game-font gap-8 flex flex-col min-h-200 min-w-280">
				<div className="min-h-fit text-accent mt-6 text-3xl">{textData.Tutorials}</div>
				<div className="w-255 gap-12 h-161 overflow-hidden flex">
					<div className="h-full min-w-82 flex flex-col gap-2 overflow-hidden">
						{/* <Input placeholder="Search..." /> */}
						<div className="w-82 h-full data-zzz:border-0 border data-zzz:gap-1 flex flex-col rounded-sm data-zzz:pr-1 overflow-y-auto overflow-x-hidden">
							{Object.keys(data).map((key, index) => (
								<Button
									key={key}
									onClick={() => setSelectedItem((prev)=>prev === index ? -1 : index)}
									className={"w-full h-10 bgaccent text-muted-foreground"}
									style={{
										backgroundColor:
											game == "WW"
												? selectedItem === index
													? "var(--border)"
													: index % 2 == 0
													? "#1b1b1b50"
													: "#31313150"
												: selectedItem === index
												? "var(--accent)"
												: "",
										color: game == "ZZ" && selectedItem === index ? "var(--background)" : "",
										animation: game == "ZZ" && selectedItem === index ? "" : "none",
									}}
								>
									{data[key as keyof typeof data].title}
								</Button>
							))}
						</div>
					</div>
					<div className="h-full justify-center  flex-col flex w-full">
						<AnimatePresence mode="wait">
							{selectedItem > -1 ? (
								<motion.div
									key={keys[selectedItem]}
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 1.05 }}
									className="h-full justify-center  flex-col flex w-full"
								>
									<CarouselTut subIndex={subIndex} setSubIndex={setSubIndex} data={data[keys[selectedItem] as keyof typeof data]?.content} title={keys[selectedItem]} />
								</motion.div>
							) : (
								<>
									<motion.div
										className="text-muted-foreground pointer-events-none gap-4 fixed flex flex-col items-center justify-center w-[680px] h-full"
										key="empty"
										initial={{ opacity: 0, scale: 0.95 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 1.05 }}
									>
										<div className="mb-4 logo min-h-60 min-w-60 brightness-50"></div>
										{/* <div className="mb-4 text-2xl">--Select--</div> */}
									</motion.div>
								</>
							)}
						</AnimatePresence>
					</div>
				</div>
				<div className="flex w-full -mt-12 h-10">
					<div className="min-w-94" />
					<div className="w-full flex justify-between">
						<Button className=" min-w-28" disabled={selectedItem <= 0 && subIndex === 0} onClick={() => {
							if(subIndex === 0){
								setSelectedItem((prev) => (prev - 1 ));
							}
							else{
								setSubIndex((prev) => prev - 1);
							}
						}}>
							<ChevronLeft className="-ml-2" /> {textData.Prev}
						</Button>
						<Button className="min-w-28" disabled={(selectedItem === keys.length - 1) && (data[keys[selectedItem] as keyof typeof data]?.content.length - 1 === subIndex)} onClick={() => {
							if(selectedItem<0 || data[keys[selectedItem] as keyof typeof data]?.content.length - 1 === subIndex){
								setSelectedItem((prev) => (prev + 1 ));
								setSubIndex(0);
							}
							else{
								setSubIndex((prev) => prev + 1);
							}
						}}>
							{textData.Next} <ChevronRight className="-mr-2"/>
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default Help;
