import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { VERSION } from "@/utils/consts";
import { getTimeDifference, isOlderThanOneDay } from "@/utils/utils";
import { IMM_UPDATE, SETTINGS, TEXT_DATA, UPDATER_OPEN } from "@/utils/vars";
import { Checkbox } from "@/components/ui/checkbox";
import { useAtom, useAtomValue } from "jotai";
import { CircleAlert, DownloadIcon, Loader2Icon, UploadIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { saveConfigs } from "@/utils/filesys";
let prev = 0;
let counter = 3000;
function Updater() {
	const textData = useAtomValue(TEXT_DATA);
	const [update, setUpdate] = useAtom(IMM_UPDATE);
	const ref1 = useRef<HTMLDivElement>(null);
	const ref2 = useRef<HTMLDivElement>(null);
	const ref3 = useRef<HTMLDivElement>(null);
	const [updaterOpen, setUpdaterOpen] = useAtom(UPDATER_OPEN);
	const [settings, setSettings] = useAtom(SETTINGS);
	const preReleases = settings.global.preReleases;
	useEffect(() => {
		let interval: ReturnType<typeof setInterval>;
		if (update?.status === "ready" && counter == 3000)
			interval = setInterval(() => {
				if (ref3.current)
					ref3.current.innerHTML = textData._Main._components._Updater.In.replace(
						"<time>",
						Math.ceil(counter / 10).toString()
					);
				counter--;
				if (counter < 0) {
					update.raw?.install();
					clearInterval(interval);
				}
			}, 100);
	}, [update, ref3]);
	let maj = [];
	let min = [];
	let pat = [];
	if (update?.body) {
		let json = JSON.parse(update.body);
		//console.log(json)
		maj = json.major || [];
		min = json.minor || [];
		pat = json.patch || [];
	}

	return (
		<Dialog open={updaterOpen} onOpenChange={setUpdaterOpen}>
			<DialogTrigger asChild>
				<Button className="max-w-32 text-ellipsis bg-sidebar p-0 flex flex-col w-full h-full overflow-hidden text-xs">
					{update && update.status !== "ignored"
						? {
								available: (
									<div className="min-w-24 min-h-12 text-accent flex items-center justify-center w-full gap-1 pointer-events-none">
										<UploadIcon className="min-h-4 min-w-4" />
										<Label className=" w-fit max-w-24 text-xs pointer-events-none">{textData.Update}</Label>
									</div>
								),
								downloading: (
									<>
										<div
											key={"down1"}
											className="fade-in max-w-24 min-w-24 -mb-14 min-h-12 w-full  z-10 pointer-events-none"
										>
											<div
												ref={ref1}
												className="min-h-12 height-in bg-accent text-background hover:brightness-125 flex flex-col self-start justify-center overflow-hidden rounded-lg"
												style={{ width: prev + "%" }}
											>
												<div className="min-w-24 fade-in flex items-center justify-center gap-1 pointer-events-none">
													<Loader2Icon className="min-h-4 min-w-4 animate-spin" />

													<Label className=" w-fit max-w-24 text-[0.6rem] pointer-events-none">
														{textData._Main._components._Updater.Downloading}
													</Label>
												</div>
											</div>
										</div>

										<div
											key={"down2"}
											className="fade-in min-w-24 min-h-12 text-accent flex items-center justify-center w-full gap-1 pointer-events-none"
										>
											<Loader2Icon className="min-h-4 min-w-4 animate-spin" />

											<Label className=" w-fit max-w-24 text-[0.6rem] pointer-events-none">
												{textData._Main._components._Updater.Downloading}
											</Label>
										</div>
									</>
								),
								ready: (
									<div className="min-w-24 min-h-12 text-background bg-accent flex items-center justify-center w-full gap-1 pointer-events-none">
										<DownloadIcon className="min-h-4 min-w-4" />
										<Label className=" w-fit max-w-24 text-xs pointer-events-none">{textData.Install}</Label>
									</div>
								),
								error: (
									<div className="min-w-24 min-h-12 text-background bg-accent flex items-center justify-center w-full gap-1 pointer-events-none">
										<CircleAlert className="min-h-4 min-w-4 text-destructive" />
										<Label className=" w-fit max-w-24 text-xs pointer-events-none text-destructive">
											{textData._Main._components._Updater.Error}
										</Label>
									</div>
								),
								installed: textData.Installed,
						  }[update.status]
						: `v${VERSION}`}
				</Button>
			</DialogTrigger>
			<DialogContent className="game-font">
				<div className="min-h-fit text-accent mt-6 text-3xl">{textData._Main._components._Updater.Updater}</div>
				<div className="min-h-fit -mt-4 text-muted-foreground">v{VERSION}</div>
				<div className="flex flex-col -mt-4 mb-6 items-center justify-center w-full">
					<div className=" flex items-center gap-2">
						<Checkbox
							id="checkbox"
							className=" checked:bg-accent bgaccent"
							onCheckedChange={(checked) => {
								setSettings((prev) => ({
									...prev,
									global: {
										...prev.global,
										preReleases: checked ? true : false,
									},
								}));
								saveConfigs();
								setUpdate(
									(prev) =>
										prev && {
											...prev,
											status: checked || isOlderThanOneDay(prev.date || "") ? "available" : "ignored",
										}
								);
							}}
							checked={preReleases}
						/>
						<label className="text-muted-foreground text-sm">Get pre-releases</label>
					</div>
				</div>
				{update && update.status !== "ignored" && (
					<>
						<div className="min-h-2 text-xl text-accent w-full ">
							Version {update.version}{" "}
							<span className="text-muted-foreground text-base">
								({getTimeDifference(Date.now() / 1000, new Date(update.date).getTime() / 1000)}{" "}
								{textData._Main._components._Updater.ago})
							</span>
						</div>
						<Separator className="my-2" />
					</>
				)}
				<div className="flex flex-col px-4 overflow-y-auto overflow-x-hidden  w-full h-82 max-h-82">
					{update && update.status !== "ignored" ? (
						<>
							{maj.length > 0 && <div className="min-h-6 text-accent">{textData._Main._components._Updater.Maj}:</div>}
							{maj.map((item: string, index: number) => (
								<div key={index} className="min-h-fit text-lg text-muted-foreground flex items-center mt-1 gap-2">
									<div className="min-w-1 min-h-1 self-start mt-3 aspect-square bg-accent rounded-full"></div>
									<div>{item}</div>
								</div>
							))}
							{min.length > 0 && (
								<div className="min-h-6 text-accent mt-4">{textData._Main._components._Updater.Min}:</div>
							)}
							{min.map((item: string, index: number) => (
								<div key={index} className="min-h-fit text-base text-muted-foreground flex items-center mt-0.5 gap-2">
									<div className="min-w-1 min-h-1 self-start mt-2.5 aspect-square bg-accent rounded-full"></div>
									<div>{item}</div>
								</div>
							))}
							{pat.length > 0 && (
								<div className="min-h-6 text-accent mt-4">{textData._Main._components._Updater.Patch}:</div>
							)}
							{pat.map((item: string, index: number) => (
								<div key={index} className="min-h-fit text-muted-foreground flex items-center gap-2 mt-0.5">
									<div className="min-w-1 min-h-1 self-start mt-2.5 aspect-square bg-accent rounded-full"></div>
									<div>{item}</div>
								</div>
							))}
						</>
					) : (
						<div className="h-full w-full items-center justify-center flex flex-col text-muted-foreground">
							{textData._Main._components._Updater.Lat}
							<div className="absolute flex items-center gap-2  mt-124">
								<label className="opacity-40">{textData.BFR}</label>
								<label>:</label>
								<a
									href="https://gamebanana.com/mods/593490"
									target="_blank"
									className="flex gap-1 items-center text-xs opacity-50 hover:opacity-100 duration-200"
								>
									{" "}
									<img className="h-4" src="https://images.gamebanana.com/static/img/favicon/32x32.png" />{" "}
									<img className="h-3" src="https://images.gamebanana.com/static/img/logo.png" />
								</a>
								|
								<a
									href="https://discord.gg/QGkKzNapXZ"
									target="_blank"
									className="flex gap-1 items-center text-xs  opacity-50 hover:opacity-100 duration-200"
								>
									{" "}
									<img
										className="h-6"
										src="https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/67ece93be2524af5cf14dc1c_Logo-black-bg.svg"
									/>
								</a>
							</div>
						</div>
					)}
				</div>
				{update && update.status !== "ignored" && (
					<div className="flex items-center justify-end w-full h-10 mt-2">
						<div ref={ref3} className="text-muted-foreground text-xs w-full">
							{update.status == "ready" ? (
								<>{textData._Main._components._Updater.Soon}</>
							) : (
								textData._Main._components._Updater.Use
							)}
						</div>
						<Button
							className="w-28"
							disabled={update.status == "downloading" || update.status == "installed"}
							// disabled={disabled}
							onClick={async () => {
								if ((update.status === "available" || update.status === "error") && update.raw) {
									let downloaded = 0;
									let contentLength = 0;

									await update.raw?.download((event: any) => {
										switch (event.event) {
											case "Started":
												contentLength = event.data.contentLength;
												setUpdate((prev) => (prev ? { ...prev, status: "downloading" } : prev));
												//console.log(`started downloading ${event.data.contentLength} bytes`);
												break;
											case "Progress":
												downloaded += event.data.chunkLength;
												prev = Math.floor((downloaded / contentLength) * 100);
												if (ref1.current) ref1.current.style.width = prev + "%";
												if (ref2.current) ref2.current.innerHTML = `${prev}%`;

												//console.log(`downloaded ${downloaded} from ${contentLength}`);
												break;
											case "Finished":
												counter = 3000;
												setUpdate((prev) => (prev ? { ...prev, status: "ready" } : prev));
												setUpdaterOpen(true);
												//console.log("download finished");
												break;
										}
									});
								} else if (counter > 0) {
									update.raw?.install();
								}
							}}
						>
							<div ref={ref2}>
								{
									{
										available: textData.Update,
										downloading: textData._Main._components._Updater.Downloading,
										ready: textData._Main._components._Updater.InstallNow,
										error: textData._Main._components._Updater.Retry,
										installed: textData.Installed,
									}[update.status]
								}
							</div>
						</Button>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

export default Updater;
