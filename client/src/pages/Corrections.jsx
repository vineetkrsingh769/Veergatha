import { useSearchParams } from "react-router-dom";

import { PageContainer, PageHeader, Section } from "../components/ui";

/**
 * STUB. Every recipient profile links here from its provenance footer, so the
 * destination has to resolve rather than 404. Night 20 builds the actual form,
 * its zod schema, the rate limiter and the submission model.
 *
 * The `record` query parameter is already carried from the profile that linked
 * here, so the real form can pre-fill which entry is being corrected.
 */
export default function Corrections() {
  const [params] = useSearchParams();
  const record = params.get("record");

  return (
    <PageContainer width="narrow">
      <PageHeader
        eyebrow="Placeholder"
        title="Submit a correction"
        subtitle="This page is a stub. The form has not been built yet, so nothing can be submitted here."
      />

      <div className="mt-8 space-y-6">
        <div className="rounded-panel border border-warning-rule bg-warning-bg p-panel">
          <p className="text-body text-warning">
            <strong className="font-semibold">Not yet accepting submissions.</strong> There is
            no form behind this page and nothing you enter would be stored.
          </p>
        </div>

        {record && (
          <p className="text-body text-muted">
            You arrived here from the record{" "}
            <code className="font-mono text-label text-accent-deep">{record}</code>. That
            reference will be carried into the form once it exists.
          </p>
        )}

        <Section title="What this will accept">
          <ul className="list-disc space-y-2 pl-5 text-body text-ink-700">
            <li>Which record needs correcting, and which field</li>
            <li>The correction itself</li>
            <li>
              The source it comes from, or your relationship to the subject — a correction
              without a source cannot be published any more than an original claim can
            </li>
            <li>Contact details, so the change can be followed up</li>
          </ul>
          <p className="max-w-measure text-body text-muted">
            Corrections are reviewed by a person before anything changes. Nothing submitted
            here will ever be published automatically.
          </p>
        </Section>
      </div>
    </PageContainer>
  );
}
