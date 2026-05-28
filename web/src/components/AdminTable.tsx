import { useState } from "react";

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
import { formatBytes } from "@/lib/format-bytes";
import { useGetStatsForTable } from "@/service/api/stats/stats.api";
import { useDeleteDocument } from "@/service/api/upload/upload.api";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import Loading from "./Loading";

export function AdminTable() {
  const [documentToDelete, setDocumentToDelete] = useState<{
    id: string;
    filename: string;
  } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { data, isPending } = useGetStatsForTable();
  const deleteDocument = useDeleteDocument();
  const documents = data?.data ?? [];

  const handleConfirmDeleteDocument = async () => {
    if (!documentToDelete) return;

    setDeleteError(null);

    try {
      await deleteDocument.mutateAsync({ documentId: documentToDelete.id });
      setDocumentToDelete(null);
    } catch {
      setDeleteError("Unable to delete file. Please try again.");
    }
  };

  if (isPending) {
    return <Loading />;
  }

  return (
    <div>
      {deleteError ? (
        <div className="border-b border-border bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {deleteError}
        </div>
      ) : null}

      <Table>
        <TableCaption>A list of your uploaded documents.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>File name</TableHead>
            <TableHead>File type</TableHead>
            <TableHead>File size</TableHead>
            <TableHead className="text-right">Status</TableHead>
            <TableHead className="text-right">Uploader</TableHead>
            <TableHead className="text-right">Role</TableHead>
            <TableHead className="text-right">Uploaded At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.length > 0 ? (
            documents.map((document) => {
              const fileSize = formatBytes(document.fileSize);

              return (
                <TableRow key={document.id}>
                  <TableCell>{document.filename}</TableCell>
                  <TableCell>{document.fileType}</TableCell>
                  <TableCell>
                    {fileSize.value} {fileSize.unit}
                  </TableCell>
                  <TableCell className="text-right">
                    {document.fileProcessingStatus}
                  </TableCell>
                  <TableCell className="text-right">
                    {document.uploader.name}
                  </TableCell>
                  <TableCell className="text-right">
                    {document.uploader.role}
                  </TableCell>
                  <TableCell className="text-right">
                    {new Date(document.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      className="cursor-pointer"
                      aria-label={`Delete ${document.filename}`}
                      disabled={deleteDocument.isPending}
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        setDocumentToDelete({
                          id: document.id,
                          filename: document.filename,
                        })
                      }
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell
                colSpan={8}
                className="h-24 text-center text-muted-foreground"
              >
                No uploaded documents found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <DeleteConfirmationDialog
        open={Boolean(documentToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setDocumentToDelete(null);
          }
        }}
        title="Delete uploaded file?"
        description="This will permanently delete the file and its processed chunks."
        itemName={documentToDelete?.filename}
        isPending={deleteDocument.isPending}
        onConfirm={handleConfirmDeleteDocument}
      />
    </div>
  );
}
