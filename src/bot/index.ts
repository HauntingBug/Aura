import { Client, Partials, Collection, Events, GatewayIntentBits, ActivityType, SlashCommandBuilder, GuildBan, BaseInteraction } from 'discord.js';
import path from 'node:path';
import logger from '../utilities/structs/log.js';
import fs from 'node:fs';
import Users from '../model/user.js';
import functions from '../utilities/structs/functions.js';
import Safety from '../utilities/safety.js';



export const client: Client = new Client({
	partials: [Partials.Channel, Partials.Message, Partials.Reaction],
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.DirectMessageTyping,
		GatewayIntentBits.GuildMessageTyping,
		GatewayIntentBits.GuildModeration
	],
	presence: {
		activities: [{
			name: 'Momentum',
			type: ActivityType.Playing,
		}],
		status: 'online',
	},
});

global.discordClient = client;
global.discordApplication = await functions.FetchApplication();

client.commands = new Collection();
const basePath = process.cwd();
const foldersPath = path.join(basePath, 'build', 'bot', 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		try {
			const command: Command = await import(`file://${path.join(commandsPath, file)}`);

			if (command.data && 'execute' in command) {
				client.commands.set(command.data.name, command);
			} else {
				logger.error(`[WARNING] The command at ${path.join(commandsPath, file) } is missing a required "data" or "execute" property.`);
			}
		} catch (error) {
			logger.error(`[ERROR] Error loading command file at ${path.join(commandsPath, file) }: ${error}`);
		}
	}
}

client.once(Events.ClientReady, async () => {
	let clientId = await client.application?.id;
	global.clientId = clientId;
	import('./deploy-commands.js');
});

client.once(Events.ClientReady, async () => {
	logger.bot(`[READY] Logged in as ${client.user?.tag}!`);
});

client.on(Events.InteractionCreate, async (interaction: BaseInteraction) => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName)!;

	if (!command) await interaction.reply({ content: 'This command does not exist', ephemeral: true });

	try {
		await command.execute(interaction);
	} catch (error: any) {
		console.log(error.toString());
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

client.on(Events.GuildBanAdd, async (ban: GuildBan) => {
	if (!Safety.env.ENABLE_CROSS_BANS) return;
	const memberBan = await ban.fetch();

	if (memberBan.user.bot) return;

	const userData = await Users.findOne({ discordId: memberBan.user.id });

	if (userData && userData.banned !== true) {
		await userData.updateOne({ $set: { banned: true } });

		let refreshToken = global.refreshTokens.findIndex(i => i.accountId == userData.accountId);
		if (refreshToken != -1) global.refreshTokens.splice(refreshToken, 1);

		let accessToken = global.accessTokens.findIndex(i => i.accountId == userData.accountId);
		if (accessToken != -1) {
			global.accessTokens.splice(accessToken, 1);

			let xmppClient = global.Clients.find(client => client.accountId == userData.accountId);
			if (xmppClient) xmppClient.client.close();
		}

		if (accessToken != -1 || refreshToken != -1) await functions.UpdateTokens();
		logger.bot(`[BAN] ${memberBan.user.tag} has been banned from the backend since they got banned from the Discord server.`);
	}
});

client.on(Events.GuildBanRemove, async (ban: GuildBan) => {
	if (!Safety.env.ENABLE_CROSS_BANS) return;
	if (ban.user.bot) return;
	
	const userData = await Users.findOne({ discordId: ban.user.id });

	if (userData && userData.banned === true) {
		await userData.updateOne({ $set: { banned: false } });
		logger.bot(`[BAN] ${ban.user.tag} has been unbanned from the backend since they got unbanned from the Discord server.`);
	}
});

interface Command {
	data: SlashCommandBuilder;
	execute(interaction: any): Promise<void>;
}

declare module 'discord.js' {
	interface Client {
		commands: Collection<string, Command>;
	}
}