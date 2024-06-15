import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import Users from '../../../model/user.js';
import bcrypt from 'bcrypt';

export const data = new SlashCommandBuilder()
	.setName('password')
	.setDescription('Allows you to change your password')
	.addStringOption(option =>
		option.setName('password')
			.setDescription('Your desired password')
			.setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
	const user = await Users.findOne({ discordId: interaction.user.id });
	if (!user) return interaction.reply({ content: "You are not registered!", ephemeral: true });

	const plainPassword = interaction.options.getString('password')!;

	if (plainPassword.length >= 128) return interaction.reply({ content: "You do not need a 128 character password", ephemeral: true });
	if (plainPassword.length < 8) return interaction.reply({ content: "Your password has to be at least 8 characters long.", ephemeral: true });

	const hashedPassword = await bcrypt.hash(plainPassword, 10);

	await user.updateOne({ $set: { password: hashedPassword } });

	const embed = new EmbedBuilder()
		.setTitle("Password changed")
		.setDescription("Your account password has been changed")
		.setColor("#2b2d31")
		.setFooter({
			text: "Momentum",
			iconURL: "https://cdn.discordapp.com/app-assets/432980957394370572/1084188429077725287.png",
		})
		.setTimestamp();

	await interaction.reply({ embeds: [embed], ephemeral: true });

}