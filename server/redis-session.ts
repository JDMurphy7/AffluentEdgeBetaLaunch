import { RedisStore } from "connect-redis";
import { createClient } from "redis";

export const redisClient = createClient({
  url: process.env.REDIS_URL
});
redisClient.connect().catch(console.error);

export const sessionStore = new RedisStore({
  client: redisClient,
  prefix: "affluentedge:"
});
