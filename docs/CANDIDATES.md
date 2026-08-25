# Content candidates — verification worklist

> **Nothing here is verified.** This is a list of *names to research*, not facts. No cell
> below may be entered into the database until traced to a primary source and logged in the
> record's `sources` array — including spellings, ranks and unit designations. See
> [SOURCING.md](./SOURCING.md).

## Seeded so far

Four Kargil Param Vir Chakra recipients are live in Atlas (`npm run db:seed`), along with
the Kargil War conflict and two memorials. **Zero media** — no portrait has a cleared
licence yet.

| Name | Rank | Unit | Status | Record |
|---|---|---|---|---|
| Vikram Batra | Captain | 13 JAK Rifles | fell-in-action | ✅ seeded |
| Manoj Kumar Pandey | Lieutenant | 1/11 Gorkha Rifles | fell-in-action | ✅ seeded |
| Yogendra Singh Yadav | Grenadier | 18 Grenadiers | **survived** | ✅ seeded |
| Sanjay Kumar | Rifleman | 13 JAK Rifles | **survived** | ✅ seeded |

Yadav and Sanjay Kumar survived their actions. Their records must never carry martyrdom
language — see the editorial conventions in [SOURCING.md](./SOURCING.md#editorial-conventions).

Still outstanding on all four: verbatim citations, gazette references, dates of birth,
hometowns, and licensed portraits.

## Remaining PVC recipients

| Name | Rank | Unit | Conflict |
|---|---|---|---|
| Somnath Sharma | Major | 4 Kumaon | Indo-Pak 1947–48 |
| Jadunath Singh | Naik | 1 Rajput | Indo-Pak 1947–48 |
| Rama Raghoba Rane | 2nd Lieutenant | Bombay Sappers | Indo-Pak 1947–48 |
| Piru Singh | CHM | 6 Rajputana Rifles | Indo-Pak 1947–48 |
| Karam Singh | Lance Naik | 1 Sikh | Indo-Pak 1947–48 |
| Gurbachan Singh Salaria | Captain | 3/1 Gorkha Rifles | ONUC, Congo 1961 |
| Dhan Singh Thapa | Major | 1/8 Gorkha Rifles | Sino-Indian 1962 |
| Joginder Singh | Subedar | 1 Sikh | Sino-Indian 1962 |
| Shaitan Singh | Major | 13 Kumaon | Sino-Indian 1962 |
| Abdul Hamid | CQMH | 4 Grenadiers | Indo-Pak 1965 |
| Ardeshir Burzorji Tarapore | Lt Colonel | 17 Poona Horse | Indo-Pak 1965 |
| Albert Ekka | Lance Naik | 14 Guards | Indo-Pak 1971 |
| Nirmal Jit Singh Sekhon | Flying Officer | No. 18 Sqn, IAF | Indo-Pak 1971 |
| Arun Khetarpal | 2nd Lieutenant | 17 Poona Horse | Indo-Pak 1971 |
| Hoshiar Singh | Major | 3 Grenadiers | Indo-Pak 1971 |
| Bana Singh | Naib Subedar | 8 JAK LI | Op Meghdoot 1987 — **survived** |
| Ramaswamy Parameshwaran | Major | 8 Mahar | IPKF, Sri Lanka 1987 |

**Salaria's conflict is not an India–Pakistan war.** He was decorated for action with the UN
Operation in the Congo (ONUC), so the `War` collection needs an entry of type
`peacekeeping`. Verify before entering.

## Memorials

| Name | Location | Notes |
|---|---|---|
| National War Memorial | New Delhi | ✅ seeded. Primary source for names; ~26,000 inscribed |
| Kargil War Memorial | Dras, Ladakh | ✅ seeded. Army-managed |
| India Gate | New Delhi | WWI / Third Anglo-Afghan War; ASI-protected |
| Rezang La War Memorial | Chushul, Ladakh | 13 Kumaon, 1962 |
| Tawang War Memorial | Tawang, Arunachal Pradesh | 1962 |
| Longewala War Memorial | Longewala, Rajasthan | 1971 |
| Chandigarh War Memorial | Chandigarh | State-managed |
| IMA War Memorial | Dehradun | Regimental / academy |

Each needs GeoJSON coordinates `[lng, lat]`, a managing body, and an image with a confirmed
licence. Coordinates unlock `/api/memorials/near`.

## Conflicts

| Name | Years | Type | Record |
|---|---|---|---|
| Kargil War (Operation Vijay) | 1999 | war | ✅ seeded |
| Indo-Pakistani War of 1947–48 | 1947–1948 | war | |
| Sino-Indian War | 1962 | war | |
| Indo-Pakistani War of 1965 | 1965 | war | |
| Indo-Pakistani War of 1971 | 1971 | war | |
| Operation Meghdoot (Siachen) | 1984– | operation | |
| IPKF Operations, Sri Lanka | 1987–1990 | peacekeeping | |
| ONUC, Congo | 1960–1964 | peacekeeping | |

## Suggested order

Finish the four Kargil records completely — citation, gazette ref, dates, licensed portrait
— before adding a fifth name. A complete vertical slice demos better and verifies faster
than thin coverage across seven conflicts.
