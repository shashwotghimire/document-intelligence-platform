import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { useUploadDocument } from "@/service/api/upload/upload.api";

interface FileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: File;
  fileName: string;
  fileSize: number;
  fileType: string;
  onUploadSuccess: () => void;
}

export function FileModal(data: FileModalProps) {
  const { mutate, isPending, error } = useUploadDocument();
  const handleFileUpload = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(
      {
        file: data.file,
      },
      {
        onSuccess: data.onUploadSuccess,
      },
    );
  };
  const handlePreview = () => {
    const url = URL.createObjectURL(data.file);
    window.open(url, "_blank");
  };

  return (
    <Dialog open={data.open} onOpenChange={data.onOpenChange}>
      <DialogContent className="sm:max-w-sm ">
        <form onSubmit={handleFileUpload}>
          <DialogHeader className="mt-2">
            <DialogTitle>Upload Document to Knowledge Base</DialogTitle>
            <DialogDescription className="mt-2">
              Preview your document before processing it
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="mt-3">
            <Field>
              <Label htmlFor="name-1">File Name</Label>
              <Label htmlFor="name-1">{data.fileName}</Label>
            </Field>
            <Field>
              <Label htmlFor="username-1">File Size</Label>
              <Label htmlFor="username-1">
                {(data.fileSize / 1024).toFixed(2)} KB
              </Label>
            </Field>
            <Field>
              <Label htmlFor="username-1">File Type</Label>
              <Label htmlFor="username-1">{data.fileType}</Label>
            </Field>
          </FieldGroup>
          <DialogFooter className="mt-2">
            <Button
              type="button"
              onClick={handlePreview}
              className="cursor-pointer hover:bg-neutral-600 transition-colors"
            >
              Preview
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="cursor-pointer hover:bg-neutral-600 transition-colors"
            >
              {isPending ? "Uploading..." : "Upload Document"}
            </Button>
          </DialogFooter>
        </form>
        {error && <p className="text-red-500">Error uploading your document</p>}
      </DialogContent>
    </Dialog>
  );
}
