import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import functions from "../../../utilities/structs/functions.js";
import log from "../../../utilities/structs/log.js";
import Users from '../../../model/user.js';

export const data = new SlashCommandBuilder()
	.setName('register')
	.setDescription('Creates an account for you')
	.addStringOption(option =>
		option.setName('username')
			.setDescription('The username you want to use')
			.setRequired(true))
	.addStringOption(option =>
		option.setName('email')
			.setDescription('The email you want to use')
			.setRequired(true))
	.addStringOption(option =>
		option.setName('password')
			.setDescription('The password you want to use')
			.setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {

	await interaction.deferReply({ ephemeral: true });

	const discordId = interaction.user.id;
	const username = interaction.options.getString('username');
	const email = interaction.options.getString('email');
	const plainPassword = interaction.options.getString('password');

	const user = await Users.findOne({ discordId: interaction.user.id });
	if (user) return interaction.editReply({ content: "You are already registered!" });

	await functions.registerUser(discordId, username!, email!, plainPassword!, false).then(async (res) => {

		const embed = new EmbedBuilder()
			.setTitle("Account created")
			.setDescription("Your account has been successfully created")
			.addFields(
				{
					name: "Username",
					value: username!,
					inline: false
				},
				{
					name: "Email",
					value: email!,
					inline: false
				}
			)
			.setColor("#2b2d31")
			.setFooter({
				text: "Momentum",
				iconURL: "https://cdn.discordapp.com/app-assets/432980957394370572/1084188429077725287.png",
			})
			.setTimestamp();

		await interaction.editReply({ content: res.message });

		const publicEmbed = new EmbedBuilder()
			.setTitle("New registration")
			.setDescription("A new user has registered")
			.addFields(
				{
					name: "Username",
					value: username!,
				}
			)
			.setColor("#2b2d31")
			.setFooter({
				text: "Momentum",
				iconURL: "https://cdn.discordapp.com/app-assets/432980957394370572/1084188429077725287.png",
			})
			.setTimestamp();

		await interaction.channel?.send({ embeds: [publicEmbed] });
	}).catch((err) => {
		log.error(err);
	});
}
