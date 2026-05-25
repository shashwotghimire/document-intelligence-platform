import type { Components } from "react-markdown";

import { cn } from "@/lib/utils";

export const customComponents: Components = {
  h1: ({ className, ...props }) => (
    <h1
      className={cn(
        "mb-3 mt-4 text-2xl font-semibold leading-tight",
        className,
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      className={cn("mb-2 mt-4 text-xl font-semibold leading-tight", className)}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      className={cn("mb-2 mt-3 text-lg font-semibold leading-tight", className)}
      {...props}
    />
  ),
  h4: ({ className, ...props }) => (
    <h4
      className={cn(
        "mb-2 mt-3 text-base font-semibold leading-tight",
        className,
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }) => (
    <p
      className={cn("my-2 leading-6 first:mt-0 last:mb-0", className)}
      {...props}
    />
  ),
  a: ({ className, ...props }) => (
    <a
      className={cn(
        "font-medium text-lime underline underline-offset-4 hover:text-lime-glow",
        className,
      )}
      target="_blank"
      rel="noreferrer"
      {...props}
    />
  ),
  ul: ({ className, ...props }) => (
    <ul className={cn("my-2 ml-5 list-disc space-y-1", className)} {...props} />
  ),
  ol: ({ className, ...props }) => (
    <ol
      className={cn("my-2 ml-5 list-decimal space-y-1", className)}
      {...props}
    />
  ),
  li: ({ className, ...props }) => (
    <li className={cn("pl-1 leading-6", className)} {...props} />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn(
        "my-3 border-l-4 border-lime/70 pl-4 text-muted-foreground italic",
        className,
      )}
      {...props}
    />
  ),
  code: ({ className, ...props }) => (
    <code
      className={cn(
        "rounded bg-muted px-1 py-0.5 font-mono text-[0.85em] text-foreground",
        className,
      )}
      {...props}
    />
  ),
  pre: ({ className, ...props }) => (
    <pre
      className={cn(
        "my-3 overflow-x-auto rounded-lg border bg-muted p-3 text-sm leading-6",
        "[&_code]:block [&_code]:rounded-none [&_code]:bg-transparent [&_code]:p-0",
        className,
      )}
      {...props}
    />
  ),
  table: ({ className, ...props }) => (
    <div className="my-3 overflow-x-auto rounded-lg border">
      <table
        className={cn("w-full border-collapse text-left text-sm", className)}
        {...props}
      />
    </div>
  ),
  thead: ({ className, ...props }) => (
    <thead className={cn("bg-muted", className)} {...props} />
  ),
  th: ({ className, ...props }) => (
    <th
      className={cn("border-b px-3 py-2 font-semibold", className)}
      {...props}
    />
  ),
  td: ({ className, ...props }) => (
    <td
      className={cn("border-b px-3 py-2 align-top last:border-b-0", className)}
      {...props}
    />
  ),
  hr: ({ className, ...props }) => (
    <hr className={cn("my-4 border-border", className)} {...props} />
  ),
  strong: ({ className, ...props }) => (
    <strong className={cn("font-semibold", className)} {...props} />
  ),
};
