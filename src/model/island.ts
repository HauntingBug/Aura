import { Document, Model, model, Schema } from "mongoose";

type linkType = "Creative:Island";
type mmsType = "keep_full";
type mmsPrivacy = "Public" | "Friends" | "Private";
type mode = "live";
type islandType = "CreativePlot:flatgrid_large";
type calibrationPhase = "LiveXP" | "DataGathering";
type moderationStatus = "Approved";
type discoveryIntent = "PUBLIC";
type namespace = "fn";
type menmonic = `${number | ''}${number}-${number}-${number}`

export interface IslandInterface extends Document {
    namespace: namespace;
    accountId: string;
    creatorName: string;
    menmonic: menmonic; //Example: 0007-2048-2784?v=138
    linkType: linkType
    metadata: {
        quicksilver_id: string;
        image_url: string;
        image_urls: {
            url_s: string;
            url_m: string;
            url: string;
        },
        title: string;
        locale: string;
        matchmaking: {
            selectedJoinInProgressType: number; //Example: 980??
            playersPerTeam: number; //-1?
            maximumNumberOfPlayers: number; //Example: 32
            override_playlist?: string; //Empty?
            playerCount: number; //Example: 32
            mmsType: mmsType; //Example: keep_full
            mmsPrivacy: mmsPrivacy; //Example: Public
            numberOfTeams: number; //Example: 16
            bAllowJoinInProgress: boolean; //Example: true
            minimumNumberOfPlayers: number; //Example: 32
            joinInProgressTeam: number; //Example: 255?
        }
        generated_image_urls: {
            url_s: string; //Image url
            url_m: string; //Image url
            compressed: { //Compressed images?
                url_s: string; //Image url
                url_m: string; //Image url
                url: string; //Image url
            }
            url: string; //Image url
        },
        mode: mode; //Example: live
        islandType: islandType; //Example: CreativePlot:flatgrid_large
        dynamicXp: {
            uniqueGameVersion: number; //Example: 138
            calibrationPhase: calibrationPhase; //Example: LiveXP
        },
        tagline: string; //Example: 💛WINS AND ELIMINATIONS GET SAVED💛 💛:exclamation:ALL* WEAPONS:exclamation:💛
        supportCode: string //Example: bio
        projectId: string; //string or uuid? Example: 9b20452c-1659-4583-852e-bd84f973c967
        introduction: string; //Example: Legendary "Bios Zone Wars" with 32 players in 8 custom teams Wins and Eliminations get saved Falldamage ON
    }
    version: number //Example: 138
    active: boolean //Example: true
    disabled: boolean //Example: false
    created: Date //Example: 2023-05-06T02:13:43.780Z
    published: Date //Example: 2023-05-06T02:13:43.780Z
    descriptionTags: string[] //Example: ["4v4", "practice", "zonewars"] (0, 1, 2)
    moderationStatus: moderationStatus //Example: Approved
    lastActiveDate: Date //Example:2023-05-06T02:17:34.231Z
    discoveryIntent: discoveryIntent //Example: PUBLIC
}

const IslandSchema: Schema = new Schema(
    {
        namespace: { type: String, required: true },
        accountId: { type: String, required: true },
        creatorName: { type: String, required: true },
        menmonic: { type: String, required: true },
        linkType: { type: String, required: true },
        metadata: {
            quicksilver_id: { type: String, required: true },
            image_url: { type: String, required: true },
            image_urls: {
                url_s: { type: String, required: true },
                url_m: { type: String, required: true },
                url: { type: String, required: true },
            },
            title: { type: String, required: true },
            locale: { type: String, required: true },
            matchmaking: {
                selectedJoinInProgressType: { type: Number, required: true },
                playersPerTeam: { type: Number, required: true },
                maximumNumberOfPlayers: { type: Number, required: true },
                override_playlist: { type: String, required: true },
                playerCount: { type: Number, required: true },
                mmsType: { type: String, required: true },
                mmsPrivacy: { type: String, required: true },
                numberOfTeams: { type: Number, required: true },
                bAllowJoinInProgress: { type: Boolean, required: true },
                minimumNumberOfPlayers: { type: Number, required: true },
                joinInProgressTeam: { type: Number, required: true },
            },
            generated_image_urls: {
                url_s: { type: String, required: true },
                url_m: { type: String, required: true },
                compressed: {
                    url_s: { type: String, required: true },
                    url_m: { type: String, required: true },
                    url: { type: String, required: true },
                },
                url: { type: String, required: true },
            },
            mode: { type: String, required: true },
            islandType: { type: String, required: true },
            dynamicXp: {
                uniqueGameVersion: { type: Number, required: true },
                calibrationPhase: { type: String, required: true },
            },
            tagline: { type: Array, required: true },
            supportCode: { type: String, required: true },
            projectId: { type: String, required: true },
            introduction: { type: String, required: true },
        },
        version: { type: Number, required: true },
        active: { type: Boolean, required: true },
        disabled: { type: Boolean, required: true },
        created: { type: Date, required: true },
        published: { type: Date, required: true },
        descriptionTags: { type: Array, required: true },
        moderationStatus: { type: String, required: true },
        lastActiveDate: { type: Date, required: true },
        discoveryIntent: { type: String, required: true },
    },
    {
        collection: "islands",
    }
);

const Island: Model<IslandInterface> = model<IslandInterface>("Island", IslandSchema);

export default Island;