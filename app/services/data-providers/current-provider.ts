import { FileBasedProvider } from "./file-based-provider";
import log from "loglevel";

const platform = process.versions.bun ? "bun" : "node";
log.info(`Using ${platform} platform`);

export const provider = new FileBasedProvider(platform)