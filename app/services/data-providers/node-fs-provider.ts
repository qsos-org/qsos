import path from "node:path";
import fs from "node:fs/promises";
import type { FileSystemProvider } from "./file-based-provider";
import log from "loglevel"

export const NodeFSProvider: FileSystemProvider = {
	readFolder: async (path: string) => {
		try {
			return await fs.readdir(path, { withFileTypes: true });
		} catch (err: any) {
			if (err.code === "ENOENT") return [];
			throw err;
		}
	},
	readJSON: (path: string) => fs.readFile(path, 'utf-8').then(JSON.parse),
	readBase64: (path: string) => fs.readFile(path, 'base64'),
	writeFile: async (filePath: string, data: string) => {
		log.trace(`Writing file to ${filePath}`)
		await fs.mkdir(path.dirname(filePath), { recursive: true }) // node requires the directory to exist
		return fs.writeFile(filePath, data)
	},
	renameFile: (oldPath: string, newPath: string) => fs.rename(oldPath, newPath),
	moveFolder: (oldPath: string, newPath: string) => fs.rename(oldPath, newPath),
	makeFolder: (path: string) => fs.mkdir(path, { recursive: true }),
	deleteFile: (path: string) => fs.unlink(path),
	deleteFolder: (path: string) => fs.unlink(path),
	fileExists: (path: string) => fs.access(path).then(() => true).catch(() => false),
	folderExists: (path: string) => fs.access(path).then(() => true).catch(() => false),
	glob: (pattern: string, basePath: string) => Array.fromAsync(fs.glob(pattern, { cwd: basePath })),
}
