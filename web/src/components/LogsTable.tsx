import { useState } from "react";
import { useGetLogs, type Log } from "@/service/api/logs/logs.api";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Loading from "./Loading";

export function LogsTable() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, isPending } = useGetLogs(page, limit);

  const logs = data?.logs ?? [];
  const pagination = data?.pagination;

  if (isPending) {
    return <Loading />;
  }

  return (
    <div>
      <Table>
        <TableCaption>A list of user activity logs.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Action</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Date & Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length > 0 ? (
            logs.map((log: Log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">{log.action}</TableCell>
                <TableCell className="max-w-sm truncate text-muted-foreground">
                  {log.data}
                </TableCell>
                <TableCell>{log.user?.name ?? "—"}</TableCell>
                <TableCell>{log.user?.role ?? "—"}</TableCell>
                <TableCell className="text-right">
                  {new Date(log.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-24 text-center text-muted-foreground"
              >
                No logs found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 px-2 py-3">
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={page === pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
