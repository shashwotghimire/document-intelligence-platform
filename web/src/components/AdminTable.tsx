import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetStatsForTable } from "@/service/api/stats/stats.api";
import Loading from "./Loading";

export function AdminTable() {
  const { data, isPending, error } = useGetStatsForTable();
  if (isPending) {
    return <Loading />;
  }
  return (
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
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.data.map((data) => (
          <TableRow key={data.id}>
            <TableCell>{data.filename}</TableCell>
            <TableCell>{data.fileType}</TableCell>
            <TableCell>{(data.fileSize / 1024).toFixed(2)} MB</TableCell>
            <TableCell className="text-right">
              {data.fileProcessingStatus}
            </TableCell>
            <TableCell className="text-right">{data.uploader.name}</TableCell>
            <TableCell className="text-right">{data.uploader.role}</TableCell>
            <TableCell className="text-right">
              {new Date(data.createdAt).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter></TableFooter>
    </Table>
  );
}
