import { useEffect, useRef, useState } from "react";

/**
 * The token reference. Unlisted in NAV_ITEMS — reachable at /style-guide but
 * not advertised, because it documents the design system rather than the
 * archive.
 *
 * Swatches read their OWN resolved colour out of the browser rather than
 * repeating a hex string in this file. A hardcoded label is a fourth source of
 * truth waiting to drift; this one cannot be wrong.
 *
 * Every Tailwind class below is written out in full. Tailwind scans source text
 * for candidates, so a built string like `bg-${token}` produces no CSS at all
 * and the element renders unstyled.
 */

function toHex(computed) {
  const match = computed.match(/rgba?\(([^)]+)\)/);
  if (!match) return computed;
  const [r, g, b] = match[1].split(",").map((n) => Number(n.trim()));
  return (
    "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("").toUpperCase()
  );
}

function Swatch({ swatch, token, note }) {
  const ref = useRef(null);
  const [hex, setHex] = useState("");

  useEffect(() => {
    if (ref.current) setHex(toHex(getComputedStyle(ref.current).backgroundColor));
  }, []);

  return (
    <div className="space-y-1.5">
      <div ref={ref} className={`h-14 w-full rounded-panel border border-rule ${swatch}`} />
      <p className="font-mono text-caption text-ink">{token}</p>
      <p className="font-mono text-caption text-muted">{hex || "—"}</p>
      {note && <p className="text-caption text-muted">{note}</p>}
    </div>
  );
}

function Group({ title, hint, children, columns = 5 }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-display text-title font-bold text-tiranga-700">{title}</h2>
        {hint && <p className="mt-1 max-w-reading text-body text-muted">{hint}</p>}
      </div>
      <div className={`grid gap-4 ${columns === 4 ? "grid-cols-4" : "grid-cols-5"}`}>
        {children}
      </div>
    </section>
  );
}

function Panel({ children }) {
  return (
    <div className="divide-y divide-rule rounded-panel border border-rule-strong bg-raised">
      {children}
    </div>
  );
}

function Row({ token, size, use, children }) {
  return (
    <div className="grid grid-cols-[14rem_1fr] items-center gap-6 p-5">
      <div className="space-y-0.5">
        <p className="font-mono text-caption text-ink">{token}</p>
        <p className="font-mono text-caption text-muted">{size}</p>
        {use && <p className="text-caption text-muted">{use}</p>}
      </div>
      {children}
    </div>
  );
}

const SEMANTIC = [
  ["bg-ink", "ink", "Primary text"],
  ["bg-ink-700", "ink-700", "Secondary text"],
  ["bg-muted", "muted", "Metadata, hints"],
  ["bg-faint", "faint", "Icons and disabled only — fails AA as text"],
  ["bg-tiranga-700", "tiranga-700", "Headings"],
  ["bg-surface", "surface", "Page ground"],
  ["bg-raised", "raised", "Panels — the lightest surface allowed"],
  ["bg-sunken", "sunken", "Inset blocks, table headers"],
  ["bg-rule", "rule", "Hairline dividers"],
  ["bg-rule-strong", "rule-strong", "Panel and control borders"],
  ["bg-accent", "accent", "Saffron accent"],
  ["bg-accent-deep", "accent-deep", "Accent text and hover"],
];

const STATE = [
  ["bg-danger", "danger", "Error text"],
  ["bg-danger-bg", "danger-bg", "Error ground"],
  ["bg-danger-rule", "danger-rule", "Error border"],
  ["bg-success", "success", "Verified · survived"],
  ["bg-success-bg", "success-bg", null],
  ["bg-success-rule", "success-rule", null],
  ["bg-warning", "warning", "In review"],
  ["bg-warning-bg", "warning-bg", null],
  ["bg-warning-rule", "warning-rule", null],
];

const PARCHMENT = [
  ["bg-parchment-50", "parchment-50"],
  ["bg-parchment-100", "parchment-100"],
  ["bg-parchment-200", "parchment-200"],
  ["bg-parchment-300", "parchment-300"],
  ["bg-parchment-400", "parchment-400"],
];

const INK = [
  ["bg-ink-900", "ink-900"],
  ["bg-ink-700", "ink-700"],
  ["bg-ink-500", "ink-500"],
  ["bg-ink-300", "ink-300"],
];

const SAFFRON = [
  ["bg-saffron-50", "saffron-50"],
  ["bg-saffron-100", "saffron-100"],
  ["bg-saffron-500", "saffron-500"],
  ["bg-saffron-600", "saffron-600"],
  ["bg-saffron-700", "saffron-700"],
];

const TIRANGA = [
  ["bg-tiranga-100", "tiranga-100"],
  ["bg-tiranga-600", "tiranga-600"],
  ["bg-tiranga-700", "tiranga-700"],
  ["bg-tiranga-800", "tiranga-800"],
];

const TYPE_STEPS = [
  ["text-display", "3.25rem / 52px", "Recipient names, hero"],
  ["text-heading", "2rem / 32px", "Page titles"],
  ["text-title", "1.375rem / 22px", "Section headings"],
  ["text-prose", "1.0625rem / 17px", "Long-form reading"],
  ["text-body", "0.875rem / 14px", "Default UI text"],
  ["text-label", "0.75rem / 12px", "Labels, chips, table cells"],
  ["text-caption", "0.6875rem / 11px", "Metadata, source lines"],
];

/**
 * Sample strings carry no rank and no dates. A specimen is not a record, and an
 * invented rank on a real name is exactly the kind of fabrication the archive
 * exists to avoid.
 */
const FACES = [
  {
    face: "font-display",
    name: "Source Serif 4",
    role: "recipient names, titles, narrative prose",
    pkg: "@fontsource-variable/source-serif-4",
    weight: "variable 200–900",
    sample: "Yogendra Singh Yadav",
  },
  {
    face: "font-sans",
    name: "Inter",
    role: "UI chrome, metadata, labels, navigation",
    pkg: "@fontsource-variable/inter",
    weight: "variable 100–900",
    sample: "Param Vir Chakra · 18 Grenadiers · Operation Vijay",
  },
  {
    face: "font-mono",
    name: "IBM Plex Mono",
    role: "gazette citations and per-field source names",
    pkg: "@fontsource/ibm-plex-mono",
    weight: "static 400, 600",
    sample: "Gazette of India · No. 12-Pres/99",
  },
];

const SPACING = [
  ["w-gutter", "gutter", "2rem", "Page side padding"],
  ["w-band", "band", "2rem", "Vertical page padding"],
  ["w-panel", "panel", "1.75rem", "Inside a bordered panel"],
  ["w-stack", "stack", "1.25rem", "Between blocks in a panel"],
  ["w-section", "section", "3rem", "Between major page sections"],
];

const BANDS = [
  ["max-w-band", "80rem / 1280px", "Header, footer, standard page"],
  ["max-w-column", "64rem / 1024px", "A denser page"],
  ["max-w-feature", "56rem / 896px", "Centred feature blocks"],
  ["max-w-reading", "48rem / 768px", "Long-form measure"],
];

const RADII = [
  ["rounded-control", "0.25rem", "Inputs, buttons"],
  ["rounded-panel", "0.375rem", "Cards, bordered blocks"],
  ["rounded-frame", "0.5rem", "Images — largest allowed"],
  ["rounded-full", "pill", "Status and taxonomy pills only"],
];

export default function StyleGuide() {
  return (
    <div className="mx-auto w-full max-w-band px-gutter py-band">
      <header className="border-b border-rule-strong pb-5">
        <p className="text-caption font-bold uppercase tracking-wider text-accent">
          Design system
        </p>
        <h1 className="mt-1.5 font-display text-heading font-bold text-tiranga-700">
          Token reference
        </h1>
        <p className="mt-2 max-w-reading text-body text-muted">
          Every value the interface is allowed to use, defined once in{" "}
          <code className="font-mono text-label text-accent-deep">client/src/index.css</code>. If
          a colour, size, space or radius is not on this page, it does not belong in a
          component. The inventory of what still has to migrate onto these is in{" "}
          <code className="font-mono text-label text-accent-deep">docs/AUDIT.md</code>.
        </p>
      </header>

      <div className="mt-8 space-y-10">
        <div className="rounded-panel border border-warning-rule bg-warning-bg p-4">
          <p className="text-body text-warning">
            <strong className="font-semibold">Devanagari is not covered.</strong> None of the
            three families includes Devanagari glyphs, so the bilingual Hindi lines in the
            footer fall back to whatever the operating system supplies. Night 5 rebuilds the
            footer and is the place to decide whether to add a Devanagari face.
          </p>
        </div>

        <Group
          title="Semantic colour"
          hint="Prefer these in application code. They say what a thing is, so a palette change propagates instead of needing a second edit. A --color-x and a --text-x both generate text-x, so no semantic colour may reuse a type-scale name — which is why secondary text is ink-700 and headings are tiranga-700."
        >
          {SEMANTIC.map(([swatch, token, note]) => (
            <Swatch key={token} swatch={swatch} token={token} note={note} />
          ))}
        </Group>

        <Group
          title="State"
          hint="A text / ground / border set for each state, so a callout never needs an invented tint. Replaces the 34 rose, 15 emerald and 8 amber utilities currently in the codebase."
          columns={4}
        >
          {STATE.map(([swatch, token, note]) => (
            <Swatch key={token} swatch={swatch} token={token} note={note} />
          ))}
        </Group>

        <Group
          title="Ramp — parchment"
          hint="Surfaces and rules. Warm, because Tailwind's stone is a cool grey that reads slightly dead against a parchment ground. Never pure white."
        >
          {PARCHMENT.map(([swatch, token]) => (
            <Swatch key={token} swatch={swatch} token={token} />
          ))}
        </Group>

        <Group
          title="Ramp — ink"
          hint="Green-tinted rather than neutral black, so body text sits in the same family as the tiranga headings."
          columns={4}
        >
          {INK.map(([swatch, token]) => (
            <Swatch key={token} swatch={swatch} token={token} />
          ))}
        </Group>

        <Group title="Ramp — saffron" hint="The accent. No brass, no gold.">
          {SAFFRON.map(([swatch, token]) => (
            <Swatch key={token} swatch={swatch} token={token} />
          ))}
        </Group>

        <Group title="Ramp — tiranga" columns={4}>
          {TIRANGA.map(([swatch, token]) => (
            <Swatch key={token} swatch={swatch} token={token} />
          ))}
        </Group>

        <section className="space-y-3">
          <div>
            <h2 className="font-display text-title font-bold text-tiranga-700">
              Faces and type scale
            </h2>
            <p className="mt-1 max-w-reading text-body text-muted">
              Three roles, seven steps, each step carrying its own line height. Every face is
              self-hosted from our own origin — no third-party font request on any page view.{" "}
              <code className="font-mono text-label text-accent-deep">caption</code>{" "}
              deliberately absorbs both the 10px and 11px values used in the codebase today —
              two sizes one pixel apart is drift, not a distinction.
            </p>
          </div>

          {FACES.map(({ face, name, role, pkg, weight, sample }) => (
            <div key={face} className="space-y-2">
              <div className="flex items-baseline justify-between gap-4 pt-2">
                <h3 className="font-display text-prose font-semibold text-ink">
                  {name} <span className="text-muted">· {role}</span>
                </h3>
                <p className="font-mono text-caption text-muted">
                  {face} · {pkg} · {weight}
                </p>
              </div>
              <Panel>
                {TYPE_STEPS.map(([token, size, use]) => (
                  <Row key={token} token={token} size={size} use={use}>
                    <p className={`${token} ${face} text-ink`}>{sample}</p>
                  </Row>
                ))}
              </Panel>
            </div>
          ))}
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="font-display text-title font-bold text-tiranga-700">
              Citation specimen
            </h2>
            <p className="mt-1 max-w-reading text-body text-muted">
              Gazette text set in mono, which is what marks it as a quoted document rather
              than site prose. Night 7 builds the real component; this is the type treatment
              it will use. Citation text is reproduced verbatim, never paraphrased or
              truncated.
            </p>
          </div>
          <div className="rounded-panel border border-rule-strong bg-raised p-panel">
            <p className="text-caption font-bold uppercase tracking-wider text-accent">
              Gazette citation
            </p>
            <p className="mt-3 max-w-reading font-mono text-body text-ink">
              Specimen text, not a quotation. Real citations are reproduced word for word
              from the gazette notification and are never shortened to fit a layout, so this
              block is sized to show how a long paragraph of monospaced text wraps and flows
              at the reading measure rather than to stand in for any recipient&rsquo;s record.
            </p>
            <p className="mt-4 border-t border-rule pt-3 font-mono text-caption text-muted">
              Source line placeholder · gazette number, notification date, link
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="font-display text-title font-bold text-tiranga-700">Spacing</h2>
            <p className="mt-1 max-w-reading text-body text-muted">
              The named rhythms the page shell repeats, so a gutter is changed once rather
              than in every call site. Tailwind&rsquo;s 0.25rem step stays available for fine
              adjustment.
            </p>
          </div>
          <Panel>
            {SPACING.map(([width, token, size, use]) => (
              <Row key={token} token={token} size={size} use={use}>
                <div className={`h-5 rounded-control bg-accent ${width}`} />
              </Row>
            ))}
          </Panel>
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="font-display text-title font-bold text-tiranga-700">Content bands</h2>
            <p className="mt-1 max-w-reading text-body text-muted">
              Named by role rather than by t-shirt size, so &ldquo;the standard band&rdquo; is
              one decision instead of a <code className="font-mono text-label">max-w-7xl</code>{" "}
              repeated across six files. Each bar below is drawn at 40% of its real width.
            </p>
          </div>
          <Panel>
            {BANDS.map(([token, size, use]) => (
              <Row key={token} token={token} size={size} use={use}>
                <div
                  className="h-5 rounded-control bg-rule-strong"
                  style={{ width: `${parseFloat(size) * 0.4}rem` }}
                />
              </Row>
            ))}
          </Panel>
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="font-display text-title font-bold text-tiranga-700">Paper grain</h2>
            <p className="mt-1 max-w-reading text-body text-muted">
              An inline SVG <code className="font-mono text-label">feTurbulence</code> tiled at
              180px and 3.5% opacity, applied as the shell&rsquo;s{" "}
              <em>background-image</em> rather than as an overlay — a background cannot sit
              above text, so it cannot cost legibility. Disabled entirely under{" "}
              <code className="font-mono text-label">prefers-contrast: more</code>. The swatch
              below is the same texture at 8× normal strength, because at its real opacity
              there is nothing to photograph.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="paper-grain rounded-panel border border-rule-strong bg-surface p-panel">
              <p className="text-body text-ink">Real strength — as shipped</p>
              <p className="mt-1 text-caption text-muted">
                Should read as flat parchment at a glance.
              </p>
            </div>
            <div
              className="rounded-panel border border-rule-strong bg-surface p-panel"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='g8'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g8)' opacity='0.28'/%3E%3C/svg%3E\")",
              }}
            >
              <p className="text-body text-ink">8× — for inspection only</p>
              <p className="mt-1 text-caption text-muted">Not used anywhere in the product.</p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="font-display text-title font-bold text-tiranga-700">Radii</h2>
            <p className="mt-1 max-w-reading text-body text-muted">
              Three values, all small, plus the pill. Tailwind&rsquo;s defaults are still
              generated so nothing shifts tonight — Night 3 migrates onto these and the
              current six-value sprawl collapses.
            </p>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {RADII.map(([token, size, use]) => (
              <div key={token} className="space-y-1.5">
                <div className={`h-14 w-full border border-rule-strong bg-sunken ${token}`} />
                <p className="font-mono text-caption text-ink">{token}</p>
                <p className="font-mono text-caption text-muted">{size}</p>
                <p className="text-caption text-muted">{use}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-title font-bold text-tiranga-700">Motion</h2>
          <p className="max-w-reading text-body text-muted">
            Declared so Night 21 has one place to enforce. Nothing consumes them yet.
          </p>
          <div className="rounded-panel border border-rule-strong bg-raised p-5">
            <dl className="grid grid-cols-3 gap-4 text-caption">
              <div>
                <dt className="font-mono text-ink">--ease-archive</dt>
                <dd className="font-mono text-muted">cubic-bezier(0.2, 0, 0.2, 1)</dd>
              </div>
              <div>
                <dt className="font-mono text-ink">--duration-quick</dt>
                <dd className="font-mono text-muted">120ms · hover, focus</dd>
              </div>
              <div>
                <dt className="font-mono text-ink">--duration-calm</dt>
                <dd className="font-mono text-muted">200ms · panels, disclosure</dd>
              </div>
            </dl>
          </div>
        </section>
      </div>
    </div>
  );
}
