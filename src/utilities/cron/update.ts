import Cron from "croner";
import destr from "destr";
import { Update } from "../update.js";
import path from "path";
import fs from "fs";
import log from "../structs/log.js";
import { dirname } from 'dirname-filename-esm';
const __dirname = dirname(import.meta);

const packageJson = destr<{ version: string }>(fs.readFileSync(path.join(__dirname, "../../../package.json")).toString());
if (!packageJson) throw new Error("Failed to parse package.json");
const version = packageJson.version;

try {
    await Update.checkForUpdate(packageJson.version);
} catch (err) {
    log.error("Failed to check for updates");
}

const updateCron = Cron('0 */30 * * * *', () => {
    Update.checkForUpdate(packageJson.version);
});

export { version }
