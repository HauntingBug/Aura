import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

import { SlashCommandBuilder } from 'discord.js';
import Users from '../../../model/user.js';
import mmcodes from '../../../model/mmcodes.js';

export const data = new SlashCommandBuilder()
    .setName('createcode')
    .setDescription('Creates a custom matchmaking code')
    .addStringOption(option =>
        option.setName('code')
            .setDescription('Your desired code')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('ip')
            .setDescription('The ip of the gameserver for your code')
            .setRequired(true))
    .addIntegerOption(option =>
        option.setName('port')
            .setDescription('The port of the gameserver for your code')
            .setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {

    try {
        const user = await Users.findOne({ discordId: interaction.user.id });
        if (!user) return interaction.reply({ content: "You are not registered!", ephemeral: true });
        if (user.canCreateCodes === false) return interaction.reply({ content: "You are not allowed to create codes!", ephemeral: true });

        const code = interaction.options.getString('code')!;
        const ip = interaction.options.getString('ip');
        const port = interaction.options.getInteger('port');

        if (code.length > 16) return interaction.reply({ content: "Your code can't be longer than 16 characters", ephemeral: true });
        if (code.length < 4) return interaction.reply({ content: "Your code has to be at least 4 characters long.", ephemeral: true });
        if (code.includes(" ")) return interaction.reply({ content: "Your code can't contain spaces", ephemeral: true });
        if (/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(code)) return interaction.reply({ content: "Your code can't contain any special characters", ephemeral: true });

        const ipExp: RegExp = new RegExp("^((25[0-5]|(2[0-4]|1[0-9]|[1-9]|)[0-9])(\.(?!$)|$)){4}$");

        if (!ipExp.test(ip!)) return interaction.reply({ content: "Your provided an invalid ip adress", ephemeral: true });

        const codeExists = await mmcodes.findOne({ code_lower: code.toLowerCase() });
        if (codeExists) return interaction.reply({ content: "This code already exists", ephemeral: true });

        const newCode = await mmcodes.create({
            created: new Date(),
            owner: user,
            code: code,
            code_lower: code.toLowerCase(),
            ip: ip,
            port: port
        });
        await newCode.save();

        const embed = new EmbedBuilder()
            .setTitle("Code created")
            .setDescription(`Your code has been created. You can now use it to host games.`)
            .setColor("#2b2d31")
            .addFields([
                {
                    name: "Code",
                    value: code!,
                    inline: true
                },
                {
                    name: "IP",
                    value: ip!,
                    inline: true
                },
                {
                    name: "Port",
                    value: port!.toString(),
                    inline: false
                }
            ])
            .setFooter({
                text: "Momentum",
                iconURL: "https://cdn.discordapp.com/app-assets/432980957394370572/1084188429077725287.png",
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (err) {
    }

}