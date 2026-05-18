import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  unit?: string;
  label?: string;
}

export function StatsCard({ title, value, unit, label }: StatsCardProps) {
  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardDescription>{title}</CardDescription>
      </CardHeader>
      <CardContent>
        <CardTitle className="text-3xl font-semibold">
          {value} {unit}
        </CardTitle>
        {label && <p className="mt-2 text-sm text-muted-foreground">{label}</p>}
      </CardContent>
    </Card>
  );
}
