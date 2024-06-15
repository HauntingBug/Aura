import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({
    created: { type: Date, required: true },
    banned: { type: Boolean, default: false },
    discordId: { type: String, required: true, unique: true },
    accountId: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    username_lower: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mfa: { type: Boolean, default: false },
    matchmakingId: { type: String, default: null },
    canCreateCodes: { type: Boolean, default: false },
    isServer: { type: Boolean, default: false }
}, {
    collection: "users"
});
const model = mongoose.model('UserSchema', UserSchema);
export default model;
//# sourceMappingURL=user.js.map