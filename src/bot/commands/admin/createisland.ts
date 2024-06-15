import { ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import Island, { IslandInterface } from "../../../model/island.js";
import functions from "../../../utilities/structs/functions.js";
import User from '../../../model/user.js';

export const data = new SlashCommandBuilder()
    .setName('createisland')
    .setDescription('Creates a new island (Will take some time because lots of fields)')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption(option => option.setName("title").setDescription("Title of the island").setRequired(true))
    .addStringOption(option => option.setName("description").setDescription("Description of the island").setRequired(true))
    .addStringOption(option => option.setName("mnemonic").setDescription("Mnemonic of the island (code)").setRequired(true))

    .setDMPermission(false);

export async function execute(interaction: ChatInputCommandInteraction) {

    await interaction.deferReply({ ephemeral: true });

    const islandCodePattern = /^\d{4}-\d{4}-\d{4}$/;
    const followsRegex = islandCodePattern.test(interaction.options.getString("mnemonic")!);
    if (!followsRegex) return interaction.editReply("Invalid island code format. Use `0000-0000-0000`");


    const user = await User.findOne({ discordId: interaction.user.id });

    const island: IslandInterface = new Island({
        namespace: "fn",
        accountId: user?.accountId,
        creatorName: user?.username_lower,
        menmonic: interaction.options.getString("mnemonic"),
        linkType: "Creative:Island",
        metadata: {
            quicksilver_id: functions.MakeID(),
            image_url: "https://cdn.discordapp.com/attachments/1097574416453476483/1112428055500173342/image.png",
            image_urls: {
                url_s: "https://cdn.discordapp.com/attachments/1097574416453476483/1112428055500173342/image.png",
                url_m: "https://cdn.discordapp.com/attachments/1097574416453476483/1112428055500173342/image.png",
                url: "https://cdn.discordapp.com/attachments/1097574416453476483/1112428055500173342/image.png",
            },
            title: interaction.options.getString("title"),
            locale: "en-US",
            matchmaking: {
                selectedJoinInProgressType: 980,
                playersPerTeam: -1,
                maximumNumberOfPlayers: 32,
                override_playlist: "none",
                playerCount: 32,
                mmsType: "keep_full",
                mmsPrivacy: "Public",
                numberOfTeams: 16,
                bAllowJoinInProgress: true,
                minimumNumberOfPlayers: 32,
                joinInProgressTeam: 255,
            },
            generated_image_urls: {
                url_s: "https://cdn.discordapp.com/attachments/1097574416453476483/1112428055500173342/image.png",
                url_m: "https://cdn.discordapp.com/attachments/1097574416453476483/1112428055500173342/image.png",
                compressed: {
                    url_s: "https://cdn.discordapp.com/attachments/1097574416453476483/1112428055500173342/image.png",
                    url_m: "https://cdn.discordapp.com/attachments/1097574416453476483/1112428055500173342/image.png",
                    url: "https://cdn.discordapp.com/attachments/1097574416453476483/1112428055500173342/image.png"
                },
                url: "https://cdn.discordapp.com/attachments/1097574416453476483/1112428055500173342/image.png"
            },
            mode: "live",
            islandType: "CreativePlot:flatgrid_large",
            dynamicXp: {
                uniqueGameVersion: "138",
                calibrationPhase: "LiveXP",
            },
            tagline: interaction.options.getString("description"),
            supportCode: user?.username_lower,
            projectId: functions.MakeID(),
            introduction: interaction.options.getString("description"),
        },
        version: 138,
        active: true,
        disabled: false,
        created: new Date().toISOString(),
        published: new Date().toISOString(),
        descriptionTags: [],
        moderationStatus: "Approved",
        lastActiveDate: new Date().toISOString(),
        discoveryIntent: "PUBLIC",
    });

    await island.save();

    const embed: EmbedBuilder = new EmbedBuilder()
        .setTitle("Island Created")
        .setDescription(`Island created with code \`${interaction.options.getString("mnemonic")}\``)
        .setColor("Green")
        .setTimestamp()
        .setFooter({
            text: "Requested by " + interaction.user.username,
            iconURL: interaction.user.displayAvatarURL(),
        })
        .addFields(
            { name: "Title", value: interaction.options.getString("title")!, inline: true },
            { name: "Description", value: interaction.options.getString("description")!, inline: true },
            { name: "Mnemonic", value: interaction.options.getString("mnemonic")!, inline: true },
        );

    await interaction.editReply({ embeds: [embed] });

}
