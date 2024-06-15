import express from "express";
const app = express.Router();
import fs from "fs";
import path from "path";
import { dirname } from 'dirname-filename-esm';

const __dirname = dirname(import.meta);

app.get("/api/v1/events/Fortnite/download/:accountId", async (req, res) => {
    const events = JSON.parse(fs.readFileSync(path.join(__dirname, "../../responses/eventlistactive.json"), "utf8"));
    res.json(events)

});

app.get("/api/v1/players/Fortnite/tokens", async (req, res) => {
    res.json({})
});

app.get("/api/v1/leaderboards/Fortnite/:eventId/:eventWindowId/:accountId", async (req, res) => {
    res.json({})
});

app.get("/api/v1/events/Fortnite/data/", async (req, res) => {
    res.json({})
});

app.get("/api/v1/events/Fortnite/:eventId/:eventWindowId/history/:accountId", async (req, res) => {
    res.json({})
});

app.get("/api/v1/players/Fortnite/:accountId", async (req, res) => {
    res.json({
        "result": true,
        "region": "ALL",
        "lang": "en",
        "season": "12",
        "events": []
    })
});

export default app;