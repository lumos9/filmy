import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function getUniqueVisitorCount({ days = 1 }: { days: number }) {
  const today = new Date();
  const allVisitors = new Set<string>();

  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = `unique-visitors:${d.toISOString().slice(0, 10)}`;

    const visitors = await redis.smembers(key);
    visitors.forEach((v) => allVisitors.add(v));
  }

  return allVisitors.size;
}
