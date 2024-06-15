import { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ButtonInteraction, APIActionRowComponent, ButtonComponent, APIButtonComponent } from "discord.js";

import express from "express";
const app = express.Router();
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import kv from "../utilities/kv.js";
import logger from '../utilities/structs/log.js';
import error from "../utilities/structs/error.js";
import functions from "../utilities/structs/functions.js";
import { client } from "../bot/index.js";
import log from "../utilities/structs/log.js";
import Safety from "../utilities/safety.js";

import tokenCreation from "../tokenManager/tokenCreation.js";
import { verifyToken } from "../tokenManager/tokenVerify.js";
import User from "../model/user.js";



function waitFor2FA(req: { user: any; }) {
    return new Promise<void>((resolve) => {
        const checkCondition = async () => {
            while ((await kv.get(req.user.discordId)) !== "true") {
                await new Promise((r) => setTimeout(r, 1000));
            }
            resolve();
        };
        checkCondition();
    });
}
app.post("/account/api/oauth/token", async (req: any, res) => {
    let clientId: any[];
    let rebootAccount: boolean = false;

    try {
        clientId = functions.DecodeBase64((req.headers["authorization"] ?? "").split(" ")[1]).split(":");

        if (!clientId[1]) throw new Error("invalid client id");

        clientId = clientId[0];
    } catch {
        return error.createError(
            "errors.com.epicgames.common.oauth.invalid_client",
            "It appears that your Authorization header may be invalid or not present, please verify that you are sending the correct headers.",
            [], 1011, "invalid_client", 400, res
        );
    }

    switch (req.body.grant_type) {
        case "client_credentials":
            let ip = req.ip;
            /*         
                        if (!global.clientTokens) {
                            global.clientTokens = await redis.get('tokens');
                            logger.backend("Client tokens array was empty, created new one.");
                        } */

            let clientToken = global.clientTokens.findIndex((i: { ip: any; }) => i.ip == ip);
            if (clientToken != -1) global.clientTokens.splice(clientToken, 1);

            const token = tokenCreation.createClient(clientId, req.body.grant_type, ip, 4); // expires in 4 hours

            functions.UpdateTokens();

            const decodedClient = jwt.decode(token) as JwtPayload;

            res.json({
                access_token: `eg1~${token}`,
                expires_in: Math.round(((DateAddHours(new Date(decodedClient.creation_date), decodedClient.hours_expire).getTime()) - (new Date().getTime())) / 1000),
                expires_at: DateAddHours(new Date(decodedClient.creation_date), decodedClient.hours_expire).toISOString(),
                token_type: "bearer",
                client_id: clientId,
                internal_client: true,
                client_service: "fortnite"
            });
            return;

        case "password":

            if (!req.body.username || !req.body.password) return error.createError(
                "errors.com.epicgames.common.oauth.invalid_request",
                "Username/password is required.",
                [], 1013, "invalid_request", 400, res
            );
            const { username: email, password: password } = req.body;

            const regex = /@projectreboot\.dev$/;

            rebootAccount = regex.test(email);

            log.debug(`Reboot account: ${rebootAccount}`);


            req.user = await User.findOne({ email: email.toLowerCase() }).lean();

            let err = () => error.createError(
                "errors.com.epicgames.account.invalid_account_credentials",
                "Your e-mail and/or password are incorrect. Please check them and try again.",
                [], 18031, "invalid_grant", 400, res
            );

            if (!req.user) return err();
            else {
                if (!rebootAccount) {
                    if (!(await bcrypt.compare(password, req.user.password))) return err();
                }
            }

            if (req.user.mfa) {

                const discordId = req.user.discordId || null;

                await kv.set(req.user.discordId, "false");

                const embed = new EmbedBuilder()
                    .setColor('#2b2d31')
                    .setTitle('New Login')
                    .setDescription("A new login has been detected. Was this you? You have 20 seconds to press the corresponding button.")
                    .addFields(
                        { name: 'Account name', value: req.user.username, inline: false },
                        { name: 'Account ID', value: req.user.accountId, inline: true },
                        { name: 'IP Address', value: req.ip, inline: false },
                    )
                    .setTimestamp()
                    .setFooter({
                        text: 'Momentum',
                        iconURL: 'https://cdn.discordapp.com/avatars/1107325625074733127/42e9c19a432cf6a9cb607a47813a31de.webp?size=512'
                    });

                const yesButton: APIButtonComponent = {
                    type: 2,
                    style: 3,
                    label: 'Yes',
                    custom_id: 'yes'
                }

                const noButton: APIButtonComponent = {
                    type: 2,
                    style: 4,
                    label: 'No',
                    custom_id: 'no'
                }

                const row: APIActionRowComponent<APIButtonComponent> = {
                    type: 1,
                    components: [yesButton, noButton]
                }

                const discordUser = await client.users.fetch(discordId!);
                const sentMessage = await discordUser.send({ embeds: [embed], components: [row] });

                const collector = sentMessage.createMessageComponentCollector({ time: 20000 });

                collector.on('collect', async (i: ButtonInteraction) => {
                    log.debug(`Interaction Button ID: ${i.customId} | Interaction User ID: ${i.user.id}`)
                    switch (i.customId) {
                        case 'yes':
                            await kv.set(req.user.discordId, "true");
                            await i.reply('Thank you for keeping your account secure, you will now be logging in.');
                            yesButton.disabled = true;
                            noButton.disabled = true;
                            await sentMessage.edit({ components: [row] })
                            break;
                        case 'no':
                            await kv.set(req.user.discordId, "false");
                            error.createError(
                                "errors.com.epicgames.account.oauth.user_denied",
                                "User denied the request.",
                                [], 18058, "access_denied", 400, res
                            );
                            await i.reply('Thank you! If you think your account has been compromised, please contact a staff member.');
                            yesButton.disabled = true;
                            noButton.disabled = true;
                            await sentMessage.edit({ components: [row] })
                            break;
                    }
                });

                collector.on('end', async (collected, reason) => {
                    if (reason === 'time' && !(await kv.get(req.user.discordId))) {
                        await kv.set(req.user.discordId, "false");
                        error.createError(
                            "errors.com.epicgames.account.oauth.user_denied",
                            "User denied the request.",
                            [], 18058, "access_denied", 400, res
                        );
                        sentMessage.reply('Your interaction was not detected in time, please try again.');
                        yesButton.disabled = true;
                        noButton.disabled = true;
                        await sentMessage.edit({ components: [row] })
                    }
                });

                //Wait for 2FA
                await waitFor2FA(req);
            } else {
                ;
            }

            break;

        case "refresh_token":
            if (!req.body.refresh_token) return error.createError(
                "errors.com.epicgames.common.oauth.invalid_request",
                "Refresh token is required.",
                [], 1013, "invalid_request", 400, res
            );

            const refresh_token = req.body.refresh_token;

            let refreshToken = global.refreshTokens.findIndex((i: { token: any; }) => i.token == refresh_token);
            let object = global.refreshTokens[refreshToken];

            try {
                if (refreshToken == -1) throw new Error("Refresh token invalid.");
                let decodedRefreshToken = jwt.decode(refresh_token.replace("eg1~", "")) as JwtPayload;

                if (DateAddHours(new Date(decodedRefreshToken.creation_date), decodedRefreshToken.hours_expire).getTime() <= new Date().getTime()) {
                    throw new Error("Expired refresh token.");
                }
            } catch {
                if (refreshToken != -1) {
                    global.refreshTokens.splice(refreshToken, 1);

                    functions.UpdateTokens();
                }

                error.createError(
                    "errors.com.epicgames.account.auth_token.invalid_refresh_token",
                    `Sorry the refresh token '${refresh_token}' is invalid`,
                    [refresh_token], 18036, "invalid_grant", 400, res
                );

                return;
            }

            req.user = await User.findOne({ accountId: object.accountId }).lean();
            break;

        case "exchange_code":
            if (!req.body.exchange_code) return error.createError(
                "errors.com.epicgames.common.oauth.invalid_request",
                "Exchange code is required.",
                [], 1013, "invalid_request", 400, res
            );

            const { exchange_code } = req.body;

            let index = global.exchangeCodes.findIndex((i: { exchange_code: any; }) => i.exchange_code == exchange_code);
            let exchange = global.exchangeCodes[index];

            if (index == -1) return error.createError(
                "errors.com.epicgames.account.oauth.exchange_code_not_found",
                "Sorry the exchange code you supplied was not found. It is possible that it was no longer valid",
                [], 18057, "invalid_grant", 400, res
            );

            global.exchangeCodes.splice(index, 1);

            req.user = await User.findOne({ accountId: exchange.accountId }).lean();
            break;

        default:
            error.createError(
                "errors.com.epicgames.common.oauth.unsupported_grant_type",
                `Unsupported grant type: ${req.body.grant_type}`,
                [], 1016, "unsupported_grant_type", 400, res
            );
            return;
    }

    if (req.user.banned === undefined) return error.createError(
        "errors.com.epicgames.account.oauth.account_not_found",
        "Sorry the account you are trying to login to does not exist",
        [], 18056, "invalid_grant", 400, res
    );

    if (req.user.banned) return error.createError(
        "errors.com.epicgames.account.account_not_active",
        "You have been permanently banned from Fortnite.",
        [], -1, undefined, 400, res
    );

    let refreshIndex = global.refreshTokens.findIndex((i: { accountId: any; }) => i.accountId == req.user.accountId);
    if (refreshIndex != -1) global.refreshTokens.splice(refreshIndex, 1);

    let accessIndex = global.accessTokens.findIndex((i: { accountId: any; }) => i.accountId == req.user.accountId);
    if (accessIndex != -1) {
        global.accessTokens.splice(accessIndex, 1);

        let xmppClient = global.Clients.find((i: { accountId: any; }) => i.accountId == req.user.accountId);
        if (xmppClient) xmppClient.client.close();
    }

    const deviceId = functions.MakeID().replace(/-/ig, "");
    const accessToken = tokenCreation.createAccess(req.user, clientId, req.body.grant_type, deviceId, 8); // expires in 8 hours
    const refreshToken = tokenCreation.createRefresh(req.user, clientId, req.body.grant_type, deviceId, 24); // expires in 24 hours

    functions.UpdateTokens();

    const decodedAccess = jwt.decode(accessToken) as JwtPayload;
    const decodedRefresh = jwt.decode(refreshToken) as JwtPayload;

    res.json({
        access_token: `eg1~${accessToken}`,
        expires_in: Math.round(((DateAddHours(new Date(decodedAccess.creation_date), decodedAccess.hours_expire).getTime()) - (new Date().getTime())) / 1000),
        expires_at: DateAddHours(new Date(decodedAccess.creation_date), decodedAccess.hours_expire).toISOString(),
        token_type: "bearer",
        refresh_token: `eg1~${refreshToken}`,
        refresh_expires: Math.round(((DateAddHours(new Date(decodedRefresh.creation_date), decodedRefresh.hours_expire).getTime()) - (new Date().getTime())) / 1000),
        refresh_expires_at: DateAddHours(new Date(decodedRefresh.creation_date), decodedRefresh.hours_expire).toISOString(),
        account_id: req.user.accountId,
        client_id: clientId,
        internal_client: true,
        client_service: "fortnite",
        displayName: req.user.username,
        app: "fortnite",
        in_app_id: req.user.accountId,
        device_id: deviceId
    });

    await kv.set(req.user.discordId, 'false');

});
app.get("/account/api/oauth/verify", verifyToken, (req: any, res) => {
    let token = req.headers["authorization"]!.replace("bearer ", "");
    const decodedToken = jwt.decode(token.replace("eg1~", "")) as JwtPayload;

    res.json({
        token: token,
        session_id: decodedToken.jti,
        token_type: "bearer",
        client_id: decodedToken.clid,
        internal_client: true,
        client_service: "fortnite",
        account_id: req.user.accountId,
        expires_in: Math.round(((DateAddHours(new Date(decodedToken.creation_date), decodedToken.hours_expire).getTime()) - (new Date().getTime())) / 1000),
        expires_at: DateAddHours(new Date(decodedToken.creation_date), decodedToken.hours_expire).toISOString(),
        auth_method: decodedToken.am,
        display_name: req.user.username,
        app: "fortnite",
        in_app_id: req.user.accountId,
        device_id: decodedToken.dvid
    });
});

app.delete("/account/api/oauth/sessions/kill", (req, res) => {
    res.status(204).end();
});

app.delete("/account/api/oauth/sessions/kill/:token", (req, res) => {
    let token = req.params.token;

    let accessIndex = global.accessTokens.findIndex((i: { token: any; }) => i.token == token);

    if (accessIndex != -1) {
        let object = global.accessTokens[accessIndex];

        global.accessTokens.splice(accessIndex, 1);

        let xmppClient = global.Clients.find((i: { token: any; }) => i.token == object.token);
        if (xmppClient) xmppClient.client.close();

        let refreshIndex = global.refreshTokens.findIndex((i: { accountId: any; }) => i.accountId == object.accountId);
        if (refreshIndex != -1) global.refreshTokens.splice(refreshIndex, 1);
    }

    let clientIndex = global.clientTokens.findIndex((i: { token: any; }) => i.token == token);
    if (clientIndex != -1) global.clientTokens.splice(clientIndex, 1);

    if (accessIndex != -1 || clientIndex != -1) functions.UpdateTokens();

    res.status(204).end();
});

app.post("/auth/v1/oauth/token", async (req, res) => {
    res.json({
        access_token: "momentumaccesstoken",
        token_type: "bearer",
        expires_at: "9999-12-31T23:59:59.999Z",
        features: [
            "AntiCheat",
            "Connect",
            "Ecom"
        ],
        organization_id: "momentumorgid",
        product_id: "prod-fn",
        sandbox_id: "fn",
        deployment_id: "momentumdeploymentid",
        expires_in: 3599
    });
})

app.post("/epic/oauth/v2/token", async (req: any, res) => {
    let clientId;

    try {
        clientId = functions.DecodeBase64((req.headers["authorization"] || "").split(" ")[1]).split(":");

        if (!clientId[1]) throw new Error("invalid client id");

        clientId = clientId[0];
    } catch {
        return error.createError(
            "errors.com.epicgames.common.oauth.invalid_client",
            "It appears that your Authorization header may be invalid or not present, please verify that you are sending the correct headers.",
            [], 1011, "invalid_client", 400, res
        );
    }

    if (!req.body.refresh_token) return error.createError(
        "errors.com.epicgames.common.oauth.invalid_request",
        "Refresh token is required.",
        [], 1013, "invalid_request", 400, res
    );

    const refresh_token = req.body.refresh_token;

    let refreshToken = global.refreshTokens.findIndex(i => i.token == refresh_token);
    let object = global.refreshTokens[refreshToken];

    try {
        if (refreshToken == -1) throw new Error("Refresh token invalid.");
        let decodedRefreshToken = jwt.decode(refresh_token.replace("eg1~", "")) as JwtPayload;

        if (DateAddHours(new Date(decodedRefreshToken.creation_date), decodedRefreshToken.hours_expire).getTime() <= new Date().getTime()) {
            throw new Error("Expired refresh token.");
        }
    } catch {
        if (refreshToken != -1) {
            global.refreshTokens.splice(refreshToken, 1);

            functions.UpdateTokens();
        }

        error.createError(
            "errors.com.epicgames.account.auth_token.invalid_refresh_token",
            `Sorry the refresh token '${refresh_token}' is invalid`,
            [refresh_token], 18036, "invalid_grant", 400, res
        );

        return;
    }

    req.user = await User.findOne({ accountId: object.accountId }).lean();

    res.json({
        scope: req.body.scope || "basic_profile friends_list openid presence",
        token_type: "bearer",
        access_token: "momentumtoken",
        refresh_token: "momentumrefreshtoken",
        id_token: "momentumidtoken",
        expires_in: 7200,
        expires_at: "9999-12-31T23:59:59.999Z",
        refresh_expires_in: 28800,
        refresh_expires_at: "9999-12-31T23:59:59.999Z",
        account_id: req.user.accountId,
        client_id: clientId,
        application_id: "momentumappid",
        selected_account_id: req.user.accountId,
        merged_accounts: []
    });
})

export function DateAddHours(pdate: Date, number: any) {
    let date = pdate;
    date.setHours(date.getHours() + number);

    return date;
}

export default app;