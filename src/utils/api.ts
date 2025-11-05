// API client for communicating with Flask backend

import { VERSION } from "./consts";
import { saveConfigs } from "./filesys";
import { Category } from "./types";
import { SETTINGS, store } from "./vars";

const API_BASE_URL = "https://gamebanana.com/apiv11/";
const HEALTH_CHECK = "https://health.wwmm.bhatt.jp/health";
class ApiClient {
	private GAME = "WW";
	private CLIENT = "";
	setClient(client: string) {
		this.CLIENT = client;
	}
	private readonly GAME_DATA = {
		WW: {
			id: {
				categories: "29524",
				game: "20357",
			},
			categoryList: [
				{
					_idRow: 30257,
					_sName: "Aalto",
					_nItemCount: 8,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30257",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6683c4ff33f3b.png",
				},
				{
					_idRow: 39143,
					_sName: "Augusta",
					_nItemCount: 44,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/39143",
				},
				{
					_idRow: 30251,
					_sName: "Baizhi",
					_nItemCount: 43,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30251",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6683c39f41dda.png",
				},
				{
					_idRow: 35523,
					_sName: "Brant",
					_nItemCount: 14,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/35523",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/67c981a895579.png",
				},
				{
					_idRow: 30262,
					_sName: "Calcharo",
					_nItemCount: 17,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30262",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6683c5f44ca4e.png",
				},
				{
					_idRow: 33179,
					_sName: "Camellya",
					_nItemCount: 103,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/33179",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/675b7f303af84.png",
				},
				{
					_idRow: 36003,
					_sName: "Cantarella",
					_nItemCount: 65,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/36003",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6812a36c23457.png",
				},
				{
					_idRow: 34264,
					_sName: "Carlotta",
					_nItemCount: 93,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/34264",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6812a3cf60524.png",
				},
				{
					_idRow: 37392,
					_sName: "Cartethyia",
					_nItemCount: 67,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/37392",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/686f2a0b0506c.png",
				},
				{
					_idRow: 30265,
					_sName: "Changli",
					_nItemCount: 130,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30265",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6683c68095b05.png",
				},
				{
					_idRow: 30247,
					_sName: "Chixia",
					_nItemCount: 30,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30247",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6683c25a55aad.png",
				},
				{
					_idRow: 36990,
					_sName: "Ciaccona",
					_nItemCount: 41,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/36990",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/686f2a130c551.png",
				},
				{
					_idRow: 30255,
					_sName: "Danjin",
					_nItemCount: 29,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30255",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6683c49eef2b5.png",
				},
				{
					_idRow: 30253,
					_sName: "Encore",
					_nItemCount: 25,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30253",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6683c41aafe7c.png",
				},
				{
					_idRow: 39624,
					_sName: "Iuno",
					_nItemCount: 35,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/39624",
				},
				{
					_idRow: 30263,
					_sName: "Jianxin",
					_nItemCount: 34,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30263",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6683c6300cb95.png",
				},
				{
					_idRow: 30264,
					_sName: "Jinhsi",
					_nItemCount: 95,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30264",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6683c65ae3201.png",
				},
				{
					_idRow: 30256,
					_sName: "Jiyan",
					_nItemCount: 21,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30256",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6683c4cec9dfe.png",
				},
				{
					_idRow: 30259,
					_sName: "Lingyang",
					_nItemCount: 10,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30259",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6683c56786bfb.png",
				},
				{
					_idRow: 33764,
					_sName: "Lumi",
					_nItemCount: 16,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/33764",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/675b1120b010b.png",
				},
				{
					_idRow: 37891,
					_sName: "Lupa",
					_nItemCount: 42,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/37891",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/686f2a1a391f8.png",
				},
				{
					_idRow: 30258,
					_sName: "Mortefi",
					_nItemCount: 14,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30258",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6683c52684f89.png",
				},
				{
					_idRow: 35119,
					_sName: "Phoebe",
					_nItemCount: 71,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/35119",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6812a40cb85a4.png",
				},
				{
					_idRow: 38371,
					_sName: "Phrolova",
					_nItemCount: 44,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/38371",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/68ab24ab15f8f.png",
				},
				{
					_idRow: 34733,
					_sName: "Roccia",
					_nItemCount: 20,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/34733",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6812a44645b98.png",
				},
				{
					_idRow: 30250,
					_sName: "Rover Female",
					_nItemCount: 106,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30250",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6683c35cd412e.png",
				},
				{
					_idRow: 30249,
					_sName: "Rover Male",
					_nItemCount: 75,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30249",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6683c30d33704.png",
				},
				{
					_idRow: 30252,
					_sName: "Sanhua",
					_nItemCount: 50,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30252",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6683c3d32a078.png",
				},
				{
					_idRow: 32220,
					_sName: "Shorekeeper",
					_nItemCount: 102,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/32220",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/66f8c47b49ee8.png",
				},
				{
					_idRow: 30254,
					_sName: "Taoqi",
					_nItemCount: 26,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30254",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6683c451a74aa.png",
				},
				{
					_idRow: 30248,
					_sName: "Verina",
					_nItemCount: 32,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30248",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6683c2db4c218.png",
				},
				{
					_idRow: 30471,
					_sName: "Xiangli Yao",
					_nItemCount: 23,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30471",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/66bddde6d44ed.png",
				},
				{
					_idRow: 30246,
					_sName: "Yangyang",
					_nItemCount: 36,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30246",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6683c230d99e1.png",
				},
				{
					_idRow: 30261,
					_sName: "Yinlin",
					_nItemCount: 115,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30261",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6683c5b7aea39.png",
				},
				{
					_idRow: 33791,
					_sName: "Youhu",
					_nItemCount: 6,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/33791",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6812a47de960d.png",
				},
				{
					_idRow: 30260,
					_sName: "Yuanwu",
					_nItemCount: 11,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30260",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6683c591329e5.png",
				},
				{
					_idRow: 36665,
					_sName: "Zani",
					_nItemCount: 45,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/36665",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6812a2f8ddacc.png",
				},
				{
					_idRow: 30472,
					_sName: "Zhezhi",
					_nItemCount: 48,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30472",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/66bdde0a65151.png",
				},
				{
					_idRow: 31838,
					_sName: "NPCs & Entities",
					_nItemCount: 12,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/31838",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/66e0d90771ac5.png",
				},
				{
					_idRow: 29493,
					_sName: "Other",
					_nItemCount: 75,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/29493",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6692c90cba314.png",
					_special: true,
				},
				{
					_idRow: 29496,
					_sName: "UI",
					_nItemCount: 55,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/29496",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6692c913ddf00.png",
					_special: true,
				},
			],
			generic: {
				categories: [
					{
						_idRow: 31838,
						_sName: "NPCs & Entities",
						_nItemCount: 12,
						_nCategoryCount: 0,
						_sUrl: "https://gamebanana.com/mods/cats/31838",
						_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/66e0d90771ac5.png",
					},
					{
						_idRow: 29493,
						_sName: "Other",
						_nItemCount: 75,
						_nCategoryCount: 0,
						_sUrl: "https://gamebanana.com/mods/cats/29493",
						_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6692c90cba314.png",
						_special: true,
					},
					{
						_idRow: 29496,
						_sName: "UI",
						_nItemCount: 55,
						_nCategoryCount: 0,
						_sUrl: "https://gamebanana.com/mods/cats/29496",
						_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6692c913ddf00.png",
						_special: true,
					},
				],
				types: [
					{
						_idRow: 29524,
						_sName: "Skins",
						_nItemCount: 1483,
						_nCategoryCount: 34,
						_sUrl: "https://gamebanana.com/mods/cats/29524",
						_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6654b6596ba11.png",
					},
					{
						_idRow: 29496,
						_sName: "UI",
						_nItemCount: 57,
						_nCategoryCount: 0,
						_sUrl: "https://gamebanana.com/mods/cats/29496",
						_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6692c913ddf00.png",
					},
					{
						_idRow: 29493,
						_sName: "Other",
						_nItemCount: 75,
						_nCategoryCount: 0,
						_sUrl: "https://gamebanana.com/mods/cats/29493",
						_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6692c90cba314.png",
					},
				],
			},
		},
		ZZ: {
			id: {
				categories: "30305",
				game: "19567",
			},
			categoryList: [
				{
					_idRow: 30335,
					_sName: "Alexandrina Sebastiane",
					_nItemCount: 73,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30335",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/68801f7c58e90.png",
				},
				{
					_idRow: 38196,
					_sName: "Alice Thymefield",
					_nItemCount: 83,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/38196",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/68801f9b72225.png",
				},
				{
					_idRow: 30336,
					_sName: "Anby Demara",
					_nItemCount: 123,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30336",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/68801f9677d60.png",
				},
				{
					_idRow: 30337,
					_sName: "Anton Ivanov",
					_nItemCount: 28,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30337",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/68801f913ebfd.png",
				},
				{
					_idRow: 34036,
					_sName: "Asaba Harumasa",
					_nItemCount: 29,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/34036",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/68801f84a739f.png",
				},
				{
					_idRow: 34740,
					_sName: "Astra Yao",
					_nItemCount: 111,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/34740",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6880201ac98e0.png",
				},
				{
					_idRow: 30334,
					_sName: "Belle",
					_nItemCount: 177,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30334",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6880202023af0.png",
				},
				{
					_idRow: 30338,
					_sName: "Ben Bigger",
					_nItemCount: 15,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30338",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/68802025154a2.png",
				},
				{
					_idRow: 30339,
					_sName: "Billy Kid",
					_nItemCount: 39,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30339",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6880202dd005a.png",
				},
				{
					_idRow: 32531,
					_sName: "Burnice White",
					_nItemCount: 106,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/32531",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6880203460d5d.png",
				},
				{
					_idRow: 32164,
					_sName: "Caesar King",
					_nItemCount: 90,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/32164",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6880203cc8387.png",
				},
				{
					_idRow: 30340,
					_sName: "Corin Wickes",
					_nItemCount: 40,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30340",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/68802042411e5.png",
				},
				{
					_idRow: 30341,
					_sName: "Ellen Joe",
					_nItemCount: 124,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30341",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/68802045acf1f.png",
				},
				{
					_idRow: 35123,
					_sName: "Evelyn Chevalier",
					_nItemCount: 112,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/35123",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/68802049b9df6.png",
				},
				{
					_idRow: 30342,
					_sName: "Grace Howard",
					_nItemCount: 67,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30342",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6880204e4ab41.png",
				},
				{
					_idRow: 30579,
					_sName: "Hoshimi Miyabi",
					_nItemCount: 198,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30579",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/688020525e72e.png",
				},
				{
					_idRow: 36836,
					_sName: "Hugo Vlad",
					_nItemCount: 8,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/36836",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/68802167b1f68.png",
				},
				{
					_idRow: 30580,
					_sName: "Jane Doe",
					_nItemCount: 102,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30580",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6880216d8ef4e.png",
				},
				{
					_idRow: 37309,
					_sName: "Ju Fufu",
					_nItemCount: 57,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/37309",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6880218846023.png",
				},
				{
					_idRow: 30343,
					_sName: "Koleda Belobog",
					_nItemCount: 52,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30343",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6880218e23b76.png",
				},
				{
					_idRow: 33590,
					_sName: "Lighter",
					_nItemCount: 35,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/33590",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6880219895db1.png",
				},
				{
					_idRow: 30344,
					_sName: "Luciana de Montefio",
					_nItemCount: 87,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30344",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6880219faadde.png",
				},
				{
					_idRow: 30345,
					_sName: "Nekomiya Mana",
					_nItemCount: 48,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30345",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/688021a8820be.png",
				},
				{
					_idRow: 30346,
					_sName: "Nicole Demara",
					_nItemCount: 142,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30346",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/688021b432ccd.png",
				},
				{
					_idRow: 39946,
					_sName: "Orphie Magnusson",
					_nItemCount: 33,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/39946",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/68d99a45ce153.png",
				},
				{
					_idRow: 37308,
					_sName: "Pan Yinhu",
					_nItemCount: 5,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/37308",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6880225a3a33c.png",
				},
				{
					_idRow: 30347,
					_sName: "Piper Wheel",
					_nItemCount: 71,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30347",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/68802260a03a1.png",
				},
				{
					_idRow: 35673,
					_sName: "Pulchra Fellini",
					_nItemCount: 45,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/35673",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/68802267199f2.png",
				},
				{
					_idRow: 30578,
					_sName: "Qingyi",
					_nItemCount: 105,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30578",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/688022732c334.png",
				},
				{
					_idRow: 39338,
					_sName: "Seed",
					_nItemCount: 61,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/39338",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/68be341ee0016.png",
				},
				{
					_idRow: 30577,
					_sName: "Seth Lowell",
					_nItemCount: 27,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30577",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6880227aea7f7.png",
				},
				{
					_idRow: 35835,
					_sName: "Soldier 0 Anby",
					_nItemCount: 45,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/35835",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/688022812533e.png",
				},
				{
					_idRow: 30348,
					_sName: "Soldier 11",
					_nItemCount: 65,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30348",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/688020d182d71.png",
				},
				{
					_idRow: 30349,
					_sName: "Soukaku",
					_nItemCount: 36,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30349",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/688020d8b0588.png",
				},
				{
					_idRow: 36133,
					_sName: "Trigger",
					_nItemCount: 77,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/36133",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/688020e4257b1.png",
				},
				{
					_idRow: 36560,
					_sName: "Vivian Banshee",
					_nItemCount: 68,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/36560",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/688020fed3d80.png",
				},
				{
					_idRow: 30309,
					_sName: "Von Lycaon",
					_nItemCount: 31,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30309",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/68802109702bf.png",
				},
				{
					_idRow: 30316,
					_sName: "Wise",
					_nItemCount: 46,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30316",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6880211ae3df6.png",
				},
				{
					_idRow: 33018,
					_sName: "Yanagi Tsukishiro",
					_nItemCount: 115,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/33018",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/688021362ae6a.png",
				},
				{
					_idRow: 37289,
					_sName: "Yixuan",
					_nItemCount: 109,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/37289",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6880212c0ae1e.png",
				},
				{
					_idRow: 38177,
					_sName: "Yuzuha Ukinami",
					_nItemCount: 76,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/38177",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/688020f7c4ca0.png",
				},
				{
					_idRow: 30350,
					_sName: "Zhu Yuan",
					_nItemCount: 90,
					_nCategoryCount: 0,
					_sUrl: "https://gamebanana.com/mods/cats/30350",
					_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6880215c7dd3d.png",
				},
			],
			generic: {
				categories: [
					{
						_special: true,
						_idRow: 30702,
						_sName: "Bangboo",
						_nItemCount: 34,
						_nCategoryCount: 22,
						_sUrl: "https://gamebanana.com/mods/cats/30702",
						_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/669c13bb037b1.png",
					},
					{
						_special: true,
						_idRow: 29874,
						_sName: "Other",
						_nItemCount: 194,
						_nCategoryCount: 1,
						_sUrl: "https://gamebanana.com/mods/cats/29874",
						_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6688c2aba07b5.png",
					},
					{
						_special: true,
						_idRow: 30395,
						_sName: "UI",
						_nItemCount: 211,
						_nCategoryCount: 1,
						_sUrl: "https://gamebanana.com/mods/cats/30395",
						_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6690641770738.png",
					},
				],
				types: [
					{
						_idRow: 30702,
						_sName: "Bangboo",
						_nItemCount: 34,
						_nCategoryCount: 22,
						_sUrl: "https://gamebanana.com/mods/cats/30702",
						_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/669c13bb037b1.png",
					},
					{
						_idRow: 30305,
						_sName: "Characters",
						_nItemCount: 3157,
						_nCategoryCount: 42,
						_sUrl: "https://gamebanana.com/mods/cats/30305",
						_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/66a1928c3e239.gif",
					},
					{
						_idRow: 29874,
						_sName: "Other",
						_nItemCount: 194,
						_nCategoryCount: 1,
						_sUrl: "https://gamebanana.com/mods/cats/29874",
						_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6688c2aba07b5.png",
					},
					{
						_idRow: 30395,
						_sName: "UI",
						_nItemCount: 211,
						_nCategoryCount: 1,
						_sUrl: "https://gamebanana.com/mods/cats/30395",
						_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6690641770738.png",
					},
				],
			},
		},
	};
	setGame(game: keyof typeof this.GAME_DATA) {
		if (this.GAME_DATA[game]) {
			this.GAME = game;
			this.id = this.GAME_DATA[game].id;
			this.categoryList = this.GAME_DATA[game].categoryList as Category[];
			this.generic = this.GAME_DATA[game].generic;
			return;
		}
		this.GAME = game;
	}
	private id: Record<string, string> = {
		categories: "29524",
		game: "20357",
	};
	categoryList: Category[] = [
		{
			_idRow: 30257,
			_sName: "Aalto",
			_nItemCount: 8,
			_nCategoryCount: 0,
			_sUrl: "https://gamebanana.com/mods/cats/30257",
			_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6683c4ff33f3b.png",
		},
		{
			_idRow: 39143,
			_sName: "Augusta",
			_nItemCount: 44,
			_nCategoryCount: 0,
			_sUrl: "https://gamebanana.com/mods/cats/39143",
			_sIconUrl: "",
		},
		{
			_idRow: 30251,
			_sName: "Baizhi",
			_nItemCount: 43,
			_nCategoryCount: 0,
			_sUrl: "https://gamebanana.com/mods/cats/30251",
			_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6683c39f41dda.png",
		},
		{
			_idRow: 35523,
			_sName: "Brant",
			_nItemCount: 14,
			_nCategoryCount: 0,
			_sUrl: "https://gamebanana.com/mods/cats/35523",
			_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/67c981a895579.png",
		},
		{
			_idRow: 30262,
			_sName: "Calcharo",
			_nItemCount: 17,
			_nCategoryCount: 0,
			_sUrl: "https://gamebanana.com/mods/cats/30262",
			_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6683c5f44ca4e.png",
		},
		{
			_idRow: 33179,
			_sName: "Camellya",
			_nItemCount: 103,
			_nCategoryCount: 0,
			_sUrl: "https://gamebanana.com/mods/cats/33179",
			_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/675b7f303af84.png",
		},
		{
			_idRow: 36003,
			_sName: "Cantarella",
			_nItemCount: 65,
			_nCategoryCount: 0,
			_sUrl: "https://gamebanana.com/mods/cats/36003",
			_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6812a36c23457.png",
		},
		{
			_idRow: 34264,
			_sName: "Carlotta",
			_nItemCount: 93,
			_nCategoryCount: 0,
			_sUrl: "https://gamebanana.com/mods/cats/34264",
			_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6812a3cf60524.png",
		},
		{
			_idRow: 37392,
			_sName: "Cartethyia",
			_nItemCount: 67,
			_nCategoryCount: 0,
			_sUrl: "https://gamebanana.com/mods/cats/37392",
			_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/686f2a0b0506c.png",
		},
		{
			_idRow: 30265,
			_sName: "Changli",
			_nItemCount: 130,
			_nCategoryCount: 0,
			_sUrl: "https://gamebanana.com/mods/cats/30265",
			_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6683c68095b05.png",
		},
		{
			_idRow: 30247,
			_sName: "Chixia",
			_nItemCount: 30,
			_nCategoryCount: 0,
			_sUrl: "https://gamebanana.com/mods/cats/30247",
			_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6683c25a55aad.png",
		},
		{
			_idRow: 36990,
			_sName: "Ciaccona",
			_nItemCount: 41,
			_nCategoryCount: 0,
			_sUrl: "https://gamebanana.com/mods/cats/36990",
			_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/686f2a130c551.png",
		},
		{
			_idRow: 30255,
			_sName: "Danjin",
			_nItemCount: 29,
			_nCategoryCount: 0,
			_sUrl: "https://gamebanana.com/mods/cats/30255",
			_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6683c49eef2b5.png",
		},
		{
			_idRow: 30253,
			_sName: "Encore",
			_nItemCount: 25,
			_nCategoryCount: 0,
			_sUrl: "https://gamebanana.com/mods/cats/30253",
			_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6683c41aafe7c.png",
		},
		{
			_idRow: 39624,
			_sName: "Iuno",
			_nItemCount: 35,
			_nCategoryCount: 0,
			_sUrl: "https://gamebanana.com/mods/cats/39624",
			_sIconUrl: "",
		},
		{
			_idRow: 30263,
			_sName: "Jianxin",
			_nItemCount: 34,
			_nCategoryCount: 0,
			_sUrl: "https://gamebanana.com/mods/cats/30263",
			_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6683c6300cb95.png",
		},
		{
			_idRow: 30264,
			_sName: "Jinhsi",
			_nItemCount: 95,
			_nCategoryCount: 0,
			_sUrl: "https://gamebanana.com/mods/cats/30264",
			_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6683c65ae3201.png",
		},
		{
			_idRow: 30256,
			_sName: "Jiyan",
			_nItemCount: 21,
			_nCategoryCount: 0,
			_sUrl: "https://gamebanana.com/mods/cats/30256",
			_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6683c4cec9dfe.png",
		},
		{
			_idRow: 30259,
			_sName: "Lingyang",
			_nItemCount: 10,
			_nCategoryCount: 0,
			_sUrl: "https://gamebanana.com/mods/cats/30259",
			_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6683c56786bfb.png",
		},
		{
			_idRow: 33764,
			_sName: "Lumi",
			_nItemCount: 16,
			_nCategoryCount: 0,
			_sUrl: "https://gamebanana.com/mods/cats/33764",
			_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/675b1120b010b.png",
		},
		{
			_idRow: 37891,
			_sName: "Lupa",
			_nItemCount: 42,
			_nCategoryCount: 0,
			_sUrl: "https://gamebanana.com/mods/cats/37891",
			_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/686f2a1a391f8.png",
		},
		{
			_idRow: 30258,
			_sName: "Mortefi",
			_nItemCount: 14,
			_nCategoryCount: 0,
			_sUrl: "https://gamebanana.com/mods/cats/30258",
			_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6683c52684f89.png",
		},
		{
			_idRow: 35119,
			_sName: "Phoebe",
			_nItemCount: 71,
			_nCategoryCount: 0,
			_sUrl: "https://gamebanana.com/mods/cats/35119",
			_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6812a40cb85a4.png",
		},
		{
			_idRow: 38371,
			_sName: "Phrolova",
			_nItemCount: 44,
			_nCategoryCount: 0,
			_sUrl: "https://gamebanana.com/mods/cats/38371",
			_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/68ab24ab15f8f.png",
		},
		{
			_idRow: 34733,
			_sName: "Roccia",
			_nItemCount: 20,
			_nCategoryCount: 0,
			_sUrl: "https://gamebanana.com/mods/cats/34733",
			_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6812a44645b98.png",
		},
		{
			_idRow: 30250,
			_sName: "Rover Female",
			_nItemCount: 106,
			_nCategoryCount: 0,
			_sUrl: "https://gamebanana.com/mods/cats/30250",
			_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6683c35cd412e.png",
		},
		{
			_idRow: 30249,
			_sName: "Rover Male",
			_nItemCount: 75,
			_nCategoryCount: 0,
			_sUrl: "https://gamebanana.com/mods/cats/30249",
			_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6683c30d33704.png",
		},
		{
			_idRow: 30252,
			_sName: "Sanhua",
			_nItemCount: 50,
			_nCategoryCount: 0,
			_sUrl: "https://gamebanana.com/mods/cats/30252",
			_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6683c3d32a078.png",
		},
		{
			_idRow: 32220,
			_sName: "Shorekeeper",
			_nItemCount: 102,
			_nCategoryCount: 0,
			_sUrl: "https://gamebanana.com/mods/cats/32220",
			_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/66f8c47b49ee8.png",
		},
		{
			_idRow: 30254,
			_sName: "Taoqi",
			_nItemCount: 26,
			_nCategoryCount: 0,
			_sUrl: "https://gamebanana.com/mods/cats/30254",
			_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6683c451a74aa.png",
		},
		{
			_idRow: 30248,
			_sName: "Verina",
			_nItemCount: 32,
			_nCategoryCount: 0,
			_sUrl: "https://gamebanana.com/mods/cats/30248",
			_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6683c2db4c218.png",
		},
		{
			_idRow: 30471,
			_sName: "Xiangli Yao",
			_nItemCount: 23,
			_nCategoryCount: 0,
			_sUrl: "https://gamebanana.com/mods/cats/30471",
			_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/66bddde6d44ed.png",
		},
		{
			_idRow: 30246,
			_sName: "Yangyang",
			_nItemCount: 36,
			_nCategoryCount: 0,
			_sUrl: "https://gamebanana.com/mods/cats/30246",
			_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6683c230d99e1.png",
		},
		{
			_idRow: 30261,
			_sName: "Yinlin",
			_nItemCount: 115,
			_nCategoryCount: 0,
			_sUrl: "https://gamebanana.com/mods/cats/30261",
			_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6683c5b7aea39.png",
		},
		{
			_idRow: 33791,
			_sName: "Youhu",
			_nItemCount: 6,
			_nCategoryCount: 0,
			_sUrl: "https://gamebanana.com/mods/cats/33791",
			_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6812a47de960d.png",
		},
		{
			_idRow: 30260,
			_sName: "Yuanwu",
			_nItemCount: 11,
			_nCategoryCount: 0,
			_sUrl: "https://gamebanana.com/mods/cats/30260",
			_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6683c591329e5.png",
		},
		{
			_idRow: 36665,
			_sName: "Zani",
			_nItemCount: 45,
			_nCategoryCount: 0,
			_sUrl: "https://gamebanana.com/mods/cats/36665",
			_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6812a2f8ddacc.png",
		},
		{
			_idRow: 30472,
			_sName: "Zhezhi",
			_nItemCount: 48,
			_nCategoryCount: 0,
			_sUrl: "https://gamebanana.com/mods/cats/30472",
			_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/66bdde0a65151.png",
		},
		{
			_idRow: 31838,
			_sName: "NPCs & Entities",
			_nItemCount: 12,
			_nCategoryCount: 0,
			_sUrl: "https://gamebanana.com/mods/cats/31838",
			_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/66e0d90771ac5.png",
		},
		{
			_idRow: 29493,
			_sName: "Other",
			_nItemCount: 75,
			_nCategoryCount: 0,
			_sUrl: "https://gamebanana.com/mods/cats/29493",
			_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6692c90cba314.png",
			_special: true,
		},
		{
			_idRow: 29496,
			_sName: "UI",
			_nItemCount: 55,
			_nCategoryCount: 0,
			_sUrl: "https://gamebanana.com/mods/cats/29496",
			_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6692c913ddf00.png",
			_special: true,
		},
	];
	generic: Record<string, Category[]> = {
		categories: [
			{
				_idRow: 31838,
				_sName: "NPCs & Entities",
				_nItemCount: 12,
				_nCategoryCount: 0,
				_sUrl: "https://gamebanana.com/mods/cats/31838",
				_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/66e0d90771ac5.png",
			},
			{
				_idRow: 29493,
				_sName: "Other",
				_nItemCount: 75,
				_nCategoryCount: 0,
				_sUrl: "https://gamebanana.com/mods/cats/29493",
				_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6692c90cba314.png",
				_special: true,
			},
			{
				_idRow: 29496,
				_sName: "UI",
				_nItemCount: 55,
				_nCategoryCount: 0,
				_sUrl: "https://gamebanana.com/mods/cats/29496",
				_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6692c913ddf00.png",
				_special: true,
			},
		],
		types: [
			{
				_idRow: 29524,
				_sName: "Skins",
				_nItemCount: 1483,
				_nCategoryCount: 34,
				_sUrl: "https://gamebanana.com/mods/cats/29524",
				_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6654b6596ba11.png",
			},
			{
				_idRow: 29496,
				_sName: "UI",
				_nItemCount: 57,
				_nCategoryCount: 0,
				_sUrl: "https://gamebanana.com/mods/cats/29496",
				_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6692c913ddf00.png",
			},
			{
				_idRow: 29493,
				_sName: "Other",
				_nItemCount: 75,
				_nCategoryCount: 0,
				_sUrl: "https://gamebanana.com/mods/cats/29493",
				_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6692c90cba314.png",
			},
		],
	};
	constructor() {
		return this;
	}

	async makeRequest(endpoint: string, options: RequestInit = {}) {
		const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

		if (!response.ok) {
			throw new Error(`API request failed: ${response.statusText}`);
		}

		return response.json();
	}

	async categories() {
		//console.log("Fetching categories...", await this.healthCheck());
		this.healthCheck();
		try {
			const fetchWithRetry = async (timeouts: number[] = [2000, 5000]): Promise<any> => {
				for (let i = 0; i < timeouts.length; i++) {
					try {
						const controller = new AbortController();
						const timeoutId = setTimeout(() => controller.abort(), timeouts[i]);
						//console.log(`Fetching categories (attempt ${i + 1})...`, timeouts[i]);
						const response = await this.makeRequest(
							`Mod/Categories?_idCategoryRow=${this.id.categories}&_sSort=a_to_z&_bShowEmpty=true`,
							{ signal: controller.signal }
						);
						clearTimeout(timeoutId);
						if (!response) {
							throw new Error(`HTTP ${response.status}`);
						}
						return await response;
					} catch (error) {
						if (i === timeouts.length - 1) {
							throw error;
						}
					}
				}
			};
			const response = await fetchWithRetry();
			this.categoryList = [...response.filter((x: any) => x._idRow !== 31838), ...this.generic.categories];
			return this.categoryList;
		} catch (error) {
			return [];
			//console.error("Failed to fetch categories:", error);
			throw error;
		}
	}

	home({ sort = "default", page = 1, type = "" }: { sort?: string; page?: number; type?: string }) {
		return `${API_BASE_URL}Game/${this.id.game}/Subfeed?${
			type ? `_csvModelInclusions=${type}&` : ""
		}_sSort=${sort}&_nPage=${page}`;
	}

	category({ cat = "", sort = "default", page = 1 }) {
		return `${API_BASE_URL}Mod/Index?_nPerpage=15&_aFilters%5BGeneric_Category%5D=${(
			(cat.split("/").length > 1
				? this.categoryList.find((x) => x._sName == cat.split("/")[1])?._idRow
				: this.generic.types.find((x) => x._sName == cat.split("/")[0])?._idRow) || 0
		).toString()}&_sSort=${sort}&_nPage=${page}`;
	}

	banner() {
		return `${API_BASE_URL}Game/${this.id.game}/TopSubs`;
	}

	async mod(mod = "Mod/0", signal?: AbortSignal) {
		try {
			const response = await this.makeRequest(`${mod}/ProfilePage`, signal && { signal });
			return response;
		} catch (error) {
			//console.error("Failed to fetch categories:", error);
			throw error;
		}
	}

	async updates(mod = "Mod/0", signal?: AbortSignal) {
		try {
			const response = await this.makeRequest(`${mod}/Updates?_nPage=1&_nPerpage=1`, signal && { signal });
			return response;
		} catch (error) {
			//console.error("Failed to fetch categories:", error);
			throw error;
		}
	}
	search({ term = "", page = 1, type = "" }) {
		return `${API_BASE_URL}Util/Search/Results?_sModelName=${type}&_sOrder=best_match&_idGameRow=${
			this.id.game
		}&_sSearchString=${encodeURIComponent(term)}&_nPage=${page}`;
	}

	async healthCheck() {
		// return VERSION+"/"+this.GAME+"/"+(this.CLIENT||("_"+Date.now()));
		//console.log(this.CLIENT, VERSION, this.GAME, this.CLIENT);
		const base = `${HEALTH_CHECK}/${VERSION || "2.0.1"}/${this.GAME || "WW"}`;
		//console.log(base);
		try {
			if (this.CLIENT) fetch(`${base}/${this.CLIENT}`);
			else {
				fetch(`${base}/_${Date.now()}`)
					.then((res) => res.json())
					.then((data) => {
						if (data.client) {
							this.CLIENT = data.client;
							store.set(SETTINGS, (prev) => ({ ...prev, global: { ...prev.global, clientDate: data.client } }));
							saveConfigs();
							// config.settings.clientDate = data.client;
							// store.set(settingsDataAtom, config.settings as Settings);
							// saveConfig();
						}
					});
			}
		} catch (error) {
			//console.error("Health check failed:", error);
		}
	}
}
export const apiClient = new ApiClient();
