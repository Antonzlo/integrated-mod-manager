import {
	CATEGORIES,
	DATA,
	GAME,
	LANG,
	PRESETS,
	resetAtoms,
	SETTINGS,
	SOURCE,
	store,
	TARGET,
	TEXT_DATA,
	TYPES,
	IMM_UPDATE,
	NOTICE_OPEN,
	NOTICE,
	UPDATER_OPEN,
	FIRST_LOAD,
} from "./vars";
import { check, type Update } from "@tauri-apps/plugin-updater";

import { path } from "@tauri-apps/api";
import { invoke } from "@tauri-apps/api/core";
import { currentMonitor, PhysicalSize } from "@tauri-apps/api/window";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { exists, writeTextFile, readTextFile } from "@tauri-apps/plugin-fs";
import defConfig from "../default.json";
import defConfigXX from "../defaultXX.json";
import { apiClient } from "./api";
import { managedSRC, VERSION } from "./consts";
import { switchGameTheme } from "./theme";
import { executeXXMI, isGameProcessRunning } from "./autolaunch";
// import { updateIni } from "./iniUpdater";
import { join, setHotreload, stopWindowMonitoring } from "./hotreload";
import { registerGlobalHotkeys } from "./hotkeyUtils";
import { TEXT } from "./text";
import { unregisterAll } from "@tauri-apps/plugin-global-shortcut";
import { safeLoadJson, setImageServer } from "./utils";
import { addToast } from "@/_Toaster/ToastProvider";
import { Category, Preset, Settings } from "./types";
import { resetPageCounts } from "@/_Main/MainOnline";
// import { v2_0_4_migration } from "./filesys";

let config: any = { ...defConfig };
let configXX: any = { ...defConfigXX };
let dataDir = "";
export function getDataDir() {
	return dataDir;
}
let appData = "";
let categories: Category[] = [];
export const window = getCurrentWebviewWindow();
export function setWindowType(type: number) {
	if (type == 0) {
		window.setFullscreen(false);
		window.setDecorations(true);
		currentMonitor().then((x) => {
			if (x?.size) window.setSize(new PhysicalSize(x.size.width * 0.8, x.size.height * 0.8));
		});
	} else if (type == 1) {
		window.setFullscreen(false);
		window.setDecorations(false);
		currentMonitor().then((x) => {
			if (x?.size) window.setSize(new PhysicalSize(x.size.width * 0.8, x.size.height * 0.8));
		});
	} else if (type == 2) {
		window.setFullscreen(true);
	}
}
invoke<string>("get_image_server_url").then((url) => {
	setImageServer(url + "/preview");
});
export async function updateConfig(oconfig = null as any) {

	if (!oconfig) oconfig = JSON.parse(await readTextFile("config.json"));
	console.log("Updating config from version:", oconfig);
	if (oconfig.version >= "2.1.0") return oconfig;
	let config = {
		version: VERSION,
		updatedAt: new Date().toISOString(),
		bgOpacity: oconfig.settings.opacity || 1,
		winOpacity: 1,
		winType: oconfig.settings.type || 0,
		bgType: oconfig.settings.bgType || 2,
		listType: 0,
		nsfw: oconfig.settings.nsfw || 1,
		toggleClick: oconfig.settings.toggle || 2,
		ignore: "2.0.4",
		clientDate: oconfig.settings.clientDate || "",
		exeXXMI: oconfig.settings.appDir || "",
		lang: oconfig.settings.lang || "",
		game: "",
	};
	let data = oconfig.data || {};
	let keys = Object.keys(data);
	for (let key of keys) {
		if (key.startsWith("\\")) {
			data[key.substring(1)] = data[key];
			delete data[key];
		}
	}
	let presets = oconfig.presets.map((preset: Preset) => {
		let newPreset: Preset = { name: preset.name || "Preset", data: [], hotkey: preset?.hotkey || "" };
		if (preset.data && Array.isArray(preset.data)) {
			newPreset.data = preset.data.map((item: string) => (item.startsWith("\\") ? item.substring(1) : item));
		}
		return newPreset;
	});
	await writeTextFile(
		`configWW.json`,
		JSON.stringify(
			{
				version: VERSION,
				sourceDir: "",
				targetDir: "",
				categories: [],
				settings: {
					launch: oconfig.settings.launch || 0,
					hotReload: oconfig.settings.hotReload || 1,
					onlineType: oconfig.settings.onlineType || "Mod",
				},
				data: oconfig.data || {},
				presets: presets || [],
				updatedAt: new Date().getTime(),
			},
			null,
			2
		)
	);
	store.set(FIRST_LOAD, true);
	return config;
}
export async function initGame(game: string) {
	if (await exists(`config${game}.json`)) {
		configXX = JSON.parse(await readTextFile(`config${game}.json`));
	} else configXX = { ...defConfigXX };
	configXX.game = game;
	switchGameTheme(game == "ZZ" ? "zzz" : "wuwa");
	dataDir = `${appData}\\XXMI Launcher\\${game}MI`;
	writeTextFile(`config${game}.json`, JSON.stringify(configXX, null, 2));
	apiClient.setGame(game as any);
	await setCategories(game);
	// Validate source and target dirs
	if (configXX.sourceDir && !(await exists(join(configXX.sourceDir, managedSRC)))) configXX.sourceDir = "";
	if (configXX.targetDir && !(await exists(join(configXX.targetDir, "Mods")))) configXX.targetDir = "";
	store.set(SOURCE, configXX.sourceDir || "");
	store.set(TARGET, configXX.targetDir || "");
	store.set(
		SETTINGS,
		(prev) => ({ global: { ...prev.global, game }, game: { ...prev.game, ...configXX.settings } } as Settings)
	);
	store.set(TYPES, apiClient.generic.types);
	store.set(DATA, configXX.data || {});
	store.set(PRESETS, configXX.presets || []);
	return configXX;
}
store.sub(SETTINGS, async () => {
	const settings = store.get(SETTINGS);
	const compare = {
		src: [settings.global.game, settings.global.lang],
		to: [GAME, LANG],
		names: ["game", "lang"],
	};
	for (let i = 0; i < compare.src.length; i++) {
		if (compare.src[i] !== store.get(compare.to[i])) {
			if (compare.names[i] === "lang" && compare.src[i])
				store.set(TEXT_DATA, TEXT[compare.src[i] as keyof typeof TEXT] || TEXT["en"]);
			// else if (compare.names[i] === "game" && compare.src[i]) await initGame(compare.src[i]);
			store.set(compare.to[i] as any, compare.src[i]);
		}
	}
});
async function setCategories(game?: string) {
	if (!game) return;
	try {
		categories = await apiClient.categories();
		//console.log("Fetched categories:", categories);
		if (!categories || categories.length == 0) throw "No categories found, please verify the directories again";
	} catch (e) {
		try {
			// if (config.game) configXX = await initGame(config.game);
		} finally {
			categories = configXX.categories || apiClient.categoryList;
		}
	} finally {
		if (!categories || categories.length == 0) return;
		store.set(CATEGORIES, categories);
	}
}
function removeHelpers() {
	stopWindowMonitoring();
	unregisterAll();
	resetPageCounts();
}
async function initHelpers() {
	if (configXX.settings.launch && (await exists(config.exeXXMI)) && ["WW", "ZZ", "GI", "SR"].includes(config.game)) {
		isGameProcessRunning(config.game).then((running) => {
			if (!running) {
				executeXXMI(config.exeXXMI);
				addToast({
					type: "info",
					message: "Launching Game",
				});
			}
		});
	}
	setHotreload(configXX.settings.hotReload as 0 | 1 | 2, config.game, configXX.targetDir);

	registerGlobalHotkeys();
}
export async function checkWWMM(){
	const wwmmPath = join(await path.localDataDir(), "Wuwa Mod Manager (WWMM)","config.json");
	if(await exists(wwmmPath)){
		console.log('exists')
		return  await readTextFile(wwmmPath) || null;
	}
	return null
}
export async function main() {
	invoke("get_username");
	resetAtoms();
	removeHelpers();
	appData = await path.dataDir();
	dataDir = `${appData}\\XXMI Launcher\\__MI`;
	const exeXXMI = `${appData}\\XXMI Launcher\\Resources\\Bin\\XXMI Launcher.exe`;
	if (!(await exists("config.json"))) {
		await writeTextFile("config.json", JSON.stringify(defConfig, null, 2));
	}
	config = safeLoadJson(defConfig, JSON.parse(await readTextFile("config.json")));
	apiClient.setClient(config.clientDate || "");
	if (config.game) apiClient.setGame(config.game);
	if(!config.exeXXMI && !config.game && !config.lang){
		store.set(FIRST_LOAD, true);
		const temp = await checkWWMM();
		if(temp)await updateConfig(JSON.parse(temp));
	}
	if (config.version < "2.1.0") {
		config = await updateConfig();
	}
	writeTextFile("config.json", JSON.stringify(config, null, 2));
	if (config.game) configXX = await initGame(config.game);

	setWindowType(config.winType);

	const bg = document.querySelector("body");
	if (bg)
		bg.style.backgroundColor = "color-mix(in oklab, var(--background) " + config.bgOpacity * 100 + "%, transparent)";
	if (config.game && (configXX.targetDir == "" || configXX.sourceDir == "")) {
		if (await exists(dataDir)) {
			configXX.targetDir = dataDir;
			configXX.sourceDir = dataDir;
		} else {
			dataDir = "";
		}
	}
	if (config.exeXXMI == "" && (await exists(exeXXMI))) {
		config.exeXXMI = exeXXMI;
	}
	store.set(SETTINGS, (prev) => ({
		global: { ...prev.global, ...config },
		game: { ...prev.game, ...configXX.settings },
	}));
	initHelpers();
	let update: Update | null = null;
	try {
		const timeoutPromise = new Promise<never>((_, reject) =>
			setTimeout(() => reject(new Error("Update check timeout")), 2000)
		);
		update = await Promise.race([check(), timeoutPromise]);
	} catch (error) {
		update = null;
	}
	if (update) {
		let lang = config.lang || "en";
		let parsedBody: any = {};
		if (update.body) {
			try {
				parsedBody = JSON.parse(update.body);
				parsedBody = parsedBody[lang as keyof typeof parsedBody] || parsedBody;
			} catch (e) {
				parsedBody = {};
			}
		}
		const notice = parsedBody.notice || {};
		const lastConfig = config.notice || 0;
		let noticeOpen = false;
		if (notice.id > 0 && notice.ver > VERSION) {
			store.set(NOTICE, (prev: any) => ({ ...prev, ...notice }));
			if (notice.id !== lastConfig || notice.ignoreable == 0) {
				noticeOpen = true;
				store.set(NOTICE_OPEN, noticeOpen);
			}
		}
		store.set(IMM_UPDATE, {
			version: update.version,
			date: update.date || "",
			body: JSON.stringify(parsedBody) || "{}",
			status: "available",
			raw: update,
		});
		if (!noticeOpen && update.version > config.ignore) {
			store.set(UPDATER_OPEN, true);
		}
		store.set(SETTINGS, (prev) => ({
			...prev,
			global: {
				...prev.global,
				notice: notice.id,
				ignore: update.version,
			},
		}));
	}

	// store.set(settingsDataAtom, config.settings as Settings);
	// if(config.clientDate){
	// 	//console.log("Client date exists:", config.clientDate);
	// }
	// else{
	// 	//console.log("Client date does not exist, fetching...");
	// }
	// store.set(onlineTypeAtom, config.settings.onlineType ?? "Mod");
	// if (!firstLoad) {
	// 	if (config.settings.clientDate) fetch(`${HEALTH_CHECK}/${VERSION||"2.0.1"}/${config.settings.clientDate}`);
	// 	else {
	// 		fetch(`${HEALTH_CHECK}/${VERSION||"2.0.1"}/_${Date.now()}`)
	// 			.then((res) => res.json())
	// 			.then((data) => {
	// 				if (data.client) {
	// 					config.settings.clientDate = data.client;
	// 					store.set(settingsDataAtom, config.settings as Settings);
	// 					saveConfig();
	// 				}
	// 			});
	// 	}
	// }
	// updateInfo("Getting directory info...");
	// if (!firstLoad) {
	// 	getDirResructurePlan();
	// }
	// updateInfo("Initialization complete.", 2000);

	// setupImageServerListeners();
}
