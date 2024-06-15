import { iMMCodes } from "../model/mmcodes.js";
import Safety from "../utilities/safety.js";



import express from "express";
const app = express.Router();
import functions from "../utilities/structs/functions.js";
import MMCode from "../model/mmcodes.js";
import { verifyToken } from "../tokenManager/tokenVerify.js";
import qs from "qs";
import error from "../utilities/structs/error.js";

let buildUniqueId = {};

app.get("/fortnite/api/matchmaking/session/findPlayer/*", (req, res) => {
    res.status(200).end();
});

app.get("/fortnite/api/game/v2/matchmakingservice/ticket/player/*", verifyToken, async (req: any, res) => {
    const playerCustomKey = qs.parse(req.url.split("?")[1], { ignoreQueryPrefix: true })['player.option.customKey'] as string;
    const bucketId = qs.parse(req.url.split("?")[1], { ignoreQueryPrefix: true })['bucketId'] as string;
    if (typeof bucketId !== "string" || bucketId.split(":").length !== 4) {
        return res.status(400).end();
    }
    //const region = bucketId.split(":")[2];
    const playlist = bucketId.split(":")[3];

    const gameServers = Safety.env.GAME_SERVERS;
    let selectedServer = gameServers.find(server => server.split(":")[2] === playlist);

    if (!selectedServer) {
        console.log("No server found for playlist", playlist);
        return error.createError(
            "errors.com.epicgames.common.matchmaking.playlist.not_found",
            `No server found for playlist ${playlist}`,
            [], 1013, "invalid_playlist", 404, res
        );
    }

    await global.kv.set(`playerPlaylist:${req.user.accountId}`, playlist);

    if (typeof playerCustomKey == "string") {

        let codeDocument: iMMCodes = await MMCode.findOne({ code_lower: playerCustomKey?.toLowerCase() }) as iMMCodes;
        if (!codeDocument) {
            return error.createError(
                "errors.com.epicgames.common.matchmaking.code.not_found",
                `The matchmaking code "${playerCustomKey}" was not found`,
                [], 1013, "invalid_code", 404, res
            );
        }

        const kvDocument = JSON.stringify({
            ip: codeDocument.ip,
            port: codeDocument.port,
            playlist: playlist,
        })
        await global.kv.set(`playerCustomKey:${req.user.accountId}`, kvDocument);
    }
    if (typeof req.query.bucketId !== "string" || req.query.bucketId.split(":").length !== 4) {
        return res.status(400).end();
    }

    buildUniqueId[req.user.accountId] = req.query.bucketId.split(":")[0];

    const matchmakerIP = Safety.env.MATCHMAKER_IP;

    return res.json({
        "serviceUrl": matchmakerIP.includes("ws") || matchmakerIP.includes("wss") ? matchmakerIP : `ws://${matchmakerIP}`,
        "ticketType": "mms-player",
        "payload": "account",
        "signature": `${req.user.matchmakingId} ${playlist}`
    })

});

app.get("/fortnite/api/game/v2/matchmaking/account/:accountId/session/:sessionId", (req: any, res) => {
    res.json({
        "accountId": req.params.accountId,
        "sessionId": req.params.sessionId,
        "key": "none"
    });
});

app.get("/fortnite/api/matchmaking/session/:sessionId", verifyToken, async (req: any, res) => {

    const playlist = await global.kv.get(`playerPlaylist:${req.user.accountId}`);

    let kvDocument = await global.kv.get(`playerCustomKey:${req.user.accountId}`);
    if (!kvDocument) {
        const gameServers = Safety.env.GAME_SERVERS;
        let selectedServer = gameServers.find(server => server.split(":")[2] === playlist);
        //Typescript will complain if I don't check if selectedServer is undefined
        if (!selectedServer) {
            console.log("No server found for playlist", playlist);
            return error.createError(
                "errors.com.epicgames.common.matchmaking.playlist.not_found",
                `No server found for playlist ${playlist}`,
                [], 1013, "invalid_playlist", 404, res
            );
        }
        kvDocument = JSON.stringify({
            ip: selectedServer.split(":")[0],
            port: selectedServer.split(":")[1],
            playlist: selectedServer.split(":")[2]
        });
    }

    let codeKV = JSON.parse(kvDocument);

    res.json({
        "id": req.params.sessionId,
        "ownerId": functions.MakeID().replace(/-/ig, "").toUpperCase(),
        "ownerName": "[DS]fortnite-liveeugcec1c2e30ubrcore0a-z8hj-1968",
        "serverName": "[DS]fortnite-liveeugcec1c2e30ubrcore0a-z8hj-1968",
        "serverAddress": codeKV.ip,
        "serverPort": codeKV.port,
        "maxPublicPlayers": 220,
        "openPublicPlayers": 175,
        "maxPrivatePlayers": 0,
        "openPrivatePlayers": 0,
        "attributes": {
            "REGION_s": "EU",
            "GAMEMODE_s": "FORTATHENA",
            "ALLOWBROADCASTING_b": true,
            "SUBREGION_s": "GB",
            "DCID_s": "FORTNITE-LIVEEUGCEC1C2E30UBRCORE0A-14840880",
            "tenant_s": "Fortnite",
            "MATCHMAKINGPOOL_s": "Any",
            "STORMSHIELDDEFENSETYPE_i": 0,
            "HOTFIXVERSION_i": 0,
            "PLAYLISTNAME_s": codeKV.playlist,
            "SESSIONKEY_s": functions.MakeID().replace(/-/ig, "").toUpperCase(),
            "TENANT_s": "Fortnite",
            "BEACONPORT_i": 15009
        },
        "publicPlayers": [],
        "privatePlayers": [],
        "totalPlayers": 45,
        "allowJoinInProgress": false,
        "shouldAdvertise": false,
        "isDedicated": false,
        "usesStats": false,
        "allowInvites": false,
        "usesPresence": false,
        "allowJoinViaPresence": true,
        "allowJoinViaPresenceFriendsOnly": false,
        "buildUniqueId": buildUniqueId[req.user.accountId] || "0",
        "lastUpdated": new Date().toISOString(),
        "started": false
    });
});

app.post("/fortnite/api/matchmaking/session/*/join", (req, res) => {

    res.status(204).end();
});

app.post("/fortnite/api/matchmaking/session/matchMakingRequest", (req, res) => {

    res.json([]);
});

export default app;