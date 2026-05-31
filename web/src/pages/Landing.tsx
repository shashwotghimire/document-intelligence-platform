import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Database,
  FileText,
  LockKeyhole,
  MessageSquareText,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

const workflow = [
  {
    title: "Upload knowledge",
    description:
      "Admins add PDFs, DOCX files, text files, and CSVs to one searchable workspace.",
    icon: FileText,
  },
  {
    title: "Retrieve context",
    description:
      "Questions are matched against indexed document chunks before an answer is written.",
    icon: Search,
  },
  {
    title: "Answer with sources",
    description:
      "The assistant responds in chat and keeps referenced documents close to the answer.",
    icon: MessageSquareText,
  },
];

const signals = [
  "Grounded chat",
  "Role-based access",
  "Document citations",
  "Streaming answers",
];

function Landing() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <section className="relative isolate flex min-h-[82dvh] flex-col overflow-hidden bg-ink text-white">
        <img
          src="/hero-docs.jpg"
          alt="Documents connected by an intelligence graph"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 -z-10 bg-black/65" />

        <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
          <Link
            to="/"
            aria-label="documentGPT home"
            className="flex min-h-11 items-center gap-3"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-lime text-ink">
              <span className="size-2.5 rounded-full bg-ink" />
            </span>
            <span className="text-xl font-semibold">documentGPT</span>
          </Link>

          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-6 text-sm text-white/75 md:flex"
          >
            <a
              href="#workflow"
              className="flex min-h-11 items-center transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime"
            >
              Workflow
            </a>
            <a
              href="#trust"
              className="flex min-h-11 items-center transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime"
            >
              Trust
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              className="hidden h-11 px-4 text-white hover:bg-white/10 hover:text-white sm:inline-flex"
            >
              <Link to="/login">Sign in</Link>
            </Button>
            <Button
              asChild
              className="h-11 bg-lime px-5 text-ink hover:bg-lime/90"
            >
              <Link to="/register">
                Start
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-7xl flex-1 items-center px-5 pb-16 pt-10 sm:px-8 lg:px-10">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex min-h-9 items-center rounded-full border border-white/20 bg-white/10 px-4 text-sm font-medium text-white/90">
              Private document intelligence for focused teams
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] sm:text-6xl lg:text-7xl">
              documentGPT
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75 sm:text-xl">
              Ask precise questions across uploaded documents and get grounded
              answers from the knowledge your team actually controls.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                className="h-12 bg-lime px-6 text-base text-ink hover:bg-lime/90"
              >
                <Link to="/register">
                  Create account
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 border-white/25 bg-white/10 px-6 text-base text-white hover:bg-white/15 hover:text-white"
              >
                <Link to="/login">Open workspace</Link>
              </Button>
            </div>

            <dl className="mt-10 grid max-w-2xl grid-cols-2 gap-3 text-sm text-white/75 sm:grid-cols-4">
              {signals.map((signal) => (
                <div
                  key={signal}
                  className="border-l border-lime/70 pl-3"
                >
                  <dt className="sr-only">Capability</dt>
                  <dd>{signal}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section
        id="workflow"
        className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.75fr_1.25fr] lg:px-10 lg:py-18"
      >
        <div>
          <p className="text-sm font-semibold text-muted-foreground">
            From file to answer
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
            A lean path from shared documents to reliable responses.
          </h2>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {workflow.map(({ title, description, icon: Icon }) => (
            <article
              key={title}
              className="rounded-lg border bg-card p-5 shadow-soft"
            >
              <div className="mb-5 flex size-11 items-center justify-center rounded-lg bg-secondary text-foreground">
                <Icon aria-hidden="true" className="size-5" />
              </div>
              <h3 className="text-base font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="trust"
        className="border-y bg-ink px-5 py-12 text-cream sm:px-8 lg:px-10"
      >
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
          <div className="flex gap-4">
            <Database aria-hidden="true" className="mt-1 size-5 text-lime" />
            <div>
              <h2 className="font-semibold">Built for retrieval</h2>
              <p className="mt-2 text-sm leading-6 text-cream/70">
                Embeddings and vector search keep responses tied to indexed
                document context.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Bot aria-hidden="true" className="mt-1 size-5 text-lime" />
            <div>
              <h2 className="font-semibold">Designed for chat</h2>
              <p className="mt-2 text-sm leading-6 text-cream/70">
                Streaming answers, markdown support, and follow-up prompts make
                investigation feel direct.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <LockKeyhole
              aria-hidden="true"
              className="mt-1 size-5 text-lime"
            />
            <div>
              <h2 className="font-semibold">Access-aware</h2>
              <p className="mt-2 text-sm leading-6 text-cream/70">
                Admin and user routes separate document management from the
                daily chat workspace.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-lg border bg-card p-6 shadow-soft md:flex-row md:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CheckCircle2 aria-hidden="true" className="size-4 text-lime" />
              Ready for your document workspace
            </div>
            <h2 className="text-2xl font-semibold">
              Start asking better questions of every file.
            </h2>
          </div>
          <Button asChild className="h-11 px-5">
            <Link to="/register">
              Get started
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

export default Landing;
