import { model, Schema } from "mongoose";
const IslandSchema = new Schema({
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
}, {
    collection: "islands",
});
const Island = model("Island", IslandSchema);
export default Island;
//# sourceMappingURL=island.js.map