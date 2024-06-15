import path from "path";

import log from "../utilities/structs/log.js";
import logger from "../utilities/structs/log.js";
import Safety from "../utilities/safety.js";
import { dirname } from "dirname-filename-esm";

const __dirname = dirname(import.meta);

import { APIApplicationCommand, REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes, SlashCommandBuilder } from 'discord.js';
const guildId = Safety.env.GUILD_ID;
const token = Safety.env.BOT_TOKEN;

import fs from 'node:fs';

const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command: Command = await import("file://" + filePath);
		commands.push(command.data.toJSON());
	}
}

const rest = new REST().setToken(token);

(async () => {

	try {
		logger.debug(`Started refreshing ${commands.length} application (/) commands.`);
		let data: APIApplicationCommand[];
		if (Safety.isDev === true) {
			log.warn("In dev mode, deploying to guild");
			data = await rest.put(
				Routes.applicationGuildCommands(global.clientId, guildId),
				{ body: commands },
			) as APIApplicationCommand[];
		} else {
			log.debug("In prod mode, deploying globally");
			data = await rest.put(
				Routes.applicationCommands(global.clientId),
				{ body: commands },
			) as APIApplicationCommand[];
		}

		logger.debug(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();

interface Command {
	data: SlashCommandBuilder;
	execute(interaction: any): Promise<void>;
}