import { useState } from "react";

import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBlockUser, useUnblockUser } from "@/service/api/admin/block.api";
import { useGetAllUsers } from "@/service/api/admin/users.api";
import { ChevronLeft, ChevronRight } from "lucide-react";

const USERS_PER_PAGE = 10;

function AdminUsers() {
  const [page, setPage] = useState(1);
  const [actionUserId, setActionUserId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const { data, isPending } = useGetAllUsers({
    page,
    limit: USERS_PER_PAGE,
  });
  const { mutate: blockUser, isPending: blockUserPending } = useBlockUser();
  const { mutate: unblockUser, isPending: unblockUserPending } =
    useUnblockUser();

  const users = data?.users ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const isUpdatingUser = blockUserPending || unblockUserPending;

  const handleBlockUnblock = async (userId: string, isBlocked: boolean) => {
    setActionUserId(userId);
    setActionError(null);

    try {
      if (isBlocked) {
        unblockUser({ userId });
      } else {
        blockUser({ userId });
      }
    } catch {
      setActionError("Unable to update user access. Please try again.");
    } finally {
      setActionUserId(null);
    }
  };

  return (
    <section>
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Users</h1>
        <p className="mt-2 text-muted-foreground">
          Manage users, roles, and account access.
        </p>
      </div>

      <div className="border border-border max-w-6xl mx-auto flex flex-col mt-10 rounded-lg overflow-hidden">
        {actionError ? (
          <div className="border-b border-border bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {actionError}
          </div>
        ) : null}

        {isPending ? (
          <Loading />
        ) : (
          <Table>
            <TableCaption>A list of registered users.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email status</TableHead>
                <TableHead className="text-right">Account status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="capitalize">{user.role}</TableCell>
                    <TableCell>
                      {user.isEmailVerified ? "Verified" : "Unverified"}
                    </TableCell>
                    <TableCell className="text-right">
                      {user.isBlocked ? "Blocked" : "Active"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        className="cursor-pointer"
                        disabled={isUpdatingUser}
                        size="sm"
                        variant={user.isBlocked ? "default" : "destructive"}
                        onClick={() =>
                          handleBlockUnblock(user.id, user.isBlocked)
                        }
                      >
                        {isUpdatingUser && actionUserId === user.id
                          ? "Updating"
                          : user.isBlocked
                            ? "Unblock"
                            : "Block"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Page {pagination?.page ?? page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isPending}
              onClick={() => setPage((currentPage) => currentPage - 1)}
            >
              <ChevronLeft />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isPending}
              onClick={() => setPage((currentPage) => currentPage + 1)}
            >
              Next
              <ChevronRight />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdminUsers;
