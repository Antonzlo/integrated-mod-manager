import { atom, createStore } from "jotai";
export const store = createStore();
// import { initGame } from "./init";
import { TEXT } from "./text";
import { DEFAULTS, VERSION } from "./consts";
import {
	Category,
	ChangeInfo,
	DownloadList,
	Games,
	InstalledItem,
	Language,
	Mod,
	ModDataObj,
	OnlineData,
	Preset,
	ProgressData,
	Settings,
} from "./types";

// const init = { settings: true };
const INIT_DONE = atom(false);
const FIRST_LOAD = atom(false);
const GAME = atom<Games>("");
const LANG = atom<Language>("en");
//saved
const LAST_UPDATED = atom(Date.now());
const SETTINGS = atom<Settings>({
	global: {
		bgOpacity: 1,
		winOpacity: 1,
		winType: 0,
		bgType: 2,
		listType: 0,
		nsfw: 1,
		toggleClick: 2,
		ignore: VERSION,
		clientDate: "1759866302559426603",
		exeXXMI: "",
		lang: "",
		game: "",
		preReleases: false,
	},
	game: {
		launch: 0,
		hotReload: 1,
		onlineType: "Mod",
		customCategories: {},
	},
});
const SOURCE = atom<string>("");
const TARGET = atom<string>("");
const DATA = atom<ModDataObj>({});
const PRESETS = atom<Preset[]>([]);
const CATEGORIES = atom<Category[]>([]);
const TYPES = atom<Category[]>([]);
//not-saved
const LEFT_SIDEBAR_OPEN = atom(true);
const RIGHT_SIDEBAR_OPEN = atom(true);
const RIGHT_SLIDEOVER_OPEN = atom(false);
const ONLINE = atom(false);
const DOWNLOAD_LIST = atom<DownloadList>(DEFAULTS.DOWNLOAD_LIST);

const CURRENT_PRESET = atom(DEFAULTS.CURRENT_PRESET);
const MOD_LIST = atom<Mod[]>(DEFAULTS.MOD_LIST);
const SELECTED = atom(DEFAULTS.SELECTED);
const FILTER = atom(DEFAULTS.FILTER);
const CATEGORY = atom(DEFAULTS.CATEGORY);
const SEARCH = atom(DEFAULTS.SEARCH);
const INSTALLED_ITEMS = atom<InstalledItem[]>(DEFAULTS.INSTALLED_ITEMS);
const ONLINE_DATA = atom<OnlineData>(DEFAULTS.ONLINE_DATA);
const ONLINE_TYPE = atom(DEFAULTS.ONLINE_TYPE);
const ONLINE_SORT = atom(DEFAULTS.ONLINE_SORT);
const ONLINE_PATH = atom(DEFAULTS.ONLINE_PATH);
const ONLINE_SELECTED = atom(DEFAULTS.ONLINE_SELECTED);
const TOASTS = atom([] as any[]);
const CHANGES = atom<ChangeInfo>({
	before: [],
	after: [],
	map: {},
	skip: false,
	title: "",
});
const TEXT_DATA = atom(TEXT["en"]);
const PROGRESS_OVERLAY = atom<ProgressData>({ title: "", open: false, finished: false, button: "", name:"" });
export interface UpdateInfo {
	version: string;
	status: "available" | "downloading" | "ready" | "error" | "installed" | "ignored";
	date: string;
	body: string;
	raw: any | null;
}
const IMM_UPDATE = atom(null as UpdateInfo | null);
const UPDATER_OPEN = atom(false);
const NOTICE = atom({
	heading: "",
	subheading: "",
	ignoreable: 2,
	timer: 10,
	ver: "2.1.1",
	id: 0,
} as any);
const HELP_OPEN = atom(false);
const TUTORIAL_OPEN = atom(false);
const NOTICE_OPEN = atom(false);
export function resetAtoms() {
	const atoms = {
		INIT_DONE,
		LANG,
		GAME,
		SETTINGS,
		SOURCE,
		TARGET,
		DATA,
		PRESETS,
		CATEGORIES,
		TYPES,
		CHANGES,
		ONLINE,
		DOWNLOAD_LIST,
		CURRENT_PRESET,
		MOD_LIST,
		SELECTED,
		FILTER,
		CATEGORY,
		SEARCH,
		INSTALLED_ITEMS,
		ONLINE_DATA,
		ONLINE_TYPE,
		ONLINE_PATH,
		ONLINE_SORT,
		ONLINE_SELECTED,
	};
	Object.keys(atoms).forEach((atom) =>
		store.set(atoms[atom as keyof typeof atoms] as any, DEFAULTS[atom as keyof typeof DEFAULTS])
	);
}
export {
	FIRST_LOAD,
	HELP_OPEN,
	TUTORIAL_OPEN,
	NOTICE,
	NOTICE_OPEN,
	UPDATER_OPEN,
	IMM_UPDATE,
	PROGRESS_OVERLAY,
	TOASTS,
	CURRENT_PRESET,
	INSTALLED_ITEMS,
	RIGHT_SLIDEOVER_OPEN,
	DOWNLOAD_LIST,
	TYPES,
	ONLINE_DATA,
	ONLINE_TYPE,
	ONLINE_PATH,
	ONLINE_SORT,
	ONLINE_SELECTED,
	CATEGORY,
	SEARCH,
	FILTER,
	GAME,
	INIT_DONE,
	LANG,
	SETTINGS,
	TEXT_DATA,
	SOURCE,
	TARGET,
	DATA,
	PRESETS,
	CATEGORIES,
	CHANGES,
	MOD_LIST,
	ONLINE,
	LEFT_SIDEBAR_OPEN,
	RIGHT_SIDEBAR_OPEN,
	LAST_UPDATED,
	SELECTED,
};
