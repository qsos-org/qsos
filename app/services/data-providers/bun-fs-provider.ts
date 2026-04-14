import fs from "node:fs/promises";
import type { FileSystemProvider } from "./file-based-provider";


export const BunFSProvider: FileSystemProvider = {
	readFolder: async (path: string) => {
		try {
			return await fs.readdir(path, { withFileTypes: true });
		} catch (err: any) {
			if (err.code === "ENOENT") return [];
			throw err;
		}
	},
	readJSON: (path: string) => Bun.file(path).json(),
	readBase64: (path: string) => fs.readFile(path, 'base64'),
	writeFile: (path: string, data: string) => Bun.write(path, data),
	renameFile: (oldPath: string, newPath: string) => fs.rename(oldPath, newPath),
	moveFolder: (oldPath: string, newPath: string) => fs.rename(oldPath, newPath),
	makeFolder: (path: string) => fs.mkdir(path, { recursive: true }),
	deleteFile: (path: string) => fs.unlink(path),
	deleteFolder: (path: string) => fs.unlink(path),
	fileExists: (path: string) => Bun.file(path).exists(),
	folderExists: (path: string) => fs.exists(path),
	glob: (pattern: string, basePath: string) => Array.fromAsync(new Bun.Glob(pattern).scan(basePath)),
}