import log from "./log.js";

import XMLBuilder from "xmlbuilder";
import { v4 } from "uuid";
import bcrypt from "bcrypt";
import crypto from "crypto";
import fs from "fs";
import path from "path";

import User from "../../model/user.js";
import Profile from "../../model/profiles.js";
import profileManager from "../../structs/profile.js";
import Friends from "../../model/friends.js";
import { dirname } from 'dirname-filename-esm';

const __dirname = dirname(import.meta);

class functions {

    public sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    public GetVersionInfo(req) {
        let memory = {
            season: 0,
            build: 0.0,
            CL: "0",
            lobby: ""
        }

        if (req.headers["user-agent"]) {
            let CL = "";

            try {
                let BuildID = req.headers["user-agent"].split("-")[3].split(",")[0];

                if (!Number.isNaN(Number(BuildID))) CL = BuildID;
                else {
                    BuildID = req.headers["user-agent"].split("-")[3].split(" ")[0];

                    if (!Number.isNaN(Number(BuildID))) CL = BuildID;
                }
            } catch {
                try {
                    let BuildID = req.headers["user-agent"].split("-")[1].split("+")[0];

                    if (!Number.isNaN(Number(BuildID))) CL = BuildID;
                } catch { }
            }

            try {
                let Build = req.headers["user-agent"].split("Release-")[1].split("-")[0];

                if (Build.split(".").length == 3) {
                    let Value = Build.split(".");
                    Build = Value[0] + "." + Value[1] + Value[2];
                }

                memory.season = Number(Build.split(".")[0]);
                memory.build = Number(Build);
                memory.CL = CL;
                memory.lobby = `LobbySeason${memory.season}`;

                if (Number.isNaN(memory.season)) throw new Error();
            } catch (e) {
                if (Number.isNaN(memory.CL)) {
                    memory.season = 0;
                    memory.build = 0.0;
                    memory.CL = CL;
                    memory.lobby = "LobbySeason0";
                } else if (Number(memory.CL) < 3724489) {
                    memory.season = 0;
                    memory.build = 0.0;
                    memory.CL = CL;
                    memory.lobby = "LobbySeason0";
                } else if (Number(memory.CL) <= 3790078) {
                    memory.season = 1;
                    memory.build = 1.0;
                    memory.CL = CL;
                    memory.lobby = "LobbySeason1";
                } else {
                    memory.season = 2;
                    memory.build = 2.0;
                    memory.CL = CL;
                    memory.lobby = "LobbyWinterDecor";
                }
            }
        }

        return memory;
    }

    public getContentPages(req) {
        const memory = this.GetVersionInfo(req);

        const contentpages = JSON.parse(fs.readFileSync(path.join(__dirname, "../../../", "responses", "contentpages.json")).toString());

        let Language = "en";

        try {
            if (req.headers["accept-language"]) {
                if (req.headers["accept-language"].includes("-") && req.headers["accept-language"] != "es-419") {
                    Language = req.headers["accept-language"].split("-")[0];
                } else {
                    Language = req.headers["accept-language"];
                }
            }
        } catch { }

        const modes = ["saveTheWorldUnowned", "battleRoyale", "creative", "saveTheWorld"];
        const news = ["savetheworldnews", "battleroyalenews"];

        try {
            modes.forEach(mode => {
                contentpages.subgameselectdata[mode].message.title = contentpages.subgameselectdata[mode].message.title[Language]
                contentpages.subgameselectdata[mode].message.body = contentpages.subgameselectdata[mode].message.body[Language]
            })
        } catch { }

        try {
            if (memory.build < 5.30) {
                news.forEach(mode => {
                    contentpages[mode].news.messages[0].image = "https://cdn.discordapp.com/attachments/927739901540188200/930879507496308736/discord.png";
                    contentpages[mode].news.messages[1].image = "https://cdn.discordapp.com/attachments/927739901540188200/930879519882088508/lawin.png";
                });
            }
        } catch { }

        try {
            contentpages.dynamicbackgrounds.backgrounds.backgrounds[0].stage = `season${memory.season}`;
            contentpages.dynamicbackgrounds.backgrounds.backgrounds[1].stage = `season${memory.season}`;

            if (memory.season == 10) {
                contentpages.dynamicbackgrounds.backgrounds.backgrounds[0].stage = "seasonx";
                contentpages.dynamicbackgrounds.backgrounds.backgrounds[1].stage = "seasonx";
            }

            if (memory.build == 11.31 || memory.build == 11.40) {
                contentpages.dynamicbackgrounds.backgrounds.backgrounds[0].stage = "Winter19";
                contentpages.dynamicbackgrounds.backgrounds.backgrounds[1].stage = "Winter19";
            }

            if (memory.build == 19.01) {
                contentpages.dynamicbackgrounds.backgrounds.backgrounds[0].stage = "winter2021";
                contentpages.dynamicbackgrounds.backgrounds.backgrounds[0].backgroundimage = "https://cdn.discordapp.com/attachments/927739901540188200/930880158167085116/t-bp19-lobby-xmas-2048x1024-f85d2684b4af.png";
                contentpages.subgameinfo.battleroyale.image = "https://cdn.discordapp.com/attachments/927739901540188200/930880421514846268/19br-wf-subgame-select-512x1024-16d8bb0f218f.jpg";
                contentpages.specialoffervideo.bSpecialOfferEnabled = "true";
            }

            if (memory.season == 20) {
                if (memory.build == 20.40) {
                    contentpages.dynamicbackgrounds.backgrounds.backgrounds[0].backgroundimage = "https://cdn2.unrealengine.com/t-bp20-40-armadillo-glowup-lobby-2048x2048-2048x2048-3b83b887cc7f.jpg"
                } else {
                    contentpages.dynamicbackgrounds.backgrounds.backgrounds[0].backgroundimage = "https://cdn2.unrealengine.com/t-bp20-lobby-2048x1024-d89eb522746c.png";
                }
            }

            if (memory.season == 21) {
                contentpages.dynamicbackgrounds.backgrounds.backgrounds[0].backgroundimage = "https://cdn2.unrealengine.com/s21-lobby-background-2048x1024-2e7112b25dc3.jpg"
            }
        } catch { }

        return contentpages;
    }

    public getItemShop() {
        const catalog = JSON.parse(fs.readFileSync(path.join(__dirname, "../../../", "responses", "catalog.json"), "utf8"));
        const CatalogConfig = JSON.parse(fs.readFileSync(path.join(__dirname, "../../../", "Config", "catalog_config.json"), "utf8"));

        try {
            for (let value in CatalogConfig) {
                if (!Array.isArray(CatalogConfig[value].itemGrants)) continue;
                if (CatalogConfig[value].itemGrants.length == 0) continue;

                const CatalogEntry: any = { "devName": "", "offerId": "", "fulfillmentIds": [], "dailyLimit": -1, "weeklyLimit": -1, "monthlyLimit": -1, "categories": [], "prices": [{ "currencyType": "MtxCurrency", "currencySubType": "", "regularPrice": 0, "finalPrice": 0, "saleExpiration": "9999-12-02T01:12:00Z", "basePrice": 0 }], "meta": { "SectionId": "Featured", "TileSize": "Small" }, "matchFilter": "", "filterWeight": 0, "appStoreId": [], "requirements": [], "offerType": "StaticPrice", "giftInfo": { "bIsEnabled": true, "forcedGiftBoxTemplateId": "", "purchaseRequirements": [], "giftRecordIds": [] }, "refundable": false, "metaInfo": [{ "key": "SectionId", "value": "Featured" }, { "key": "TileSize", "value": "Small" }], "displayAssetPath": "", "itemGrants": [], "sortPriority": 0, "catalogGroupPriority": 0 };

                let i = catalog.storefronts.findIndex(p => p.name == (value.toLowerCase().startsWith("daily") ? "BRDailyStorefront" : "BRWeeklyStorefront"));
                if (i == -1) continue;

                if (value.toLowerCase().startsWith("daily")) {
                    // Make featured items appear on the left side of the screen
                    CatalogEntry.sortPriority = -1;
                } else {
                    CatalogEntry.meta.TileSize = "Normal";
                    CatalogEntry.metaInfo[1].value = "Normal";
                }

                for (let itemGrant of CatalogConfig[value].itemGrants) {
                    if (typeof itemGrant != "string") continue;
                    if (itemGrant.length == 0) continue;

                    CatalogEntry.requirements.push({ "requirementType": "DenyOnItemOwnership", "requiredId": itemGrant, "minQuantity": 1 });
                    CatalogEntry.itemGrants.push({ "templateId": itemGrant, "quantity": 1 });
                }

                const todayAtMidnight = new Date();
                todayAtMidnight.setHours(24, 0, 0, 0)
                const todayOneMinuteBeforeMidnight = new Date(todayAtMidnight.getTime() - 60000);
                const isoDate = todayOneMinuteBeforeMidnight.toISOString();

                CatalogEntry.prices = [{
                    "currencyType": "MtxCurrency",
                    "currencySubType": "",
                    "regularPrice": CatalogConfig[value].price,
                    "finalPrice": CatalogConfig[value].price,
                    "saleExpiration": isoDate,
                    "basePrice": CatalogConfig[value].price
                }];

                if (CatalogEntry.itemGrants.length > 0) {
                    let uniqueIdentifier = crypto.createHash("sha1").update(`${JSON.stringify(CatalogConfig[value].itemGrants)}_${CatalogConfig[value].price}`).digest("hex");

                    CatalogEntry.devName = uniqueIdentifier;
                    CatalogEntry.offerId = uniqueIdentifier;

                    catalog.storefronts[i].catalogEntries.push(CatalogEntry);
                }
            }
        } catch { }

        return catalog;
    }

    public getOfferID(offerId) {
        const catalog = this.getItemShop();

        for (let storefront of catalog.storefronts) {
            let findOfferId = storefront.catalogEntries.find(i => i.offerId == offerId);

            if (findOfferId) return {
                name: storefront.name,
                offerId: findOfferId
            };
        }
    }

    public MakeID() {
        return v4();
    }

    public sendXmppMessageToAll(body) {
        if (!global.Clients) return;
        if (typeof body == "object") body = JSON.stringify(body);

        global.Clients.forEach(ClientData => {
            ClientData.client.send(XMLBuilder.create("message")
                .attribute("from", "xmpp-admin@prod.ol.epicgames.com")
                .attribute("xmlns", "jabber:client")
                .attribute("to", ClientData.jid)
                .element("body", `${body}`).up().toString());
        });
    }

    public sendXmppMessageToId(body, toAccountId) {
        if (!global.Clients) return;
        if (typeof body == "object") body = JSON.stringify(body);

        let receiver = global.Clients.find(i => i.accountId == toAccountId);
        if (!receiver) return;

        receiver.client.send(XMLBuilder.create("message")
            .attribute("from", "xmpp-admin@prod.ol.epicgames.com")
            .attribute("to", receiver.jid)
            .attribute("xmlns", "jabber:client")
            .element("body", `${body}`).up().toString());
    }

    public getPresenceFromUser(fromId, toId, offline) {
        if (!global.Clients) return;

        let SenderData = global.Clients.find(i => i.accountId == fromId);
        let ClientData = global.Clients.find(i => i.accountId == toId);

        if (!SenderData || !ClientData) return;

        let xml = XMLBuilder.create("presence")
            .attribute("to", ClientData.jid)
            .attribute("xmlns", "jabber:client")
            .attribute("from", SenderData.jid)
            .attribute("type", offline ? "unavailable" : "available")

        if (SenderData.lastPresenceUpdate.away) xml = xml.element("show", "away").up().element("status", SenderData.lastPresenceUpdate.status).up();
        else xml = xml.element("status", SenderData.lastPresenceUpdate.status).up();

        ClientData.client.send(xml.toString());
    }

    public async registerUser(discordId: any, username: string, email: string, plainPassword: string, isServer: boolean) {
        email = email.toLowerCase();

        if (!discordId || !username || !email || !plainPassword) return { message: "Username/email/password is required.", status: 400 };

        if (await User.findOne({ discordId })) return { message: "You already created an account!", status: 400 };

        const accountId = this.MakeID().replace(/-/ig, "");

        // filters
        const emailFilter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if (!emailFilter.test(email)) return { message: "You did not provide a valid email address!", status: 400 };
        if (username.length >= 25) return { message: "Your username must be less than 25 characters long.", status: 400 };
        if (username.length < 3) return { message: "Your username must be atleast 3 characters long.", status: 400 };
        if (plainPassword.length >= 128) return { message: "Your password must be less than 128 characters long.", status: 400 };

        const allowedCharacters = (" !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~").split("");

        for (let character of username) {
            if (!allowedCharacters.includes(character)) return { message: "Your username has special characters, please remove them and try again.", status: 400 };
        }

        const hashedPassword = await bcrypt.hash(plainPassword, 10);

	const lowercaseEmail = email.toLowerCase();

try {
			log.debug(`Creating account with the username ${username} and email ${lowercaseEmail}`);
			await User.create({
				created: new Date().toISOString(),
				banne: false,
				discordId: discordId,
				accountId: this.MakeID(),
				username: username,
				username_lower: username.toLowerCase(),
				email: email.toLowerCase(),
				password: hashedPassword,
				isServer: isServer,
				matchmakingId: this.MakeID(),
			}).then(async (i) => {
				log.debug(`Created user with the username ${username} and email ${lowercaseEmail}`);
				await Profile.create({
					created: i.created,
					accountId: i.accountId,
					profiles: await profileManager.createProfiles(i.accountId ? i.accountId : "")
				});
				log.debug(`Created profile for the user with the username ${username} and email ${lowercaseEmail}`);
				await Friends.create({ created: i.created, accountId: i.accountId });
				log.debug(`Created friends for the user with the username ${username} and email ${lowercaseEmail}`);
			});
        } catch (err: any) {
            if (err.code == 11000) return { message: `Username or email is already in use.`, status: 400 };
            console.error(err);

            return { message: "An unknown error has occured, please try again later.", status: 400 };
        };

        return { message: `Successfully created an account with the username ${username}`, status: 200 };
    }

    public DecodeBase64(str) {
        return Buffer.from(str, 'base64').toString();
    }

    public async UpdateTokens() {
        /*fs.writeFileSync("../../../tokens.json", JSON.stringify({
            accessTokens: global.accessTokens,
            refreshTokens: global.refreshTokens,
            clientTokens: global.clientTokens
        }, null, 2));*/
        await global.kv.set("tokens", JSON.stringify({
            accessTokens: global.accessTokens,
            refreshTokens: global.refreshTokens,
            clientTokens: global.clientTokens
        }, null, 2));
    }

    public async FetchApplication() {
        const req = await fetch("https://discord.com/api/v10/applications/@me", {
            method: "GET",
            headers: {
                Authorization: `Bot ${process.env.BOT_TOKEN}`
            }
        });

        const res = await req.json();

        return res;
    }

}

export default new functions();
