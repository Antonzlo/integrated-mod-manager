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
	ONLINE_DATA,
	XXMI_DIR,
	XXMI_MODE,
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
import { GAMES, VERSION } from "./consts";
import { switchGameTheme } from "./theme";
import { executeXXMI, isGameProcessRunning } from "./autolaunch";
// import { updateIni } from "./iniUpdater";
import { join, setHotreload, stopWindowMonitoring } from "./hotreload";
import { registerGlobalHotkeys } from "./hotkeyUtils";
import  TEXT  from "@/textData.json";
import { unregisterAll } from "@tauri-apps/plugin-global-shortcut";
import { isOlderThanOneDay, safeLoadJson, setImageServer } from "./utils";
import { addToast } from "@/_Toaster/ToastProvider";
import { Category, Games, Preset, Settings } from "./types";
import { resetPageCounts } from "@/_Main/MainOnline";
// import { v2_0_4_migration } from "./filesys";
const paths = {
	exe: "",
	WW: "",
	ZZ: "",
	GI: "",
	SR: "",
	XX: "",
};
let config: any = { ...defConfig };
let configXX: any = { ...defConfigXX };
let dataDir = "";
let appData = "";
let prevGame = "";
let categories: Category[] = [];
let isInitialized = false;
export async function readXXMIConfig(path: string) {
	if (path && path != "" && (await exists(join(path, "XXMI Launcher Config.json")))) {
		const data = JSON.parse(await readTextFile(join(path, "XXMI Launcher Config.json")));
		console.log("[IMM] Loaded XXMI Launcher config:", data);
		GAMES.forEach((game) => {
			if (data.Importers[game + "MI"]) {
				const xxPath = data.Importers[game + "MI"].Importer.importer_folder || "";
				console.log(`[IMM] Resolved ${game}MI path:`, xxPath);
				paths[game as "WW" | "ZZ" | "GI" | "SR"] =
					xxPath == `${game}MI/` ? join(path, `${game}MI`) : join(...xxPath.split("/"));
			}
		});
		paths.XX = path;
		store.set(XXMI_DIR, path);
	}
	console.log("[IMM] Resolved game paths:", paths);
}
export function getDataDir() {
	return dataDir;
}
export function getPrevGame() {
	return prevGame;
}
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
	console.log("[IMM] Updating config from:", oconfig);
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
		XXMI: "",
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
export async function verifyGameDir(game: any) {
	const XXPath = paths[game as "WW" | "ZZ" | "GI" | "SR"];
	const dirs = {
		targetDir: "",
		sourceDir: "",
	};
	try {
		(await readTextFile(join(XXPath, "d3dx.ini"))).split("\n").forEach((line: string) => {
			const [key, value] = line.split("=").map((x: string) => x.trim());
			if (key == "include_recursive") {
				const isPath = value.slice(1, 3) == ":\\";
				dirs.targetDir = isPath ? value : join(XXPath, value);
				dirs.sourceDir = isPath ? value : join(XXPath, value);
			}
		});
	} catch (e) {
		console.log(`[IMM] Failed to read d3dx.ini for ${game}:`, e);
		dirs.sourceDir = "";
		dirs.targetDir = "";
	}
	return dirs;
}
export async function initGame(game: Games) {
	console.log(`[IMM] Initializing game: ${game}...`);
	store.set(ONLINE_DATA, {});
	if (await exists(`config${game}.json`)) {
		configXX = JSON.parse(await readTextFile(`config${game}.json`));
	} else configXX = { ...defConfigXX };
	configXX.game = game;
	switchGameTheme(game);

	if (!configXX.custom) {
		configXX = { ...configXX, ...(await verifyGameDir(game)) };
	} else {
		dataDir = configXX.targetDir;
	}
	writeTextFile(`config${game}.json`, JSON.stringify(configXX, null, 2));
	apiClient.setGame(game as any);
	await setCategories(game);
	// Validate source and target dirs
	if (configXX.sourceDir && !(await exists(join(configXX.sourceDir)))) configXX.sourceDir = "";
	if (configXX.targetDir && !(await exists(configXX.targetDir))) configXX.targetDir = "";
	console.log("[IMM] Validating source and target directories...", configXX.sourceDir, configXX.targetDir);
	store.set(SOURCE, configXX.sourceDir || "");
	store.set(TARGET, configXX.targetDir || "");
	store.set(XXMI_MODE, configXX.custom || 0);
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
	if (isInitialized) {
		config = { ...config, ...settings.global };
		configXX = { ...configXX, settings: { ...configXX.settings, ...settings.game } };
	}
	const compare = {
		src: [settings.global.game, settings.global.lang],
		to: [GAME, LANG],
		names: ["game", "lang"],
	};
	for (let i = 0; i < compare.src.length; i++) {
		if (compare.src[i] !== store.get(compare.to[i])) {
			if (compare.names[i] === "lang" && compare.src[i])
				store.set(TEXT_DATA, TEXT[compare.src[i] as "en"] || TEXT["en"]);
			// else if (compare.names[i] === "game" && compare.src[i]) await initGame(compare.src[i]);
			store.set(compare.to[i] as any, compare.src[i]);
		}
	}
});
export async function setCategories(game = prevGame) {
	console.log("[IMM] Setting categories...");
	if (!game) return;
	prevGame = game;
	try {
		categories = await apiClient.categories();
		//console.log("Fetched categories:", categories);
		if (!categories || categories.length == 0) throw "No categories found, please verify the directories again";
	} catch (e) {
		console.log("[IMM] Failed to fetch categories from API, using local config if available.", e);
		categories = configXX.categories && configXX.categories.length > 0 ? configXX.categories : [...apiClient.categoryList,...apiClient.generic.categories];
	} finally {
		//console.log("Using categories:", categories,apiClient.categoryList,configXX.categories);
		if (!categories || categories.length == 0) return;
		console.log("[IMM] Finalized categories:", categories);
		const catObj: { [key: string]: Category } = {};
		categories.forEach((cat) => {
			catObj[cat._sName] = cat;
		});
		const customCats = configXX.settings.customCategories || {};
		for (let key of Object.keys(customCats)) {
			catObj[key] = { ...catObj[key], _sName: key, ...customCats[key] };
		}
		categories = Object.values(catObj).map((cat) => ({ ...cat, _sIconUrl: cat._sIconUrl || "/who.jpg" }));
		store.set(CATEGORIES, categories);
	}
}
function removeHelpers() {
	stopWindowMonitoring();
	unregisterAll();
	resetPageCounts();
}
export async function launchGame() {
	if (await exists(config.XXMI))
		isGameProcessRunning(config.game).then((running) => {
			if (!running) {
				executeXXMI(join(config.XXMI, "Resources\\Bin\\XXMI Launcher.exe"));
				addToast({
					type: "info",
					message: "Launching Game",
				});
			}
		});
}
async function initHelpers() {
	console.log("[IMM] Initializing helpers...");
	if (configXX.settings.launch && ["WW", "ZZ", "GI", "SR"].includes(config.game)) {
		launchGame();
	}
	setHotreload(configXX.settings.hotReload as 0 | 1 | 2, config.game, configXX.targetDir);

	registerGlobalHotkeys();
}
export async function checkWWMM() {
	console.log("[IMM] Checking for WWMM config...");
	const wwmmPath = join(await path.localDataDir(), "Wuwa Mod Manager (WWMM)", "config.json");
	if (await exists(wwmmPath)) {
		//console.log('exists')
		return (await readTextFile(wwmmPath)) || null;
	}
	return null;
}
export async function main() {
	isInitialized = false;
	console.log("[IMM] Initializing application...");
	invoke("get_username");
	resetAtoms();
	removeHelpers();
	appData = await path.dataDir();
	const XXMI = `${appData}\\XXMI Launcher`;
	if (!(await exists("config.json"))) {
		console.log("[IMM] Creating default config.json...");
		await writeTextFile("config.json", JSON.stringify(defConfig, null, 2));
	}
	config = safeLoadJson(defConfig, JSON.parse(await readTextFile("config.json")));
	console.log("[IMM] Loaded config:", config);
	if (!config.XXMI && !config.game && !config.lang) {
		console.log("[IMM] First time setup detected, checking for WWMM...");
		store.set(FIRST_LOAD, true);
		const temp = await checkWWMM();
		if (temp) config = await updateConfig(JSON.parse(temp));
	} else {
		store.set(FIRST_LOAD, false);
	}
	apiClient.setClient(config.clientDate || "");
	if ((config.XXMI == "" || !(await exists(config.XXMI))) && (await exists(XXMI))) {
		config.XXMI = XXMI;
	}
	paths.XX = config.XXMI;
	if (config.game) apiClient.setGame(config.game);
	if (config.version < "2.1.0") {
		config = await updateConfig();
	}
	console.log("[IMM] Saving config...");
	writeTextFile("config.json", JSON.stringify(config, null, 2));
	await readXXMIConfig(config.XXMI || "");
	console.log("[IMM] Initializing game...");
	if (config.game) configXX = await initGame(config.game);
	console.log("[IMM] Setting window type...");
	setWindowType(config.winType);
	const bg = document.querySelector("body");
	if (bg)
		bg.style.backgroundColor = "color-mix(in oklab, var(--background) " + config.bgOpacity * 100 + "%, transparent)";

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

		const show = config.preReleases || isOlderThanOneDay(update.date || "");
		store.set(IMM_UPDATE, {
			version: update.version,
			date: update.date || "",
			body: JSON.stringify(parsedBody) || "{}",
			status: show ? "available" : "ignored",
			raw: update,
		});
		if (!noticeOpen && update.version > config.ignore && show) {
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
	isInitialized = true;
}
