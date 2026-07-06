// Thin wrapper around @tauri-apps/plugin-fs that translates the app's internal
// "\\"-separated paths into the OS-native form before hitting the filesystem.
// Only PATH arguments are translated — never the data payloads (e.g. d3dx.ini
// content keeps its "\\" namespace keys). Import these instead of importing
// from "@tauri-apps/plugin-fs" directly.
import * as fs from "@tauri-apps/plugin-fs";
import { toFs } from "./pathsep";

export const readTextFile = (path: string, options?: fs.ReadFileOptions) => fs.readTextFile(toFs(path), options);

export const writeTextFile = (path: string, data: string, options?: fs.WriteFileOptions) =>
	fs.writeTextFile(toFs(path), data, options);

export const exists = (path: string, options?: fs.ExistsOptions) => fs.exists(toFs(path), options);

export const readDir = (path: string, options?: fs.ReadDirOptions) => fs.readDir(toFs(path), options);

export const mkdir = (path: string, options?: fs.MkdirOptions) => fs.mkdir(toFs(path), options);

export const remove = (path: string, options?: fs.RemoveOptions) => fs.remove(toFs(path), options);

export const rename = (oldPath: string, newPath: string, options?: fs.RenameOptions) =>
	fs.rename(toFs(oldPath), toFs(newPath), options);

export const copyFile = (fromPath: string, toPath: string, options?: fs.CopyFileOptions) =>
	fs.copyFile(toFs(fromPath), toFs(toPath), options);

export const writeFile = (path: string, data: Uint8Array, options?: fs.WriteFileOptions) =>
	fs.writeFile(toFs(path), data, options);
