import { Settings } from "http2";
import { TEXT } from "./text";
import {
	Category,
	ChangeInfo,
	DownloadItem,
	Games,
	InstalledItem,
	Language,
	Mod,
	ModDataObj,
	OnlineData,
	Preset,
} from "./types";
export const IMAGE_SERVER = "http://127.0.0.1:1469/preview";
export const OLD_RESTORE = "DISABLED_RESTORE";
export const RESTORE = "RESTORE";
export const IGNORE = "IGNORE";
export const UNCATEGORIZED = "Uncategorized";
export const managedSRC = "DISABLED (Managed by IMM)";
export const managedTGT = "Mods (Managed by IMM)";
export const VERSION = "2.1.0";
export const GAMES: Games[] = ["WW", "ZZ"];
export const PRIORITY_KEYS = ["Alt", "Ctrl", "Shift", "Capslock", "Tab", "Up", "Down", "Left", "Right"] as const;
export const LANG_LIST: { Name: string; Flag: string; Code: Language }[] = [
	{
		Name: TEXT.en.Current,
		Flag: TEXT.en.Flag,
		Code: "en",
	},
	{
		Name: TEXT.cn.Current,
		Flag: TEXT.cn.Flag,
		Code: "cn",
	},
	{
		Name: TEXT.ru.Current,
		Flag: TEXT.ru.Flag,
		Code: "ru",
	},
	{
		Name: TEXT.jp.Current,
		Flag: TEXT.jp.Flag,
		Code: "jp",
	},
	{
		Name: TEXT.kr.Current,
		Flag: TEXT.kr.Flag,
		Code: "kr",
	},
];
export const ONLINE_TRANSITION = (online: boolean, move = false) => ({
	initial: { opacity: 0, x: move ? (online ? "25%" : "-25%") : 0 },
	animate: { opacity: 1, x: 0 },
	exit: { opacity: 0, x: move ? (online ? "25%" : "-25%") : 0 },
	transition: { duration: 0.2 },
});
export const GAME_ID_MAP: { [key: string]: number } = {
	WW: 0,
	ZZ: 1,
	GI: 2,
	SR: 3,
};
export const DEFAULTS = {
	INIT_DONE: false,
	LANG: "en" as Language,
	GAME: "" as Games,
	SETTINGS: {
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
		},
		game: {
			launch: 0,
			hotReload: 1,
			onlineType: "Mod",
		},
	} as Settings,
	SOURCE: "",
	TARGET: "",
	DATA: {} as ModDataObj,
	PRESETS: [] as Preset[],
	CATEGORIES: [] as Category[],
	TYPES: [] as Category[],
	CHANGES: { before: [], after: [], map: {}, skip: false, title: "" } as ChangeInfo,
	DOWNLOAD_LIST: {
		queue: [] as DownloadItem[],
		downloading: {} as DownloadItem | null,
		completed: [] as DownloadItem[],
	},
	ONLINE: false,
	CURRENT_PRESET: -1,
	MOD_LIST: [] as Mod[],
	SELECTED: "",
	FILTER: "All",
	CATEGORY: "All",
	SEARCH: "",
	INSTALLED_ITEMS: [] as InstalledItem[],
	ONLINE_DATA: {} as OnlineData,
	ONLINE_TYPE: "Mod",
	ONLINE_SORT: "",
	ONLINE_PATH: "home&type=Mod",
	ONLINE_SELECTED: "",
};
