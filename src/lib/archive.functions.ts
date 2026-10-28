import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { publicClient, type PublicClient } from "./supabase-public";
import { AWARD_ORDER, sanitizeSearch, type MediaItem, type RecipientSummary, type SourceRef } from "./archive";

const MEDIA_COLS = "id,kind,title,description,url,storage_path,width,height,credit,license,license_detail,source_url";
const RECIPIENT_LIST = `slug,full_name,rank,regiment,unit,service_branch,status,date_of_action,birth_state,operation,place_of_action,updated_at,
  war:wars(slug,name,period_label),
  awards(name,year,posthumous),
  portrait:media!martyrs_portrait_media_fk(${MEDIA_COLS})`;

type RawMedia = MediaItem & { storage_path: string | null };

/** Uploaded files live in a private bucket; give them short-lived signed URLs. */
async function resolveMedia<T extends RawMedia | null>(sb: PublicClient, items: T[]): Promise<T[]> {
  const paths = items.filter((m): m is NonNullable<T> => !!m && !!m.storage_path).map((m) => m.storage_path!);
  if (!paths.length) return items;
  const { data } = await sb.storage.from("archive-media").createSignedUrls(paths, 60 * 60 * 6);
  const map = new Map((data ?? []).map((d) => [d.path, d.signedUrl]));
  return items.map((m) => (m && m.storage_path && map.get(m.storage_path) ? { ...m, url: map.get(m.storage_path)! } : m));
}

function sortAwards<T extends { name: string }>(awards: T[]): T[] {
  return [...awards].sort((a, b) => AWARD_ORDER.indexOf(a.name as never) - AWARD_ORDER.indexOf(b.name as never));
}

async function normaliseRecipients(sb: PublicClient, rows: unknown[]): Promise<RecipientSummary[]> {
  const list = rows as (RecipientSummary & { portrait: RawMedia | null })[];
  const portraits = await resolveMedia(sb, list.map((r) => r.portrait));
  return list.map((r, i) => ({ ...r, awards: sortAwards(r.awards ?? []), portrait: portraits[i] ?? null }));
}

function topAward(r: RecipientSummary) {
  return r.awards[0]?.name ?? "";
}

/* ------------------------------------------------------------------ home */

export const getHomeData = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const [recipients, wars, memorials] = await Promise.all([
    sb.from("martyrs").select(RECIPIENT_LIST).order("date_of_action", { ascending: true }),
    sb.from("wars").select("slug,name,type,period_label,start_date,martyrs(count)").order("start_date", { ascending: true, nullsFirst: false }),
    sb.from("memorials").select(`slug,name,city,state,latitude,longitude,inaugurated_year,hero:media!memorials_hero_media_fk(${MEDIA_COLS}),martyr_memorials(count)`).order("name"),
  ]);
  if (recipients.error) throw new Error(recipients.error.message);
  const people = await normaliseRecipients(sb, recipients.data ?? []);
  const memHeroes = await resolveMedia(sb, (memorials.data ?? []).map((m) => m.hero as RawMedia | null));

  const pvc = people.filter((p) => topAward(p) === "Param Vir Chakra");
  const withPortrait = pvc.filter((p) => p.portrait);
  const day = Math.floor(Date.now() / 86_400_000);
  const featured = withPortrait.length ? withPortrait[day % withPortrait.length] : people[0] ?? null;
  const warYears = (wars.data ?? []).map((w) => Number(w.start_date?.slice(0, 4))).filter((y) => y > 0);

  return {
    stats: {
      recipients: people.length,
      memorials: memorials.data?.length ?? 0,
      conflicts: wars.data?.length ?? 0,
      firstYear: warYears.length ? Math.min(...warYears) : null,
      lastYear: warYears.length ? Math.max(...warYears) : null,
    },
    featured,
    pvc,
    // Same order as the conflicts page: by start year, falling back to the period label when there is no start date.
    wars: (wars.data ?? [])
      .map((w) => ({
        slug: w.slug,
        name: w.name,
        type: w.type,
        period_label: w.period_label,
        count: (w.martyrs as unknown as { count: number }[])?.[0]?.count ?? 0,
        sortYear: Number((w.start_date ?? w.period_label ?? "9999").slice(0, 4)),
      }))
      .sort((a, b) => a.sortYear - b.sortYear),
    // Memorials honouring the most recipients first (the National War Memorial leads), then by name.
    memorials: (memorials.data ?? [])
      .map((m, i) => ({
        ...m,
        hero: memHeroes[i],
        honoured: (m.martyr_memorials as unknown as { count: number }[])?.[0]?.count ?? 0,
      }))
      .sort((a, b) => b.honoured - a.honoured || a.name.localeCompare(b.name)),
  };
});

/* ------------------------------------------------------------ recipients */

/**
 * Recipients are linked to their conflict by id, so a text search would miss
 * "kargil" for Captain Batra. These find the conflicts whose name or theatre
 * matches, so recipients linked to them are included too.
 */
async function matchingWarIds(sb: ReturnType<typeof publicClient>, like: string): Promise<string[]> {
  const { data } = await sb.from("wars").select("id").or(`name.ilike.${like},theatre.ilike.${like}`);
  return (data ?? []).map((w) => w.id);
}

function warClause(ids: string[]): string {
  return ids.length ? `,war_id.in.(${ids.join(",")})` : "";
}

const listSchema = z.object({
  q: z.string().max(80).optional(),
  war: z.string().max(80).optional(),
  state: z.string().max(80).optional(),
  award: z.string().max(60).optional(),
  status: z.enum(["fell-in-action", "survived"]).optional(),
  branch: z.string().max(40).optional(),
  decade: z.number().int().min(1940).max(2030).optional(),
  sort: z.enum(["chronological", "recent-first", "name"]).optional(),
  page: z.number().int().min(1).max(500).optional(),
});
export type RecipientFilters = z.infer<typeof listSchema>;

export const listRecipients = createServerFn({ method: "GET" })
  .inputValidator((input: RecipientFilters) => listSchema.parse(input))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const PAGE = 12;
    const page = data.page ?? 1;

    let query = sb.from("martyrs").select(RECIPIENT_LIST.replace("awards(", "awards!inner("), { count: "exact" });
    const q = sanitizeSearch(data.q);
    if (q) {
      const like = `%${q}%`;
      query = query.or(
        `full_name.ilike.${like},regiment.ilike.${like},unit.ilike.${like},operation.ilike.${like},place_of_action.ilike.${like},birth_state.ilike.${like},birth_district.ilike.${like}${warClause(await matchingWarIds(sb, like))}`,
      );
    }
    if (data.war) {
      const { data: w } = await sb.from("wars").select("id").eq("slug", data.war).maybeSingle();
      query = query.eq("war_id", w?.id ?? "00000000-0000-0000-0000-000000000000");
    }
    if (data.state) query = query.eq("birth_state", data.state);
    if (data.status) query = query.eq("status", data.status);
    if (data.branch) query = query.eq("service_branch", data.branch);
    if (data.award) query = query.eq("awards.name", data.award);
    if (data.decade) query = query.gte("date_of_action", `${data.decade}-01-01`).lt("date_of_action", `${data.decade + 10}-01-01`);

    if (data.sort === "name") query = query.order("full_name");
    else query = query.order("date_of_action", { ascending: data.sort !== "recent-first" });

    const { data: rows, count, error } = await query.range((page - 1) * PAGE, page * PAGE - 1);
    if (error) throw new Error(error.message);
    const items = await normaliseRecipients(sb, rows ?? []);

    // Facets come from the whole published archive so options never vanish.
    const { data: all } = await sb.from("martyrs").select("birth_state,service_branch,date_of_action,awards(name),war:wars(slug,name,start_date,period_label)");
    const facets = {
      states: [...new Set((all ?? []).map((r) => r.birth_state).filter(Boolean) as string[])].sort(),
      branches: [...new Set((all ?? []).map((r) => r.service_branch))].sort(),
      awards: AWARD_ORDER.filter((a) => (all ?? []).some((r) => (r.awards as { name: string }[]).some((x) => x.name === a))),
      wars: [...new Map((all ?? []).filter((r) => r.war).map((r) => {
        const w = r.war as unknown as { slug: string; name: string; start_date: string | null; period_label: string | null };
        return [w.slug, w] as const;
      })).values()]
        .sort((a, b) => Number((a.start_date ?? a.period_label ?? "9999").slice(0, 4)) - Number((b.start_date ?? b.period_label ?? "9999").slice(0, 4)))
        .map(({ slug, name }) => ({ slug, name })),
      decades: [...new Set((all ?? []).map((r) => r.date_of_action && Math.floor(Number(r.date_of_action.slice(0, 4)) / 10) * 10).filter(Boolean) as number[])].sort(),
    };

    const filtered = !!(q || data.war || data.state || data.status || data.branch || data.award || data.decade);
    if (filtered) {
      const { q: _q, page: _p, sort: _s, ...rest } = data;
      void _q; void _p; void _s;
      await sb.from("search_logs").insert({ query: q || "(filters)", filters: rest, results: count ?? 0 });
    }

    return { items, total: count ?? 0, page, pages: Math.max(1, Math.ceil((count ?? 0) / PAGE)), facets };
  });

export const getRecipient = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => z.object({ slug: z.string().min(1).max(120) }).parse(input))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: row, error } = await sb
      .from("martyrs")
      .select(`*,
        war:wars(slug,name,period_label,type,start_date,end_date),
        awards(name,year,posthumous,citation,citation_verbatim,gazette_ref),
        portrait:media!martyrs_portrait_media_fk(${MEDIA_COLS}),
        memorials:martyr_memorials(memorial:memorials(slug,name,city,state,hero:media!memorials_hero_media_fk(${MEDIA_COLS})))`)
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;

    const memorialList = ((row.memorials as unknown as { memorial: { slug: string; name: string; city: string | null; state: string | null; hero: RawMedia | null } | null }[]) ?? [])
      .map((m) => m.memorial)
      .filter(Boolean) as { slug: string; name: string; city: string | null; state: string | null; hero: RawMedia | null }[];
    const memHeroes = await resolveMedia(sb, memorialList.map((m) => m.hero));
    const [portrait] = await resolveMedia(sb, [row.portrait as unknown as RawMedia | null]);

    const { data: gallery } = await sb.from("media").select(MEDIA_COLS).eq("martyr_id", row.id).neq("id", row.portrait_media_id ?? "00000000-0000-0000-0000-000000000000");

    let related: RecipientSummary[] = [];
    if (row.war_id) {
      const { data: rel } = await sb.from("martyrs").select(RECIPIENT_LIST).eq("war_id", row.war_id).neq("id", row.id).order("date_of_action").limit(3);
      related = await normaliseRecipients(sb, rel ?? []);
    }

    return {
      ...row,
      sources: (row.sources as unknown as SourceRef[]) ?? [],
      awards: sortAwards((row.awards as unknown as RecipientSummary["awards"] & { citation: string | null }[]) ?? []) as unknown as {
        name: string; year: number | null; posthumous: boolean; citation: string | null; citation_verbatim: boolean; gazette_ref: string | null;
      }[],
      war: row.war as unknown as { slug: string; name: string; period_label: string | null; type: string } | null,
      portrait: portrait as MediaItem | null,
      memorials: memorialList.map((m, i) => ({ ...m, hero: memHeroes[i] as MediaItem | null })),
      gallery: (await resolveMedia(sb, (gallery ?? []) as RawMedia[])) as MediaItem[],
      related,
    };
  });

/* ------------------------------------------------------------- memorials */

export const listMemorials = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("memorials")
    .select(`slug,name,city,district,state,latitude,longitude,coords_approximate,inaugurated_year,managed_by,description,hero:media!memorials_hero_media_fk(${MEDIA_COLS}),martyr_memorials(count)`)
    .order("name");
  if (error) throw new Error(error.message);
  const heroes = await resolveMedia(sb, (data ?? []).map((m) => m.hero as RawMedia | null));
  return (data ?? []).map((m, i) => ({
    ...m,
    hero: heroes[i] as MediaItem | null,
    honoured: (m.martyr_memorials as unknown as { count: number }[])?.[0]?.count ?? 0,
  }));
});

export const getMemorial = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => z.object({ slug: z.string().min(1).max(120) }).parse(input))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: row, error } = await sb.from("memorials").select("*").eq("slug", data.slug).maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    const [{ data: gallery }, { data: links }] = await Promise.all([
      sb.from("media").select(MEDIA_COLS).eq("memorial_id", row.id),
      sb.from("martyr_memorials").select("martyr_id").eq("memorial_id", row.id),
    ]);
    const ids = (links ?? []).map((l) => l.martyr_id);
    let people: RecipientSummary[] = [];
    if (ids.length) {
      const { data: rows } = await sb.from("martyrs").select(RECIPIENT_LIST).in("id", ids).order("date_of_action");
      people = await normaliseRecipients(sb, rows ?? []);
    }
    const media = (await resolveMedia(sb, (gallery ?? []) as RawMedia[])) as MediaItem[];
    const hero = media.find((m) => m.id === row.hero_media_id) ?? media[0] ?? null;
    return { ...row, sources: (row.sources as unknown as SourceRef[]) ?? [], hero, gallery: media.filter((m) => m.id !== hero?.id), people };
  });

/* --------------------------------------------------------------- conflicts */

export const listWars = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("wars")
    .select(`slug,name,type,start_date,end_date,period_label,theatre,summary,hero:media!wars_hero_media_fk(${MEDIA_COLS}),martyrs(count)`)
    .order("start_date", { ascending: true, nullsFirst: false });
  if (error) throw new Error(error.message);
  const heroes = await resolveMedia(sb, (data ?? []).map((w) => w.hero as RawMedia | null));
  const rows = (data ?? []).map((w, i) => ({
    ...w,
    hero: heroes[i] as MediaItem | null,
    count: (w.martyrs as unknown as { count: number }[])?.[0]?.count ?? 0,
    sortYear: Number((w.start_date ?? w.period_label ?? "9999").slice(0, 4)),
  }));
  return rows.sort((a, b) => a.sortYear - b.sortYear);
});

export const getWar = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => z.object({ slug: z.string().min(1).max(120) }).parse(input))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: row, error } = await sb.from("wars").select(`*,hero:media!wars_hero_media_fk(${MEDIA_COLS})`).eq("slug", data.slug).maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    const { data: rows } = await sb.from("martyrs").select(`${RECIPIENT_LIST},id`).eq("war_id", row.id).order("date_of_action");
    const people = await normaliseRecipients(sb, rows ?? []);
    const ids = (rows ?? []).map((r) => (r as unknown as { id: string }).id);
    let memorials: { slug: string; name: string; city: string | null; state: string | null; hero: MediaItem | null }[] = [];
    if (ids.length) {
      const { data: links } = await sb.from("martyr_memorials").select(`memorial:memorials(slug,name,city,state,hero:media!memorials_hero_media_fk(${MEDIA_COLS}))`).in("martyr_id", ids);
      const uniq = new Map<string, { slug: string; name: string; city: string | null; state: string | null; hero: RawMedia | null }>();
      for (const l of links ?? []) {
        const m = l.memorial as unknown as { slug: string; name: string; city: string | null; state: string | null; hero: RawMedia | null } | null;
        if (m && m.slug !== "national-war-memorial") uniq.set(m.slug, m);
      }
      const list = [...uniq.values()];
      const heroes = await resolveMedia(sb, list.map((m) => m.hero));
      memorials = list.map((m, i) => ({ ...m, hero: heroes[i] as MediaItem | null }));
    }
    const [hero] = await resolveMedia(sb, [row.hero as unknown as RawMedia | null]);
    const { data: allWars } = await sb.from("wars").select("slug,name,start_date,period_label").order("start_date", { ascending: true, nullsFirst: false });
    const order = (allWars ?? []).sort((a, b) => Number((a.start_date ?? a.period_label ?? "9999").slice(0, 4)) - Number((b.start_date ?? b.period_label ?? "9999").slice(0, 4)));
    const idx = order.findIndex((w) => w.slug === row.slug);
    return {
      ...row,
      hero: hero as MediaItem | null,
      sources: (row.sources as unknown as SourceRef[]) ?? [],
      key_events: (row.key_events as unknown as { date: string; label: string; title: string; description: string }[]) ?? [],
      people,
      memorials,
      prev: idx > 0 ? order[idx - 1] : null,
      next: idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null,
    };
  });

/* ----------------------------------------------------------------- media */

export const listMedia = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("media")
    .select(`${MEDIA_COLS},created_at,martyr:martyrs!media_martyr_id_fkey(slug,full_name,rank),memorial:memorials!media_memorial_id_fkey(slug,name),war:wars!media_war_id_fkey(slug,name)`)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  const items = await resolveMedia(sb, (data ?? []) as unknown as RawMedia[]);
  return items as unknown as (MediaItem & {
    martyr: { slug: string; full_name: string; rank: string | null } | null;
    memorial: { slug: string; name: string } | null;
    war: { slug: string; name: string } | null;
  })[];
});

/* ---------------------------------------------------------------- search */

export const searchArchive = createServerFn({ method: "GET" })
  .inputValidator((input: { q: string }) => z.object({ q: z.string().max(80) }).parse(input))
  .handler(async ({ data }) => {
    const q = sanitizeSearch(data.q);
    if (q.length < 2) return { q, recipients: [] as RecipientSummary[], memorials: [], wars: [] };
    const sb = publicClient();
    const like = `%${q}%`;
    const warIds = await matchingWarIds(sb, like);
    const [r, m, w] = await Promise.all([
      sb.from("martyrs").select(RECIPIENT_LIST)
        .or(`full_name.ilike.${like},regiment.ilike.${like},unit.ilike.${like},operation.ilike.${like},place_of_action.ilike.${like},birth_state.ilike.${like},birth_district.ilike.${like},biography.ilike.${like}${warClause(warIds)}`)
        .order("date_of_action").limit(24),
      sb.from("memorials").select(`slug,name,city,state,hero:media!memorials_hero_media_fk(${MEDIA_COLS})`)
        .or(`name.ilike.${like},city.ilike.${like},state.ilike.${like},description.ilike.${like}`).limit(8),
      sb.from("wars").select("slug,name,period_label,summary,type")
        .or(`name.ilike.${like},theatre.ilike.${like},summary.ilike.${like},description.ilike.${like}`).limit(8),
    ]);
    const recipients = await normaliseRecipients(sb, r.data ?? []);
    const heroes = await resolveMedia(sb, (m.data ?? []).map((x) => x.hero as RawMedia | null));
    const total = recipients.length + (m.data?.length ?? 0) + (w.data?.length ?? 0);
    await sb.from("search_logs").insert({ query: q, filters: { scope: "global" }, results: total });
    return {
      q,
      recipients,
      memorials: (m.data ?? []).map((x, i) => ({ ...x, hero: heroes[i] as MediaItem | null })),
      wars: w.data ?? [],
    };
  });

/* ----------------------------------------------------------- corrections */

const correctionSchema = z.object({
  record_type: z.enum(["recipient", "memorial", "conflict", "media", "other"]),
  record_slug: z.string().trim().max(200).optional(),
  field: z.string().trim().min(1).max(60),
  details: z.string().trim().min(10, "Please describe the correction in at least 10 characters").max(4000),
  source_url: z.string().trim().url("Enter a full link, starting with https://").max(500).optional().or(z.literal("")),
  email: z.string().trim().email("Enter a valid email").max(255).optional().or(z.literal("")),
});
export type CorrectionInput = z.infer<typeof correctionSchema>;

export const submitCorrection = createServerFn({ method: "POST" })
  .inputValidator((input: CorrectionInput) => correctionSchema.parse(input))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { error } = await sb.from("corrections").insert({
      record_type: data.record_type,
      record_slug: data.record_slug || null,
      field: data.field,
      details: data.details,
      source_url: data.source_url || null,
      email: data.email || null,
    });
    if (error) throw new Error("We couldn't record your correction. Please try again.");
    return { ok: true };
  });

/* ----------------------------------------------------------------- views */

export const recordPageView = createServerFn({ method: "POST" })
  .inputValidator((input: { path: string }) => z.object({ path: z.string().min(1).max(300) }).parse(input))
  .handler(async ({ data }) => {
    if (data.path.startsWith("/admin") || data.path.startsWith("/auth")) return { ok: true };
    const sb = publicClient();
    await sb.from("page_views").insert({ path: data.path });
    return { ok: true };
  });
