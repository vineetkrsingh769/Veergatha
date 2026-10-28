import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/archive/primitives";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About & Sourcing Standard | Veergatha" },
      { name: "description", content: "Why Veergatha exists, how every record is sourced and verified, how photographs are licensed, and how survivors are distinguished from those who fell." },
      { property: "og:title", content: "About Veergatha: Sourcing & Methodology" },
      { property: "og:description", content: "How the archive sources, verifies and corrects India's gallantry records." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: About,
});

const TIERS = [
  ["Gallantry Awards Portal", "https://gallantryawards.gov.in/", "Awards, citations, unit and date of action"],
  ["e-Gazette of India", "https://egazette.gov.in/", "The legal award notification"],
  ["National War Memorial", "https://nationalwarmemorial.gov.in/", "Names inscribed at the memorial"],
  ["Press Information Bureau", "https://pib.gov.in/", "Official announcements and photographs"],
  ["Indian Army · Navy · Air Force", "https://indianarmy.nic.in/", "Unit histories and service honours"],
] as const;

function About() {
  return (
    <div>
      <PageHeader
        eyebrow="About the archive"
        title={
          <>
            <span className="font-deva text-bronze">वीरगाथा</span>: tales of bravery
          </>
        }
        intro="India's military heritage is recorded across gazette notifications, regimental histories, memorial plaques and family albums. It is scattered and largely unsearchable. Veergatha joins those records together and shows its working."
      />
      <div className="mx-auto max-w-4xl space-y-20 px-5 py-20 sm:px-8">
        <Section title="Who this is for">
          <p>
            Citizens who want to know the story behind a name; students and researchers who need to filter by conflict,
            regiment or home state and follow every fact back to its source; and families who want their relative's
            record treated accurately.
          </p>
          <p>
            The archive is educational. It publishes no classified or operationally sensitive material, takes no part in
            political debate, and carries no public comments.
          </p>
        </Section>

        <Section title="How a record is verified">
          <ol className="list-decimal space-y-3 pl-5">
            <li>The person, memorial or conflict is correctly identified.</li>
            <li>Each factual field is backed by an entry in the record's sources, naming the specific document.</li>
            <li>At least one source is primary, meaning the body with authority over the fact. This is enforced by the database itself.</li>
            <li>Any attached image has a cleared licence and a named credit.</li>
          </ol>
          <p>Records in draft or under review are never shown publicly. If a fact cannot be sourced, the field is left empty rather than guessed.</p>
          <p>
            The records now online were first compiled in October 2026 and are being re-checked against this standard.
            Where a detail is still unconfirmed, the record says so: for example, a gazette notification number is shown
            as awaiting verification until a primary copy of the gazette has been found.
          </p>
        </Section>

        <Section title="Primary sources we rely on">
          <ul className="divide-y divide-border rounded-md border border-border">
            {TIERS.map(([name, url, use]) => (
              <li key={name} className="flex flex-wrap items-baseline justify-between gap-2 p-4">
                <a href={url} target="_blank" rel="noreferrer" className="font-semibold text-foreground hover:text-bronze">
                  {name}
                </a>
                <span className="text-sm text-muted-foreground">{use}</span>
              </li>
            ))}
          </ul>
          <p>
            Newspapers, regimental association histories and published military history are secondary: useful for colour,
            never sufficient alone for a date, rank, unit or citation. Encyclopaedias and blogs are only finding aids.
          </p>
        </Section>

        <Section title="Summaries and verbatim text">
          <p>
            Citations are shown on a parchment panel, marked either as verbatim gazette text or as a summary of the
            official citation. Where only a summary is shown, the full wording can be read on the Gallantry Awards Portal.
          </p>
        </Section>

        <Section title="Those who survived">
          <p>
            Not every gallantry recipient died. Of the twenty-one Param Vir Chakra recipients, seven survived the actions
            for which they were decorated, among them Naib Subedar Bana Singh, Grenadier Yogendra Singh Yadav and Rifleman
            Sanjay Kumar. Their records are marked “Survived”, carry no date of death, and are never described in the
            language of martyrdom. The database rejects a posthumous award on a survivor's record.
          </p>
        </Section>

        <Section title="Licensing">
          <p>
            Images are used only under the Government Open Data Licence – India, Creative Commons licences, public-domain
            status or written permission, with the credit stored at upload. The bronze busts shown on profiles are
            photographs of the Param Yodha Sthal at the National War Memorial. Where no cleared portrait exists, the
            record is published without one rather than with a stand-in likeness.
          </p>
        </Section>

        <div className="flex flex-col items-start gap-4 rounded-md border border-bronze/30 bg-bronze/5 p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-3xl font-semibold">Found an error?</p>
            <p className="mt-1 text-sm text-muted-foreground">Send it with a source, and the editorial desk will review it.</p>
          </div>
          <Button asChild>
            <Link to="/corrections">Submit a correction</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-4xl font-semibold">{title}</h2>
      <div className="prose-archive mt-6 space-y-4">{children}</div>
    </section>
  );
}
