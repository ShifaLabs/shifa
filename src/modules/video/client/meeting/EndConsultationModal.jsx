"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";

export default function EndConsultationModal({
  open,
  onOpenChange,
  medicines,
  notes,
  onMedicinesChange,
  onNotesChange,
  onSubmit,
  pending,
  error,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Consultation</DialogTitle>
          <DialogDescription>
            Add medicine suggestion and doctor notes before ending this call.
            This summary will be visible to the patient and stored in history.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Medicines
            </label>
            <Textarea
              value={medicines}
              onChange={(event) => onMedicinesChange(event.target.value)}
              placeholder="e.g. Paracetamol 500mg (after meals), ORS for hydration"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Doctor Notes
            </label>
            <Textarea
              value={notes}
              onChange={(event) => onNotesChange(event.target.value)}
              placeholder="Clinical findings, precautions, next follow-up advice"
              rows={5}
            />
          </div>

          {error ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Keep Call Running
          </Button>
          <Button type="button" onClick={onSubmit} disabled={pending}>
            {pending ? "Saving..." : "Save & End Call"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
