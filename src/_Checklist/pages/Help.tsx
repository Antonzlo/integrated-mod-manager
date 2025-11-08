import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { resetWithBackup } from "@/utils/filesys";
import { GAME, SOURCE, TARGET, UPDATER_OPEN } from "@/utils/vars";
import { useAtom, useSetAtom } from "jotai";
import { BadgeHelpIcon } from "lucide-react";

function Help({ setPage }: { setPage: (page: number) => void }) {
	const [game, setGame] = useAtom(GAME);
	const setSource = useSetAtom(SOURCE);
	const setTarget = useSetAtom(TARGET);
	const setUpdaterOpen = useSetAtom(UPDATER_OPEN);
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					className="w-38.75 showAfterDelay fixed bottom-5 left-1/2 -translate-x-1/2 data-[theme=zzz]:bg-destructive text-ellipsis h-12 overflow-hidden"
					// style={{ width: leftSidebarOpen ? "" : "3rem" }}
				>
					<BadgeHelpIcon className="h-full aspect-square " /> Help
				</Button>
			</DialogTrigger>
			<DialogContent>
				<header className="space-y-1 my-6 text-center">
					<h2 className="text-2xl font-semibold text-foreground">Help</h2>
					<p className="text-sm text-muted-foreground">
						Work through these quick checks before reaching out for support.
					</p>
				</header>
				<section className="space-y-4">
					<div className="flex items-center justify-between gap-3 rounded-md border border-border/40 bg-sidebar/20 py-6 p-3">
						<div className="text-sm text-left">
							<h3 className="font-medium text-foreground">Accidentally selected the wrong game?</h3>
							<p className="text-muted-foreground text-xs">No worries, you can re-select your game.</p>
						</div>
						<Button
							size="sm"
							className="w-24"
							onClick={() => {
								setGame("");
								setPage(1);
							}}
						>
							Select
						</Button>
					</div>
					<div className="flex items-center justify-between gap-3 rounded-md border border-border/40 bg-sidebar/20 py-6 p-3">
						<div className="text-sm text-left">
							<h3 className="font-medium text-foreground">Are you sure you selected the correct path?</h3>
							<p className="text-muted-foreground text-xs">
								Verify that the {game}MI and mod directories are pointing to the right location.
							</p>
						</div>
						<Button
							size="sm"
							className="w-24"
							onClick={() => {
								setSource("");
								setTarget("");
								setPage(2);
							}}
						>
							Change
						</Button>
					</div>
					<div className="flex items-center justify-between gap-3 rounded-md border border-border/40 bg-sidebar/20 py-6 p-3">
						<div className="text-sm text-left">
							<h3 className="font-medium text-foreground"> Is IMM up to date?</h3>
							<p className="text-muted-foreground text-xs">
								Updates often contain fixes for issues you might be experiencing.
							</p>
						</div>
						<Button
							size="sm"
							className="w-24"
							onClick={() => {
								setUpdaterOpen(true);
							}}
						>
							Check
						</Button>
					</div>
					<div className="flex items-center justify-between gap-3 rounded-md border border-border/40 bg-sidebar/20 py-6 p-3">
						<div className="text-sm text-left">
							<h3 className="font-medium text-foreground"> Backup current config &amp; reset IMM</h3>
							<p className="text-muted-foreground text-xs">
								Create a backup and restore defaults to clear out conflicting settings.
							</p>
							<p className="text-muted-foreground text-xs">
								You can import the backed-up configs from the settings menu.
							</p>
						</div>
						<Button
							size="sm"
							className="w-24 text-destructive hover:bg-destructive data-zzz:hover:bg-destructive data-zzz:text-destructive data-zzz:hover:text-background hover:text-background"
							onClick={() => resetWithBackup()}
						>
							Reset
						</Button>
					</div>
				</section>
				<footer className="space-y-2  text-sm text-center">
					<p className="opacity-50">Still stuck?</p>

					<div className="flex items-center gap-2">
						<label className="opacity-50"> Contact developer :</label>
						<a
							href="https://gamebanana.com/mods/593490"
							target="_blank"
							className="flex gap-1 items-center text-xs opacity-50 hover:opacity-100 duration-200"
						>
							{" "}
							<img className="h-4" src="https://images.gamebanana.com/static/img/favicon/32x32.png" />{" "}
							<img className="h-3" src="https://images.gamebanana.com/static/img/logo.png" />
						</a>
						<label className="opacity-50">-</label>
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
				</footer>
			</DialogContent>
		</Dialog>
	);
}

export default Help;
