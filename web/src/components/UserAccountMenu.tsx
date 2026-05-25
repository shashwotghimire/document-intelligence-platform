import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserAccountMenuProps {
  email: string;
  gravatarUrl?: string;
  name: string;
  role: string;
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

export function UserAccountMenu({
  email,
  gravatarUrl,
  name,
  role,
}: UserAccountMenuProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    queryClient.clear();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex items-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label="Open account menu"
            className="flex size-11 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-neutral-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            type="button"
          >
            {gravatarUrl ? (
              <img
                alt={`${name}'s avatar`}
                className="size-9 rounded-full"
                src={gravatarUrl}
              />
            ) : (
              <span className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
                {getInitials(name)}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="flex flex-col gap-1">
            <span className="truncate text-sm font-medium text-foreground">
              {name}
            </span>
            <span className="truncate text-xs font-normal text-muted-foreground">
              {email}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="cursor-pointer transition-colors hover:bg-neutral-300 focus:bg-neutral-300"
              onSelect={() => navigate("/profile")}
            >
              <Settings />
              Edit profile
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer"
              onSelect={handleLogout}
            >
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex min-w-0 flex-col">
        <p className="truncate text-sm font-medium text-foreground">{name}</p>
        <p className="truncate text-xs capitalize text-muted-foreground">
          {role}
        </p>
      </div>
    </div>
  );
}
