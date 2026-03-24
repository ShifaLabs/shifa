import Link from "next/link";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

type AdminModulePlaceholderProps = {
  title: string;
  summary: string;
  route: string;
  deliverables: string[];
};

export default function AdminModulePlaceholder({
  title,
  summary,
  route,
  deliverables,
}: AdminModulePlaceholderProps) {
  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="space-y-2">
        <Badge variant="secondary">Phase 1 Scaffold</Badge>
        <h1 className="text-3xl font-semibold text-zinc-900">{title}</h1>
        <p className="text-sm text-zinc-600 max-w-3xl">{summary}</p>
      </div>

      <Card className="border-zinc-200 p-6">
        <CardHeader>
          <CardTitle className="text-lg">Implementation Queue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {deliverables.map((item) => (
            <p key={item} className="text-sm text-zinc-700">
              • {item}
            </p>
          ))}
        </CardContent>
      </Card>

      <p className="text-sm text-zinc-500">
        Route: {route} | Return to{" "}
        <Link
          href="/dashboard/admin"
          className="text-[#1F6F68] hover:text-[#15524d]"
        >
          admin overview
        </Link>
      </p>
    </div>
  );
}
