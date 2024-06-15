import Redis from 'ioredis';
import Safety from './safety.js';
import keyv from 'keyv';

const memkv = new keyv()

const redis = Safety.env.USE_REDIS ? new Redis(Safety.env.REDIS_URL) : null;

class KV {
    async get(key: string): Promise<any> {
        return Safety.env.USE_REDIS ? await redis?.get(key) : await memkv.get(key);
    }

    async set(key: string, value: any): Promise<boolean> {
        const set = Safety.env.USE_REDIS ? await redis?.set(key, value) : await memkv.set(key, value);
        return set === 'OK';
    }

    async setTTL(key: string, value: any, ttl: number): Promise<boolean> {
        const set = Safety.env.USE_REDIS ? await redis?.set(key, value, 'EX', ttl) : await memkv.set(key, value, ttl);
        return set === 'OK';
    }
}

export default new KV();