# Sourcing & verification workflow

The project has one hard content rule: **no dummy data.** Every published claim traces to a
source a stranger can check. This document is how that rule is operationalised.

## The standard

A record may be set to `verification.status: 'verified'` only when **all** of these hold:

1. The person, memorial or conflict is correctly identified.
2. Each factual field has an entry in the record's `sources` array naming the specific
   document it came from — not a general reading list.
3. At least one source is `tier: 'primary'`. *(Enforced by the schema.)*
4. Any attached image has a `license` other than `unverified`. *(Enforced by the schema.)*
5. A second person has read it. Working alone, read it again on a different day — the point
   is the gap, not the second pair of eyes.

Anything short of that stays `draft` or `in-review`. Both are invisible to the public API.

## Source tiers

**Primary** — the record itself, produced by the body with authority over the fact.

| Source | Good for |
|---|---|
| [gallantryawards.gov.in](https://gallantryawards.gov.in) | Award, citation text, unit, date of action |
| [egazette.gov.in](https://egazette.gov.in) | The legal award notification → `gazetteRef` |
| [pib.gov.in](https://pib.gov.in) | Announcements, ceremonies, official photographs |
| [nationalwarmemorial.gov.in](https://nationalwarmemorial.gov.in) | Names inscribed at NWM |
| indianarmy.nic.in / indiannavy.nic.in / indianairforce.nic.in | Unit histories, service honours |
| [asi.nic.in](https://asi.nic.in) | Protected-monument status for memorials |
| State war memorial trusts | State rolls of honour; often the only source for non-award casualties |

**Secondary** — reporting *about* the record. Good for narrative colour and for locating the
primary source. Never sufficient alone for a date, rank, unit or citation.

The Hindu / Indian Express / Times of India archives, regimental association histories,
published military history, museum catalogues.

**Finding aids** — Wikipedia, blogs, social media, aggregators.

Use them to discover *that* a fact exists, then fetch and cite the primary.
**Never log a Wikipedia URL as `tier: 'primary'`.** Its own citations are the useful part.

## Per-record workflow

1. **Identify** the subject from [CANDIDATES.md](./CANDIDATES.md).
2. **Pull the citation** from gallantryawards.gov.in. Transcribe it verbatim into
   `awards[].citation` — do not paraphrase, summarise or modernise. It is a quoted
   historical document.
3. **Find the gazette reference.** This is what makes the citation checkable.
4. **Fill biographical fields, logging a `sources` entry per field as you go** — not at the
   end. Retro-fitting attribution is where errors get laundered into the record.
5. **Write the biography in your own words** from the sourced facts. Never copy prose from a
   news article or Wikipedia — that is both a licensing and an accuracy problem.
6. **Attach media** only after clearing the licence.
7. **Set `in-review`.** Read it cold later, then `verified`.

If a fact cannot be sourced, **leave the field empty.** An empty `hometown` is a gap. A
guessed `hometown` is a fabrication that anyone citing you will repeat.

## Image licensing

Clear the licence of the *file*, not the page it sits on. An openly licensed article can
contain an all-rights-reserved photograph.

| Situation | `license` | Use it? |
|---|---|---|
| PIB photo release, Government of India | `GODL-India` | Yes, with attribution |
| data.gov.in / ministry open data | `GODL-India` | Yes, with attribution |
| Wikimedia Commons, CC-BY or CC-BY-SA | `CC-BY` / `CC-BY-SA` | Yes — copy the exact attribution string from the file page |
| Wikimedia Commons marked "fair use" | — | **No** |
| Out of copyright by age | `public-domain` | Yes, but record why it qualifies |
| Written permission from family or regiment | `permission-granted` | Yes — save the email |
| Newspaper or agency photo (PTI, ANI, Getty, Reuters) | — | **No** |
| Found via image search, origin unclear | `unverified` | **No** — this is what the enum blocks |

GODL-India requires attribution and forbids implying government endorsement. Store the
attribution in `Media.credit` **at upload time**; a credit reconstructed weeks later will be
wrong. The schema enforces this — `GODL-India`, `CC-BY` and `CC-BY-SA` all require a credit.

Where no usable portrait exists, **ship the record without one.** A generic soldier
illustration standing in for a named individual is exactly the dummy data this project rules
out — the abandoned v1 did this and had to disclaim on its own About page that the artwork
was not of the people named.

## Editorial conventions

Decide once, apply everywhere, or the search facets fragment.

**Rank** — record the rank held *at the time of the action*, which is what the citation
states. Note posthumous promotions in the biography, not the `rank` field.

**Names** — Indian names romanise several ways ("Hameed"/"Hamid", "Nirmal Jit"/"Nirmaljit").
Follow the gallantry portal's spelling as canonical; mention a common variant in the first
line of the biography so search finds it.

**Unit designations** — follow the citation exactly. Use the expanded form for display
("13 Jammu &amp; Kashmir Rifles"), keep the abbreviation in the biography.

**Dates** — store as `Date`, display day-month-year. Where only a year is known, leave the
date null and state the year in prose rather than inventing 1 January.

**Recipients who survived** — Bana Singh, Yogendra Singh Yadav and Sanjay Kumar were
decorated for actions they lived through. Their records carry `status: 'survived'`, no
`dateOfMartyrdom`, and **must never** be rendered with martyrdom language or memorial
framing. In the client, all status wording routes through `STATUS_LABELS` and the
`StatusBadge` component, and an unrecognised status renders neutrally rather than defaulting
to "Fell in Action". Guard any "fell", "sacrifice" or death-date copy on
`isPosthumous(martyr)`. Getting this wrong is the single most damaging mistake this project
can make.

**Living people generally** — stick to the public record of their service. No addresses, no
family details beyond what published citations contain.

## Definition of done — recipient record

- [ ] Name, rank, unit, service branch — from the citation
- [ ] Award name, year, posthumous flag, verbatim citation, gazette reference
- [ ] `status` set, with `dateOfMartyrdom` present iff `fell-in-action`
- [ ] Conflict linked; `operation` set where applicable
- [ ] Memorials linked (check NWM plus state and regimental memorials)
- [ ] Biography in original prose, from sourced facts
- [ ] A `sources` entry for every populated factual field, at least one primary
- [ ] Portrait with a cleared licence and credit, or deliberately absent
- [ ] Read cold on a second day, then `verified`
