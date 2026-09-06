import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMartyrs } from "../lib/api";
import { Award, Landmark, Swords, ArrowRight, Quote } from "lucide-react";
import BlurText from "../components/reactbits/BlurText";
import SpotlightCard from "../components/reactbits/SpotlightCard";

export default function Home() {
  const [kargilMartyrs, setKargilMartyrs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMartyrs({ war: "kargil-1999", limit: 4 })
      .then((data) => setKargilMartyrs(data?.martyrs || []))
      .catch(() => setKargilMartyrs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pb-20">
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-[620px] flex items-center overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-bg.jpg')" }}
        />
        {/* Soft bottom fade into page background */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/10 via-transparent to-surface" />

        <div className="relative z-10 mx-auto w-full max-w-band px-gutter">
          <div className="grid grid-cols-12 items-center gap-16 py-20">
            {/* Logo / Visual */}
            <div className="flex col-span-5 justify-start">
              <img
                src="/1.png"
                alt="Illustration of a war memorial and martyr’s portrait"
                className="max-h-[340px] w-auto object-contain drop-shadow-lg"
              />
            </div>

            {/* Content */}
            <div className="space-y-6 col-span-7">
              <div>
                <p className="text-label font-semibold tracking-[0.2em] text-accent-deep uppercase mb-3">
                  Archive of Remembrance
                </p>
                <h1 className="font-display text-display font-extrabold text-ink leading-[1.12] tracking-tight">
                  <BlurText
                    text="They Gave Their Today, For Our Tomorrow."
                    delay={100}
                    animateBy="words"
                  />
                </h1>
                <p className="text-label text-muted mt-1">
                  In honour of India’s gallantry award recipients and war martyrs.
                </p>
              </div>

              <p className="text-prose text-ink-700 leading-relaxed max-w-xl font-medium">
                A primary‑source archive of India’s gallantry award recipients and war memorials — preserving stories from gazette notifications, regimental histories, and verified records.
              </p>

              {/* Authentic Military Motto Banner – bilingual */}
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-ink/5 border border-rule-strong/80 backdrop-blur-xs max-w-xl">
                <Quote className="w-4 h-4 text-accent-deep shrink-0 opacity-80" />
                <div className="space-y-0.5">
                  <p className="text-label font-semibold text-tiranga-700 italic">
                    “Service Before Self”{" "}
                    <span className="not-italic font-normal text-muted">
                      — Motto of the Indian Army (“Seva Asmakam Dharma”)
                    </span>
                  </p>
                  <p className="text-caption text-muted">
                    सेवा आत्मकं धर्म — “सेवा ही हमारा परम धर्म है”
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  to="/martyrs"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-deep hover:bg-saffron-800 text-surface text-body font-semibold rounded-md transition-colors shadow-sm"
                >
                  Read Their Stories
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/memorials"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-raised hover:bg-sunken border border-rule-strong text-tiranga-700 text-body font-semibold rounded-md transition-colors shadow-xs"
                >
                  Visit the Memorials
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MISSION STATEMENT BLOCK – bilingual ─────────────── */}
      <section className="py-12 bg-surface border-y border-rule-strong/60 my-6">
        <div className="max-w-feature mx-auto px-gutter text-center space-y-3">
          <p className="font-display text-title text-tiranga-700 font-semibold leading-relaxed">
            “Veergatha exists to ensure that every name recorded in India’s gallantry awards and war memorials is accompanied by the verified history behind it — so that remembrance is rooted in truth.”
          </p>
          <p className="text-body text-ink-700 leading-relaxed">
            “देश के लिए कुर्बान हुए हर वीर की कहानी सच के साथ दर्ज हो — यही हमारा संकल्प है।”
          </p>
          <p className="text-caption text-accent-deep font-bold tracking-widest uppercase">
            Our Commitment to Primary Sources
          </p>
        </div>
      </section>

      {/* ─── MAIN CONTENT ─────────────────────────────────────── */}
      <div className="max-w-band mx-auto px-gutter space-y-20 mt-10">
        {/* Kargil Spotlight */}
        <section>
          <div className="flex items-end justify-between gap-4 mb-8 pb-4 border-b border-rule-strong">
            <div>
              <h2 className="font-display text-heading font-bold text-tiranga-700">
                Kargil, 1999 — Operation Vijay
              </h2>
              <p className="text-body text-muted mt-1">
                Param Vir Chakra recipients of Operation Vijay, 1999
              </p>
            </div>
            <Link
              to="/wars/kargil-1999"
              className="text-body font-medium text-accent-deep hover:text-saffron-800 inline-flex items-center gap-1.5 transition-colors"
            >
              Complete campaign dossier
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-16 text-center text-body text-muted">
              Loading Kargil records…
            </div>
          ) : kargilMartyrs.length === 0 ? (
            <div className="py-16 text-center text-body text-muted">
              No featured records available at this time. More names will be added as archives are verified.
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-5">
              {kargilMartyrs.map((martyr) => (
                <Link
                  key={martyr.id || martyr.slug}
                  to={`/martyrs/${martyr.slug}`}
                  className="group block"
                >
                  <SpotlightCard className="h-full flex flex-col justify-between p-5">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-caption font-semibold px-2 py-0.5 rounded bg-saffron-50 border border-saffron-100 text-accent-deep">
                          {martyr.awards?.[0]?.name || "Param Vir Chakra"}
                        </span>
                        <span
                          className={`text-caption font-bold uppercase tracking-wide px-2 py-0.5 rounded ${
                            martyr.status === "fell-in-action"
                              ? "bg-danger-bg border border-danger-rule text-danger"
                              : "bg-success-bg border border-success-rule text-success"
                          }`}
                        >
                          {martyr.status === "fell-in-action" ? "Fell in Action" : "Survived"}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-display text-title font-bold text-ink group-hover:text-accent-deep transition-colors leading-snug">
                          {martyr.rank} {martyr.fullName}
                        </h3>
                        <p className="text-label text-muted mt-1 font-medium">
                          {martyr.regiment}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-rule flex items-center justify-between text-label text-muted">
                      <span>{martyr.placeOfBirth?.state || "India"}</span>
                      <span className="text-accent-deep opacity-0 group-hover:opacity-100 transition-opacity">
                        View →
                      </span>
                    </div>
                  </SpotlightCard>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Navigation Cards */}
        <section>
          <div className="grid grid-cols-3 gap-6">
            <Link to="/martyrs" className="group block">
              <SpotlightCard className="h-full p-6 space-y-4">
                <Award className="w-7 h-7 text-accent-deep" strokeWidth={1.5} />
                <div>
                  <h3 className="font-display text-title font-bold text-tiranga-700 group-hover:text-accent-deep transition-colors">
                    Recipients Directory
                  </h3>
                  <p className="text-body text-muted mt-2 leading-relaxed">
                    Search by regiment, award, home state, or conflict. Each profile tells a story and cites its original source.
                  </p>
                </div>
              </SpotlightCard>
            </Link>

            <Link to="/memorials" className="group block">
              <SpotlightCard className="h-full p-6 space-y-4">
                <Landmark className="w-7 h-7 text-tiranga-600" strokeWidth={1.5} />
                <div>
                  <h3 className="font-display text-title font-bold text-tiranga-700 group-hover:text-accent-deep transition-colors">
                    War Memorials
                  </h3>
                  <p className="text-body text-muted mt-2 leading-relaxed">
                    National, state, and regimental memorials — mapped and documented.
                  </p>
                </div>
              </SpotlightCard>
            </Link>

            <Link to="/wars" className="group block">
              <SpotlightCard className="h-full p-6 space-y-4">
                <Swords className="w-7 h-7 text-accent-deep" strokeWidth={1.5} />
                <div>
                  <h3 className="font-display text-title font-bold text-tiranga-700 group-hover:text-accent-deep transition-colors">
                    Conflicts & Operations
                  </h3>
                  <p className="text-body text-muted mt-2 leading-relaxed">
                    Post‑Independence operations, linked to the individuals who served.
                  </p>
                </div>
              </SpotlightCard>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
