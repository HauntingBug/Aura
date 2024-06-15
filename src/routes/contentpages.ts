import express from "express";
const app = express.Router();
import functions from "../utilities/structs/functions.js";

app.get("/content/api/pages/*", async (req, res) => {
    const contentpages = functions.getContentPages(req);

    res.json(contentpages);
});

export default app;