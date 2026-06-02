import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, FileText, MessageSquare, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoDark } from "@/components/Logo";

// ─── Logo mark ──────────────────────────────────────────────────────────────

function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <div
      className="relative flex items-center justify-center rounded-full bg-lime"
      style={{ width: size, height: size }}
    >
      <div
        className="rounded-full bg-ink"
        style={{ width: size * 0.43, height: size * 0.43 }}
      />
    </div>
  );
}

// ─── Reveal hook (IntersectionObserver, respects reduced-motion) ─────────────

function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

// ─── How it works steps ──────────────────────────────────────────────────────

const steps = [
  {
    n: "1",
    verb: "Upload",
    Icon: FileText,
    detail:
      "Drop in a PDF, Word doc, CSV, or plain text file. documentGPT indexes it in seconds.",
  },
  {
    n: "2",
    verb: "Ask",
    Icon: Search,
    detail:
      "Type a question in plain language. The search finds the relevant passages, not just keyword matches.",
  },
  {
    n: "3",
    verb: "Read",
    Icon: MessageSquare,
    detail:
      "Get a direct answer with the source passages cited, so you can verify everything.",
  },
];

// ─── Feature rows ─────────────────────────────────────────────────────────────

const features = [
  {
    label: "Semantic search",
    description:
      "Queries match meaning, not just words. Ask 'What are the termination clauses?' against a 200-page contract and get the right paragraphs back.",
    demo: (
      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-ink/60 p-6 font-mono text-sm">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0 rounded bg-lime/20 px-1.5 py-0.5 text-xs font-sans text-lime">
            Q
          </span>
          <span className="text-cream/80">What are the payment terms?</span>
        </div>
        <div className="h-px bg-white/8" />
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0 rounded bg-white/10 px-1.5 py-0.5 text-xs font-sans text-cream/50">
            A
          </span>
          <span className="text-cream/70 leading-relaxed font-sans">
            Per Section 4.2, invoices are due net-30 from the date of delivery.
            Late payments accrue interest at 1.5% per month.{" "}
            <span className="text-lime/80 text-xs">[p. 14]</span>
          </span>
        </div>
      </div>
    ),
  },
  {
    label: "Multiple document types",
    description:
      "PDF contracts, Word reports, CSV exports, and plain text all parse cleanly. No reformatting, no copy-pasting into a chat window.",
    demo: (
      <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-ink/60 p-6">
        {[
          { ext: "PDF", name: "Q4_Contract_v3.pdf", size: "2.4 MB" },
          { ext: "DOCX", name: "Research_Summary.docx", size: "840 KB" },
          { ext: "CSV", name: "financials_2024.csv", size: "120 KB" },
          { ext: "TXT", name: "meeting_notes.txt", size: "18 KB" },
        ].map((f) => (
          <div
            key={f.name}
            className="flex items-center gap-3 rounded-lg bg-white/5 px-4 py-3"
          >
            <span className="shrink-0 rounded bg-lime/20 px-1.5 py-0.5 font-mono text-xs text-lime">
              {f.ext}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm text-cream/80 font-sans">
              {f.name}
            </span>
            <span className="shrink-0 text-xs text-cream/30 font-sans">{f.size}</span>
          </div>
        ))}
      </div>
    ),
  },
];

// ─── Landing ─────────────────────────────────────────────────────────────────

export default function Landing() {
  // Hero entrance: animate in after mount
  const [heroIn, setHeroIn] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setHeroIn(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const howItWorksReveal = useReveal();
  const featuresReveal = useReveal();
  const ctaReveal = useReveal();

  return (
    <div className="min-h-screen bg-ink text-cream selection:bg-lime/30">
      {/* ── Nav ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 flex h-16 items-center border-b border-white/8 bg-ink/90 px-6 backdrop-blur-md md:px-10">
        <LogoDark textClassName="text-cream" />

        <nav className="ml-auto flex items-center gap-2">
          <Link
            to="/login"
            className="px-3 py-1.5 text-sm text-cream/70 transition-colors hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime rounded-sm"
          >
            Sign in
          </Link>
          <Button
            asChild
            className="h-8 rounded-lg bg-lime px-4 text-sm font-medium text-ink border-0 [&]:hover:bg-lime/80 [a]:hover:bg-lime/80"
          >
            <Link to="/register">Create account</Link>
          </Button>
        </nav>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Ambient lime glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div className="h-[700px] w-[700px] rounded-full bg-lime/10 blur-[140px]" />
        </div>

        {/* Heading + CTAs */}
        <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 pb-20 pt-24 text-center md:pb-24 md:pt-32">
          <h1
            className="font-display text-balance leading-[1.08] tracking-tight transition-all duration-700 ease-out"
            style={{
              fontSize: "clamp(2.6rem, 6.5vw, 5rem)",
              letterSpacing: "-0.03em",
              opacity: heroIn ? 1 : 0,
              transform: heroIn ? "translateY(0)" : "translateY(24px)",
            }}
          >
            Ask questions.
            <br />
            <span className="text-lime">Get answers</span> from your documents.
          </h1>

          <p
            className="mt-6 max-w-[52ch] text-pretty text-lg leading-relaxed text-cream/60 transition-all duration-700 ease-out delay-100"
            style={{
              opacity: heroIn ? 1 : 0,
              transform: heroIn ? "translateY(0)" : "translateY(20px)",
            }}
          >
            Upload a PDF, Word doc, or CSV. Type a question. documentGPT finds
            the relevant passages and gives you a sourced answer in seconds.
          </p>

          <div
            className="mt-10 flex flex-wrap items-center justify-center gap-3 transition-all duration-700 ease-out delay-200"
            style={{
              opacity: heroIn ? 1 : 0,
              transform: heroIn ? "translateY(0)" : "translateY(16px)",
            }}
          >
            <Button
              asChild
              className="h-11 rounded-lg bg-lime px-6 text-base font-medium text-ink border-0 gap-2 [&]:hover:bg-lime/80 [a]:hover:bg-lime/80"
            >
              <Link to="/register">
                Start for free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Link
              to="/login"
              className="h-11 inline-flex items-center rounded-lg border border-white/15 px-6 text-base text-cream/70 transition-colors hover:bg-white/8 hover:border-white/30 hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime"
            >
              Sign in to your workspace
            </Link>
          </div>
        </div>

        {/* Floating screenshot cards */}
        <div
          className="relative mx-auto h-[500px] max-w-6xl px-4 md:h-[660px]"
          style={{
            opacity: heroIn ? 1 : 0,
            transform: heroIn ? "translateY(0)" : "translateY(32px)",
            transition: "opacity 800ms ease-out 300ms, transform 800ms cubic-bezier(0.16,1,0.3,1) 300ms",
          }}
        >
          {/* Dashboard — rotated left, behind */}
          <div
            className="absolute left-[2%] top-[4%] w-[68%] overflow-hidden rounded-2xl border border-white/10 shadow-[0_32px_80px_oklch(0_0_0/0.6)] md:left-[3%] md:w-[64%]"
            style={{ transform: "rotate(-4.5deg)", zIndex: 1 }}
          >
            <img
              src="/dashbaord.png"
              alt="documentGPT admin dashboard"
              className="w-full object-cover object-top"
              loading="eager"
            />
          </div>

          {/* Chat — rotated right, in front */}
          <div
            className="absolute right-[2%] top-[10%] w-[68%] overflow-hidden rounded-2xl border border-white/10 shadow-[0_40px_100px_oklch(0_0_0/0.7)] md:right-[3%] md:w-[64%]"
            style={{ transform: "rotate(4deg)", zIndex: 2 }}
          >
            <img
              src="/chats.png"
              alt="documentGPT chat interface"
              className="w-full object-cover object-top"
              loading="eager"
            />
          </div>

          {/* Lime glow between cards */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            style={{ zIndex: 0 }}
          >
            <div className="h-80 w-80 rounded-full bg-lime/12 blur-[100px]" />
          </div>
        </div>

        {/* Bottom fade into next section */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-ink to-transparent"
        />
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="border-t border-white/8 py-24">
        <div
          ref={howItWorksReveal.ref}
          className="mx-auto max-w-5xl px-6"
        >
          <h2
            className="font-display text-balance tracking-tight text-cream transition-all duration-600 ease-out"
            style={{
              fontSize: "clamp(1.8rem, 3.5vw, 2.75rem)",
              letterSpacing: "-0.025em",
              opacity: howItWorksReveal.visible ? 1 : 0,
              transform: howItWorksReveal.visible
                ? "translateY(0)"
                : "translateY(20px)",
            }}
          >
            Three steps, no training required.
          </h2>

          <div className="mt-14 grid gap-0 md:grid-cols-3">
            {steps.map(({ n, verb, Icon, detail }, i) => (
              <div
                key={n}
                className="relative flex flex-col gap-4 border-t border-white/10 pt-8 pb-8 md:border-t-0 md:border-l md:border-white/10 md:px-10 md:first:border-l-0 md:first:pl-0"
                style={{
                  transitionProperty: "opacity, transform",
                  transitionDuration: "600ms",
                  transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
                  transitionDelay: `${i * 100}ms`,
                  opacity: howItWorksReveal.visible ? 1 : 0,
                  transform: howItWorksReveal.visible
                    ? "translateY(0)"
                    : "translateY(18px)",
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="font-serif text-4xl font-bold text-cream/15 leading-none">
                    {n}
                  </span>
                  <Icon className="size-5 text-cream/40" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-cream">{verb}</h3>
                <p className="text-pretty text-sm leading-relaxed text-cream/50 max-w-[30ch]">
                  {detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="border-t border-white/8 py-24">
        <div
          ref={featuresReveal.ref}
          className="mx-auto max-w-5xl px-6"
        >
          <h2
            className="font-display text-balance tracking-tight transition-all duration-600 ease-out"
            style={{
              fontSize: "clamp(1.8rem, 3.5vw, 2.75rem)",
              letterSpacing: "-0.025em",
              opacity: featuresReveal.visible ? 1 : 0,
              transform: featuresReveal.visible
                ? "translateY(0)"
                : "translateY(20px)",
            }}
          >
            Built for documents that actually matter.
          </h2>

          <div className="mt-16 flex flex-col gap-20">
            {features.map(({ label, description, demo }, i) => (
              <div
                key={label}
                className="grid gap-10 md:grid-cols-2 md:items-center"
                style={{
                  transitionProperty: "opacity, transform",
                  transitionDuration: "700ms",
                  transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
                  transitionDelay: `${i * 120}ms`,
                  opacity: featuresReveal.visible ? 1 : 0,
                  transform: featuresReveal.visible
                    ? "translateY(0)"
                    : "translateY(24px)",
                }}
              >
                {/* Text — alternates sides */}
                <div
                  className={`flex flex-col gap-4 ${i % 2 === 1 ? "md:order-2" : ""}`}
                >
                  <h3 className="text-2xl font-semibold tracking-tight text-cream">
                    {label}
                  </h3>
                  <p className="text-pretty leading-relaxed text-cream/60 max-w-[40ch]">
                    {description}
                  </p>
                </div>
                {/* Demo panel */}
                <div className={i % 2 === 1 ? "md:order-1" : ""}>{demo}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA close ────────────────────────────────────────────────────── */}
      <section className="border-t border-white/8 py-28">
        <div
          ref={ctaReveal.ref}
          className="mx-auto flex max-w-xl flex-col items-center gap-8 px-6 text-center"
        >
          <LogoMark size={40} />
          <h2
            className="font-display text-balance tracking-tight text-cream transition-all duration-600 ease-out"
            style={{
              fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
              letterSpacing: "-0.025em",
              opacity: ctaReveal.visible ? 1 : 0,
              transform: ctaReveal.visible ? "translateY(0)" : "translateY(20px)",
            }}
          >
            Your documents have answers. Start finding them.
          </h2>
          <div
            className="flex flex-wrap items-center justify-center gap-3 transition-all duration-600 ease-out delay-150"
            style={{
              opacity: ctaReveal.visible ? 1 : 0,
              transform: ctaReveal.visible ? "translateY(0)" : "translateY(12px)",
            }}
          >
            <Button
              asChild
              className="h-11 rounded-lg bg-lime px-6 text-base font-medium text-ink border-0 gap-2 [&]:hover:bg-lime/80 [a]:hover:bg-lime/80"
            >
              <Link to="/register">
                Create free account
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/8 px-6 py-10 md:px-10">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <LogoDark textClassName="text-cream" />

          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-cream/50">
            <Link
              to="/login"
              className="hover:text-cream transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime rounded-sm"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="hover:text-cream transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime rounded-sm"
            >
              Create account
            </Link>
            <span className="text-cream/25">
              © {new Date().getFullYear()} documentGPT
            </span>
          </nav>
        </div>
      </footer>
    </div>
  );
}
