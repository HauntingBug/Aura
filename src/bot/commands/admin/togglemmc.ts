import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import User from '../../../model/user.js';

export const data = new SlashCommandBuilder()
    .setName('togglemmc')
    .setDescription('Toggle being able to create custom matchmaking codes for this user')
    .addUserOption(option =>
        option.setName('user')
            .setDescription('The user whose account you want to select')
            .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers); 
        
export async function execute(interaction: ChatInputCommandInteraction) {

    await interaction.deferReply({ ephemeral: true });

    const user = await User.findOne({ discordId: interaction.options.getUser('user')!.id });
    if (!user) return await interaction.editReply({ content: "That user does not own an account" });

    const updatedUser = await User.findOneAndUpdate({ discordId: interaction.options.getUser('user')!.id }, { $set: { canCreateCodes: !user.canCreateCodes } }, { new: true });

    await interaction.editReply({ content: `Successfully toggled ${interaction.options.getUser('user')!.username}'s ability to create custom matchmaking codes to ${updatedUser?.canCreateCodes}` });

}
