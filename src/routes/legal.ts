

import express from "express";
import fs from 'fs';
const eulaJson = JSON.parse(fs.readFileSync('./responses/eula/SharedAgreements.json', 'utf8'));
const app = express.Router();

app.get("/eulatracking/api/shared/agreements/fn", async (req, res) => {

    res.json(eulaJson);

});

app.get("/eulatracking/api/public/agreements/fn/account/:accountId", async (req, res) => {

    res.status(204).send();

}); 

export default app;