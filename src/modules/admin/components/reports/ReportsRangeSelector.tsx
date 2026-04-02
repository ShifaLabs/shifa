"use client";

import { Button } from "@/shared/ui/button";
import { ReportsRangeKey } from "@/modules/admin/types/reports-admin.types";

type Props = {
  value: ReportsRangeKey;
  loading?: boolean;
  onChange: (value: ReportsRangeKey) => void;
};

const options: Array<{ key: ReportsRangeKey; label: string }> = [
  { key: "24h", label: "24 Hours" },
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
  { key: "mtd", label: "Month to Date" },
];

export default function ReportsRangeSelector({
  value,
  loading,
  onChange,
}: Props) {
  return (
    <div className="inline-flex flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-card/80 p-2 shadow-sm">
      {options.map((option) => (
        <Button
          key={option.key}
          size="sm"
          disabled={loading}
          variant={value === option.key ? "default" : "outline"}
          onClick={() => onChange(option.key)}
          className={
            value === option.key
              ? "bg-primary text-primary-foreground"
              : "border-border/80 bg-background"
          }
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
