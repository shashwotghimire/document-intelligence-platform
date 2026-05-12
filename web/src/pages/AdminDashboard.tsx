import { FileModal } from "@/components/FileModal";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";

function AdminDashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const handleSelectFiles = () => {
    fileInputRef.current?.click();
  };
  return (
    <section>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Overview of documents, users, and system activity.
          </p>
        </div>
        <div className="flex flex-col">
          <Button
            className="h-10 mb-4 cursor-pointer px-4 text-base transition-colors hover:bg-neutral-600"
            onClick={handleSelectFiles}
          >
            + Select File
          </Button>
          {file && (
            <FileModal
              open={modalOpen}
              onOpenChange={setModalOpen}
              file={file}
              fileName={file.name}
              fileSize={file.size}
              fileType={file.type}
              onUploadSuccess={() => {
                setModalOpen(false);
                setFile(null);

                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
            />
          )}

          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={(e) => {
              const selectedFile = e.target.files?.[0];
              if (selectedFile) {
                setFile(selectedFile);
                setModalOpen(true);
              }
            }}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Documents" value="128" label="Uploaded files" />
        <StatsCard title="Vector Chunks" value="4,832" label="Indexed chunks" />
        <StatsCard title="Active Users" value="24" label="Currently enabled" />
        <StatsCard title="Storage" value="12.4 GB" label="Used space" />
      </div>
    </section>
  );
}

export default AdminDashboard;
