export const Logo = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-lime-400">
        <div className="h-3 w-3 rounded-full bg-black" />
      </div>

      <div className="flex items-end gap-1">
        <span className="font-serif text-2xl font-bold tracking-tight text-white">
          documentGPT
        </span>

        <span className="mb-1.5 h-1 w-1 rounded-full bg-lime-400" />
      </div>
    </div>
  );
};

export const LogoDark = () => {
  return (
    <div className="flex items-center gap-3 p-1.5">
      <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-lime-400">
        <div className="h-3 w-3 rounded-full bg-black" />
      </div>

      <div className="flex items-end gap-1">
        <span className="font-serif text-2xl font-bold tracking-tight text-black">
          documentGPT
        </span>
        <span className="mb-1.5 h-1 w-1 rounded-full bg-lime-400" />
      </div>
    </div>
  );
};
