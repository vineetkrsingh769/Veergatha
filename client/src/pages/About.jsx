import { PageContainer, PageHeader, Section } from "../components/ui";

/**
 * STUB. The header links here, so the route has to exist rather than 404 — but
 * the real page is Night 17's job.
 *
 * The content is not invented here on purpose. docs/SOURCING.md already holds
 * the verification standard, the source tier system, the named government
 * sources and the image licensing rules. Night 17 draws the page from that
 * document. Writing placeholder claims about how the archive is sourced would
 * be exactly the kind of fabrication the archive exists to avoid.
 */
export default function About() {
  return (
    <PageContainer width="narrow">
      <PageHeader
        eyebrow="Placeholder"
        title="About & Methodology"
        subtitle="This page is a stub. It is linked from the header so the route resolves, but it has not been written yet."
      />

      <div className="mt-8 space-y-6">
        <div className="rounded-panel border border-warning-rule bg-warning-bg p-panel">
          <p className="text-body text-warning">
            <strong className="font-semibold">Not yet written.</strong> Nothing on this page
            should be treated as a statement about how Veergatha is sourced or verified.
          </p>
        </div>

        <Section title="What will go here">
          <ul className="list-disc space-y-2 pl-5 text-body text-ink-700">
            <li>What Veergatha is, and why it exists</li>
            <li>
              Sourcing — gallantryawards.gov.in, the Gazette of India, PIB, the National War
              Memorial, and the service websites
            </li>
            <li>
              The verification standard, including that a record cannot be published without
              at least one primary source
            </li>
            <li>Known gaps, stated plainly</li>
            <li>How to submit a correction or additional material</li>
            <li>Attribution and terms of reuse</li>
          </ul>
          <p className="text-body text-muted">
            The material for all of this already exists in{" "}
            <code className="font-mono text-label text-accent-deep">docs/SOURCING.md</code>.
          </p>
        </Section>
      </div>
    </PageContainer>
  );
}
