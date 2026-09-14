import { db } from "@/db";
import { siteContent } from "@/db/schema";
import type { Content } from "@/lib/helpers";

export type { Content } from "@/lib/helpers";

/** Loads the full CMS key/value map from the database. */
export async function getContent(): Promise<Content> {
  const rows = await db.select().from(siteContent);
  const map: Content = {};
  for (const row of rows) map[row.key] = row.value;
  return map;
}
