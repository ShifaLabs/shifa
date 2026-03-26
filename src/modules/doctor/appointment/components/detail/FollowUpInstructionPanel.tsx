"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Save } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import type {
  DoctorFollowUpEntry,
  FollowUpPriority,
  SaveFollowUpPayload,
} from "../../types/doctor-appointment-detail.types";
import {
  formatDateLabel,
  formatDateTimeLabel,
  getPriorityBadgeVariant,
} from "../../utils/doctor-appointment-detail.utils";

type Props = {
  appointmentId: string;
  followUps: DoctorFollowUpEntry[];
  onSave: (payload: SaveFollowUpPayload) => Promise<void>;
};

export default function FollowUpInstructionPanel({
  appointmentId,
  followUps,
  onSave,
}: Props) {
  const latest = followUps[0];
  const [instructions, setInstructions] = useState(latest?.instructions || "");
  const [notes, setNotes] = useState(latest?.notes || "");
  const [priority, setPriority] = useState<FollowUpPriority>(
    (latest?.priority as FollowUpPriority) || "routine",
  );
  const [nextVisitAt, setNextVisitAt] = useState(
    latest?.nextVisitAt ? String(latest.nextVisitAt).slice(0, 10) : "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const historyPreview = useMemo(() => followUps.slice(0, 5), [followUps]);

  const submit = async () => {
    const trimmedInstructions = instructions.trim();
    const trimmedNotes = notes.trim();

    if (!trimmedInstructions && !trimmedNotes) {
      setError("Please provide follow-up instructions or notes.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await onSave({
        instructions: trimmedInstructions,
        notes: trimmedNotes,
        priority,
        nextVisitAt: nextVisitAt ? new Date(nextVisitAt).toISOString() : null,
      });
    } catch (saveError: any) {
      setError(saveError?.message || "Failed to save follow-up instructions.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-4 md:p-6">
      <CardHeader>
        <CardTitle className="text-base">Follow-up Instructions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <input type="hidden" value={appointmentId} readOnly />

        <div className="space-y-2">
          <Label htmlFor="followup-instructions">Instructions</Label>
          <Textarea
            id="followup-instructions"
            value={instructions}
            onChange={(event) => setInstructions(event.target.value)}
            placeholder="Prescribe home care and follow-up expectations"
            className="min-h-24"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="followup-notes">Additional Notes</Label>
          <Textarea
            id="followup-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Any warning signs or special instructions"
            className="min-h-20"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={priority}
              onValueChange={(value) => setPriority(value as FollowUpPriority)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="routine">Routine</SelectItem>
                <SelectItem value="important">Important</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="followup-next-visit">Next Visit Date</Label>
            <Input
              id="followup-next-visit"
              type="date"
              value={nextVisitAt}
              onChange={(event) => setNextVisitAt(event.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <Button type="button" onClick={submit} disabled={saving}>
            <Save className="size-4" />
            {saving ? "Saving..." : "Save Follow-up"}
          </Button>
          {latest?.updatedAt ? (
            <p className="text-xs text-muted-foreground">
              Last saved: {formatDateTimeLabel(latest.updatedAt)}
            </p>
          ) : null}
        </div>

        {error ? (
          <p className="inline-flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="size-3.5" />
            {error}
          </p>
        ) : null}

        <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Recent Follow-up Log
          </p>
          {historyPreview.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No follow-up entries yet.
            </p>
          ) : (
            <div className="space-y-2">
              {historyPreview.map((entry) => (
                <div
                  key={entry._id}
                  className="rounded-md border bg-background p-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant={getPriorityBadgeVariant(entry.priority)}>
                      {entry.priority}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTimeLabel(entry.createdAt)}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-foreground">
                    {entry.instructions || "No instructions"}
                  </p>
                  {entry.nextVisitAt ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Next visit: {formatDateLabel(entry.nextVisitAt)}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
