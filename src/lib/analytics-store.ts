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
    if (visitors.length === 0) {
      //console.log(`No visitors found for key ${key}`);
      continue;
    }
    //console.log(`Fetched ${visitors.length} visitors for key ${key}`);
    visitors.forEach((v) => allVisitors.add(v));
  }

  console.log(
    `Total unique visitors over the last ${days} day(s): ${allVisitors.size}`
  );
  return allVisitors.size;
}
