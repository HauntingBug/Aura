import mongoose from "mongoose";
const MMCodesSchema = new mongoose.Schema({
    created: { type: Date, required: true },
    owner: { type: mongoose.Types.ObjectId, ref: "UserSchema" },
    code: { type: String, required: true },
    code_lower: { type: String, required: true },
    ip: { type: String, required: true },
    port: { type: Number, required: true }
}, {
    collection: "mmcodes"
});
const model = mongoose.model('MMCodeSchema', MMCodesSchema);
export default model;
//# sourceMappingURL=mmcodes.js.map