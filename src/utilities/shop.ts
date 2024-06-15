import fs from 'fs/promises';
import path from 'path';
import Safety from './safety.js';
import { dirname } from 'dirname-filename-esm'
import { ShopResponse } from '../types/typings';

const __dirname = dirname(import.meta)

//I'll make it not write to file later, icba for now

class Shop {

    public async updateShop(): Promise<ShopResponse[] | boolean[]> {
        const newItems: any[] = [];

        const [shopResponse, catalogString, catalogRaw] = await Promise.all([
            fetch(`https://fortnite.rest/shop/random/${Safety.env.MAIN_SEASON}`, {
                method: 'GET',
            }),
            await fs.readFile(path.join(__dirname, "../../Config/catalog_config.json"), 'utf-8'),
            await fs.readFile(path.join(__dirname, "../../responses/catalog.json"), 'utf-8')
        ]);

        if (!shopResponse) return [];

        const shopJSON = await shopResponse.json();

        if (shopJSON.error) {
            if (shopJSON.error === "Module shop not enabled for this loopkey") {
                return [false];
            }
        }

        const dailyItems = shopJSON.daily;
        const featuredItems = shopJSON.featured;
        const catalog = JSON.parse(catalogString);
        const catalogRawJSON = JSON.parse(catalogRaw);

        for (const [i, dailyItem] of dailyItems.entries()) {
            const { shopName, price } = dailyItem;

            catalog[`daily${i + 1}`].price = price;
            catalog[`daily${i + 1}`].itemGrants = [shopName];

            newItems.push(dailyItem);
        }

        for (const [i, featuredItem] of featuredItems.entries()) {
            const { shopName, price } = featuredItem;

            catalog[`featured${i + 1}`].price = price;
            catalog[`featured${i + 1}`].itemGrants = [shopName];

            newItems.push(featuredItem);
        }

        const todayAtMidnight = new Date();
        todayAtMidnight.setHours(24, 0, 0, 0)
        const todayOneMinuteBeforeMidnight = new Date(todayAtMidnight.getTime() - 60000);
        const isoDate = todayOneMinuteBeforeMidnight.toISOString();

        catalogRawJSON.expiration = isoDate

        await Promise.all([
            fs.writeFile(path.join(__dirname, "../../Config/catalog_config.json"), JSON.stringify(catalog, null, 4)),
            fs.writeFile(path.join(__dirname, "../../responses/catalog.json"), JSON.stringify(catalogRawJSON, null, 4))
        ]);

        return newItems;
    }
}

export default new Shop();

