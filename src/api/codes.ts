import { iUser } from './../model/user';
import express from "express";
const app = express.Router();
import { verifyApikey } from "../utilities/api.js";
import MMCodes from "../model/mmcodes.js";
import Users from "../model/user.js";

app.put("/api/codes/create", verifyApikey, async (req, res) => {

    const { code, ip, port, accountId } = req.body;

    if (!code || !ip || !port || !accountId) return res.status(400).json({ error: "Missing parameter: " + (!code ? "code" : !ip ? "ip" : !port ? "port" : !accountId ? "accountId" : "") });

    const user = await Users.findOne({ accountId: accountId });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (code.length > 16) return res.status(400).json({ error: "Your code can't be longer than 16 characters" });
    if (code.length < 4) return res.status(400).json({ error: "Your code has to be at least 4 characters long." });
    if (code.includes(" ")) return res.status(400).json({ error: "Your code can't contain spaces" });
    if (/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(code)) return res.status(400).json({ error: "Your code can't contain any special characters" });

    const ipExp: RegExp = new RegExp("^((25[0-5]|(2[0-4]|1[0-9]|[1-9]|)[0-9])(\.(?!$)|$)){4}$");

    if (!ipExp.test(ip)) return res.status(400).json({ error: "Your provided an invalid ip adress" });

    const codeExists = await MMCodes.findOne({ code_lower: code.toLowerCase() });
    if (codeExists) return res.status(400).json({ error: "This code already exists" });

    const newCode = await MMCodes.create({
        created: new Date(),
        owner: user,
        code: code,
        code_lower: code.toLowerCase(),
        ip: ip,
        port: port
    });
    await newCode.save();

    return res.status(200).json({ success: true, code: code, ip: ip, port: port, accountId: accountId });

});

app.delete("/api/codes/delete", verifyApikey, async (req, res) => {

    const { code, accountId } = req.body;

    if (!code || !accountId) return res.status(400).json({ error: "Missing parameter: " + (!code ? "code" : !accountId ? "accountId" : "") });

    const user: iUser = await Users.findOne({ accountId: accountId }) as iUser;
    if (!user) return res.status(404).json({ error: "User not found" });

    const codeExists = await MMCodes.findOne({ code_lower: code.toLowerCase() }).populate("owner");
    if (!codeExists) return res.status(404).json({ error: "Code not found" });

    // @ts-expect-error
    if (codeExists.owner?.accountId !== user.accountId) return res.status(403).json({ error: "You don't own this code as the owner is " + codeExists.owner });

    await MMCodes.deleteOne({ code_lower: code.toLowerCase() });

    return res.status(200).json({ success: true, code: code, accountId: accountId });

});

export default app;
