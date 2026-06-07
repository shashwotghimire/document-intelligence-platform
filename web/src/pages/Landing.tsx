import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoDark } from "@/components/Logo";

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
      { threshold },
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
    verb: "Add CN docs",
    detail:
      "Admins upload networking slides, notes, lab manuals, textbooks, and CSVs to one shared library.",
  },
  {
    n: "2",
    verb: "Ask",
    detail:
      "Students ask in plain English. networkGPT checks the Computer Networks material.",
  },
  {
    n: "3",
    verb: "Answer",
    detail:
      "Read grounded explanations as they stream in. The referenced source documents appear below.",
  },
];

// ─── Feature rows ─────────────────────────────────────────────────────────────

const features = [
  {
    label: "Search concepts by meaning",
    description:
      "Ask about protocols, layers, routing, congestion, or subnetting in your own words. The app answers based on course materials.",
    demo: (
      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-ink/60 p-6 font-mono text-sm">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0 rounded bg-lime/20 px-1.5 py-0.5 text-xs font-sans text-lime">
            Q
          </span>
          <span className="text-cream/80">
            Why does TCP use a three-way handshake?
          </span>
        </div>
        <div className="h-px bg-white/8" />
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0 rounded bg-white/10 px-1.5 py-0.5 text-xs font-sans text-cream/50">
            A
          </span>
          <span className="text-cream/70 leading-relaxed font-sans">
            TCP uses SYN, SYN-ACK, and ACK so both hosts can confirm
            reachability and agree on initial sequence numbers before data
            transfer.
          </span>
        </div>
        <div className="rounded-lg bg-white/5 px-3 py-2 font-sans text-xs text-cream/50">
          Referenced document: TCP_Transport_Layer.pdf
        </div>
      </div>
    ),
  },
  {
    label: "Works with common study files",
    description:
      "Upload lecture PDFs, DOCX notes, text summaries, and CSV lab outputs from the admin panel.",
    demo: (
      <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-ink/60 p-6">
        {[
          { ext: "PDF", name: "OSI_TCPIP_Layers.pdf", size: "2.4 MB" },
          {
            ext: "DOCX",
            name: "Routing_Algorithms_Notes.docx",
            size: "840 KB",
          },
          { ext: "CSV", name: "packet_capture_lab.csv", size: "120 KB" },
          { ext: "TXT", name: "subnetting_practice.txt", size: "18 KB" },
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
            <span className="shrink-0 text-xs text-cream/30 font-sans">
              {f.size}
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    label: "Curated networking knowledge base",
    description:
      "Admins can upload selected Computer Networks resources, review processing status, and remove outdated material.",
    demo: (
      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-ink/60 p-6">
        {[
          { name: "Network_Layer.pdf", status: "processed", action: "Delete" },
          { name: "DNS_HTTP_Lab.csv", status: "processed", action: "Delete" },
          {
            name: "Wireless_Networks.docx",
            status: "processing",
            action: "Wait",
          },
        ].map((doc) => (
          <div
            key={doc.name}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-lg bg-white/5 px-4 py-3 text-sm"
          >
            <span className="min-w-0 truncate text-cream/80">{doc.name}</span>
            <span className="rounded bg-white/8 px-2 py-1 text-xs text-cream/45">
              {doc.status}
            </span>
            <span className="text-xs text-cream/35">{doc.action}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    label: "Saved study sessions",
    description:
      "Students can create topic-based chats, rename them, delete them, and return to previous explanations.",
    demo: (
      <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-ink/60 p-6">
        {[
          "TCP congestion control",
          "Subnetting practice",
          "Distance vector routing",
          "DNS and HTTP review",
        ].map((chat, index) => (
          <div
            key={chat}
            className={`rounded-lg px-4 py-3 text-sm ${
              index === 0 ? "bg-lime/15 text-lime" : "bg-white/5 text-cream/65"
            }`}
          >
            {chat}
          </div>
        ))}
      </div>
    ),
  },
  {
    label: "Streaming explanations",
    description:
      "Explanations appear as they are written, so students can start reading without waiting on a blank screen.",
    demo: (
      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-ink/60 p-6 text-sm">
        <div className="self-end rounded-2xl bg-lime px-4 py-2 text-ink">
          What is the difference between TCP and UDP?
        </div>
        <div className="rounded-2xl bg-white/5 p-4 leading-relaxed text-cream/70">
          TCP provides reliable, ordered delivery with connection setup. UDP is
          connectionless and has lower overhead, but reliability is handled by
          the application
          <span className="ml-1 inline-block h-4 w-1 translate-y-0.5 bg-lime" />
        </div>
      </div>
    ),
  },
  {
    label: "Referenced sources",
    description:
      "After an answer, students can see which uploaded notes, slides, or lab documents were used.",
    demo: (
      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-ink/60 p-6 text-sm">
        <div className="rounded-lg bg-white/5 p-4 leading-relaxed text-cream/70">
          Distance vector routing shares routing tables with neighbors, while
          link state routing floods link information so each router can compute
          shortest paths.
        </div>
        <div className="border-t border-white/10 pt-3">
          <div className="mb-2 text-xs font-medium text-cream/45">
            Referenced documents
          </div>
          <div className="space-y-1 text-xs text-cream/55">
            <p>Routing_Protocols.pdf</p>
            <p>Network_Layer_Notes.docx</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    label: "Smart follow-up questions",
    description:
      "After an answer, students get suggested next questions that stay inside the uploaded Computer Networks material.",
    demo: (
      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-ink/60 p-6">
        <div className="rounded-lg bg-white/5 p-4 text-sm leading-relaxed text-cream/70">
          DNS resolves domain names by querying a hierarchy of servers, starting
          from root servers and moving toward authoritative name servers.
        </div>
        <div className="text-xs font-medium text-cream/45">
          Follow-up questions
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            "What does a recursive resolver do?",
            "How is DNS caching used?",
            "Where do authoritative servers fit?",
          ].map((question) => (
            <span
              key={question}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-cream/60"
            >
              {question}
            </span>
          ))}
        </div>
      </div>
    ),
  },
  {
    label: "User access control",
    description:
      "Admins can view registered users and block accounts only.",
    demo: (
      <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-ink/60 p-6">
        {[
          { name: "Asha Rai", role: "admin", state: "active" },
          { name: "Samir KC", role: "user", state: "active" },
          { name: "Nina Shah", role: "user", state: "blocked" },
        ].map((user) => (
          <div
            key={user.name}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-lg bg-white/5 px-4 py-3 text-sm"
          >
            <span className="min-w-0 truncate text-cream/80">{user.name}</span>
            <span className="text-xs text-cream/40">{user.role}</span>
            <span
              className={`rounded px-2 py-1 text-xs ${
                user.state === "blocked"
                  ? "bg-red-500/15 text-red-200/80"
                  : "bg-lime/15 text-lime"
              }`}
            >
              {user.state}
            </span>
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
          <a
            href="https://github.com/shashwotghimire/document-intelligence-platform"
            target="_blank"
            rel="noreferrer"
            aria-label="View source on GitHub"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-cream/70 transition-colors hover:bg-white/8 hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="size-6 fill-current"
            >
              <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.53 2.87 8.37 6.84 9.73.5.09.68-.22.68-.49l-.01-1.9c-2.78.62-3.37-1.22-3.37-1.22-.45-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.57 2.34 1.12 2.91.86.09-.66.35-1.12.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.95c.85 0 1.7.12 2.5.35 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.46.1 2.72.64.72 1.03 1.64 1.03 2.76 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9l-.01 2.8c0 .27.18.59.69.49A10.15 10.15 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" />
            </svg>
          </a>
          <a
            href="https://shashwotghimire.tech/api-docs"
            target="_blank"
            rel="noreferrer"
            className="hidden h-8 items-center rounded-lg px-3 text-sm text-cream/70 transition-colors hover:bg-white/8 hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime sm:inline-flex"
          >
            API Docs
          </a>
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
            className="max-w-5xl font-display text-5xl leading-[1.04] tracking-normal text-balance transition-all duration-700 ease-out sm:text-6xl lg:text-7xl"
            style={{
              opacity: heroIn ? 1 : 0,
              transform: heroIn ? "translateY(0)" : "translateY(24px)",
            }}
          >
            <span className="block">One place to solve your</span>
            <span className="block">
              <span className="text-lime">computer network</span> queries.
            </span>
            <span className="block">Ask networkGPT.</span>
          </h1>

          <p
            className="mt-7 max-w-[54ch] text-pretty text-base leading-7 text-cream/60 transition-all duration-700 ease-out delay-100 sm:text-lg sm:leading-8"
            style={{
              opacity: heroIn ? 1 : 0,
              transform: heroIn ? "translateY(0)" : "translateY(20px)",
            }}
          >
            Admins manage knowledge base. Users ask questions anytime. Answers
            come from the indexed files.
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
                Create account
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Link
              to="/login"
              className="h-11 inline-flex items-center rounded-lg border border-white/15 px-6 text-base text-cream/70 transition-colors hover:bg-white/8 hover:border-white/30 hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Floating screenshot cards */}
        <div
          className="relative mx-auto h-[580px] max-w-7xl px-4 md:h-[800px]"
          style={{
            opacity: heroIn ? 1 : 0,
            transform: heroIn ? "translateY(0)" : "translateY(32px)",
            transition:
              "opacity 800ms ease-out 300ms, transform 800ms cubic-bezier(0.16,1,0.3,1) 300ms",
          }}
        >
          {/* Dashboard — rotated left, behind */}
          <div
            className="absolute left-[2%] top-[4%] w-[76%] overflow-hidden rounded-2xl border border-white/10 shadow-[0_32px_80px_oklch(0_0_0/0.6)] md:left-[2%] md:w-[62%]"
            style={{ transform: "rotate(-4.5deg)", zIndex: 1 }}
          >
            <img
              src="/admin-db.png"
              alt="networkGPT admin dashboard"
              className="w-full object-cover object-top"
              loading="eager"
            />
          </div>

          {/* Chat — rotated right, in front */}
          <div
            className="absolute right-[1%] top-[12%] w-[78%] overflow-hidden rounded-2xl border border-white/10 shadow-[0_40px_100px_oklch(0_0_0/0.7)] md:right-[1%] md:w-[62%]"
            style={{ transform: "rotate(4deg)", zIndex: 2 }}
          >
            <img
              src="/chat1.png"
              alt="networkGPT chat interface"
              className="w-full object-cover object-top"
              loading="eager"
            />
          </div>

          {/* Follow-up chat — lower support card */}
          <div
            className="absolute bottom-[4%] left-1/2 w-[78%] overflow-hidden rounded-2xl border border-white/10 shadow-[0_36px_90px_oklch(0_0_0/0.68)] md:bottom-[3%] md:w-[58%]"
            style={{ transform: "translateX(-50%) rotate(-1.5deg)", zIndex: 3 }}
          >
            <img
              src="/chat2.png"
              alt="networkGPT referenced answer interface"
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
        <div ref={howItWorksReveal.ref} className="mx-auto max-w-5xl px-6">
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
            Built for Computer Networks study.
          </h2>

          <div className="mt-14 grid gap-0 md:grid-cols-3">
            {steps.map(({ n, verb, detail }, i) => (
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
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-cream">
                  {verb}
                </h3>
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
        <div ref={featuresReveal.ref} className="mx-auto max-w-5xl px-6">
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
            One place for your computer network queries.
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
      <section className="relative overflow-hidden border-t border-white/8">
        <img
          src="/hero-network.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-ink/70" />
        <div
          ref={ctaReveal.ref}
          className="relative mx-auto flex min-h-[360px] max-w-xl flex-col items-center justify-center px-6 py-28 text-center"
        >
          <h2
            className="font-display text-balance tracking-tight text-cream transition-all duration-600 ease-out"
            style={{
              fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
              letterSpacing: "-0.025em",
              opacity: ctaReveal.visible ? 1 : 0,
              transform: ctaReveal.visible
                ? "translateY(0)"
                : "translateY(20px)",
            }}
          >
            <span className="block">Stop searching through notes.</span>
            <span className="block">Ask networkGPT.</span>
          </h2>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/8 px-6 py-10 md:px-10">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <LogoDark textClassName="text-cream" />

          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-cream/50">
            <a
              href="https://github.com/shashwotghimire/document-intelligence-platform"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime"
            >
              GitHub
            </a>
            <a
              href="https://shashwotghimire.tech/api-docs"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime"
            >
              API Docs
            </a>
            <span className="text-cream/25">
              © {new Date().getFullYear()} networkGPT
            </span>
          </nav>
        </div>
      </footer>
    </div>
  );
}
