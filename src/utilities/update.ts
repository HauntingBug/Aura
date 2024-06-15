import log from "./structs/log.js";

export class Update {
    static async checkForUpdate(currentVersion: string) {
        const packageJson = await fetch('https://raw.githubusercontent.com/Nexus-FN/Momentum/main/package.json').then(res => res.json());

        log.debug(`Latest version: ${packageJson.version}`);
        log.debug(`Current version: ${currentVersion}`);

        packageJson.version = packageJson.version.replace(".", "").replace(".", "").replace(".", "");
        currentVersion = currentVersion.replace(".", "").replace(".", "").replace(".", "");

        if (parseFloat(packageJson.version) > parseFloat(currentVersion)) {
            const message = `Update available! ${currentVersion} -> ${packageJson.version}`;
            log.warn(`${message}\nDownload it from the GitHub repo or repull the image if you're using Docker`);
        }
    }
}