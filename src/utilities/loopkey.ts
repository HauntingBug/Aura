import { createHash } from 'node:crypto'
import functions from './structs/functions.js';

class Loopkey {

    public async generateLoopKey(token: string): Promise<string> {

        // 🔒 This code hashes the bot token using the SHA-256 hash algorithm to protect sensitive information such as passwords and API keys from being exposed in case of a security breach. 
        // 🔒 SHA-256 is a secure cryptographic hash function that generates a unique hash value for a given input. 
        // 🔒 The hashed token cannot be reversed to obtain the original input. 
        // 🔒 This ensures that our users' data is safe and secure at all times, even from us!
        // 🔒 Learn more about SHA-256 hashing here: https://www.n-able.com/blog/sha-256-encryption#:~:text=SHA%2D256%20is%20a%20patented,as%20long%20as%20when%20unencrypted.
        const HASHED_TOKEN = createHash('sha256').update(token).digest('hex');
        const application = await functions.FetchApplication();
        const ownerId = application.owner.id;
        return Buffer.from(`${HASHED_TOKEN}_${ownerId}`).toString('base64');
    }

}

export default new Loopkey();