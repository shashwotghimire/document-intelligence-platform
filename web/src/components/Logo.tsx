import { Link } from "react-router-dom";

export const Logo = ({ to = "/chat" }: { to?: string }) => {
  return (
    <Link
      to={to}
      aria-label={to === "/" ? "Go to homepage" : "Go to chat"}
      className="flex items-center gap-3"
    >
      <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-lime-400">
        <div className="h-3 w-3 rounded-full bg-black" />
      </div>

      <div className="flex items-end gap-1">
        <span className="font-serif text-2xl font-bold tracking-tight text-white">
          documentGPT
        </span>

        <span className="mb-1.5 h-1 w-1 rounded-full bg-lime-400" />
      </div>
    </Link>
  );
};

export const LogoDark = ({ textClassName = "text-black" }: { textClassName?: string }) => {
  return (
    <Link
      to="/chat"
      aria-label="Go to chat"
      className="flex items-center gap-3 p-1.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:p-0"
    >
      <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-lime-400">
        <div className="h-3 w-3 rounded-full bg-black" />
      </div>

      <div className="flex items-end gap-1 group-data-[collapsible=icon]:hidden">
        <span className={`font-serif text-2xl font-bold tracking-tight ${textClassName}`}>
          documentGPT
        </span>
        <span className="mb-1.5 h-1 w-1 rounded-full bg-lime-400" />
      </div>
    </Link>
  );
};
