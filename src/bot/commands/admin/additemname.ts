import Asteria from "../../../utilities/asteriasdk/index.js";

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import Users from '../../../model/user.js';
import Profiles from '../../../model/profiles.js';

const asteria = new Asteria({
    collectAnonStats: true,
    throwErrors: true,
});

export const data = new SlashCommandBuilder()
    .setName('addcosmeticname')
    .setDescription('Allows you to give a user any skin, pickaxe, glider, etc. via their name')
    .addStringOption(option =>
        option.setName('username')
            .setDescription('The username of the user you want to give the cosmetic to')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('cosmeticname')
            .setDescription('The name of the cosmetic you want to give')
            .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false);

export async function execute(interaction: ChatInputCommandInteraction) {

    await interaction.deferReply({ ephemeral: true });

    let username = interaction.options.getString('username');

    const user = await Users.findOne({ username_lower: username?.toLowerCase() });
    if (!user) return interaction.editReply({ content: "That user does not own an account" });
    const profile = await Profiles.findOne({ accountId: user.accountId });
    if (!user) return interaction.editReply({ content: "That user does not own an account" });
    if (!profile) return interaction.editReply({ content: "That user does not own an account" });

    const cosmeticname: string = interaction.options.getString('cosmeticname')!;

    const cosmeticCheck = await asteria.getCosmetic("name", cosmeticname, false);

    const regex = /^(?:[A-Z][a-z]*\b\s*)+$/;

    if (!regex.test(cosmeticname)) return await interaction.editReply({ content: "Please check for correct casing. E.g 'renegade raider' is wrong, but 'Renegade Raider' is correct." })

    let cosmetic: any = {};

    try {
        cosmetic = await asteria.getCosmetic("name", cosmeticname, false);
    } catch (err) {
        return await interaction.editReply({ content: "That cosmetic does not exist" });
    } finally {
        try {
            if (profile.profiles.athena.items[`${cosmeticCheck.type.backendValue}:${cosmeticCheck.id}`]) return await interaction.editReply({ content: "That user already has that cosmetic" });
        } catch (err) {
            await fetch(`https://fortnite-api.com/v2/cosmetics/br/search?name=${cosmeticname}`).then(res => res.json()).then(async json => {
                const cosmeticFromAPI = json.data;
                if (profile.profiles.athena.items[`${cosmeticFromAPI.type.backendValue}:${cosmeticFromAPI.id}`]) {
                    await interaction.editReply({ content: "That user already has that cosmetic" });
                    return;
                }
                cosmetic = cosmeticFromAPI;
            })
        }
    }

    await Profiles.findOneAndUpdate(
        { accountId: user.accountId },
        {
            $set: {
                [`profiles.athena.items.${cosmetic.type.backendValue}:${cosmetic.id}`]: {
                    templateId: `${cosmetic.type.backendValue}:${cosmetic.id}`,
                    attributes: {
                        item_seen: false,
                        variants: [],
                        favorite: false,
                    },
                    "quantity": 1,
                },
            },
        },
        { new: true },
    )
        .catch((err) => {
        })

    const embed = new EmbedBuilder()
        .setTitle("Cosmetic added")
        .setDescription("Successfully gave the user the cosmetic: " + cosmetic.name)
        .setThumbnail(cosmetic.images.icon)
        .setColor("#2b2d31")
        .setFooter({
            text: "Momentum",
            iconURL: "https://cdn.discordapp.com/app-assets/432980957394370572/1084188429077725287.png",
        })
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });

}