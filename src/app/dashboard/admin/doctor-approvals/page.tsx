"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Check, X, AlertCircle, Loader2 } from "lucide-react";
import {
  approveDoctorAction,
  rejectDoctorAction,
  getPendingDoctorsAction,
} from "@/features/Auth/doctor-approval.action";
import { Textarea } from "@/components/ui/textarea";

interface Doctor {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  licenseNumber: string;
  gender: string;
  age: number;
  address?: {
    street?: string;
    city?: string;
    country?: string;
    zipCode?: string;
  };
  consultationFee: number;
  availableDays?: number[];
  startTime?: string;
  endTime?: string;
  slotDuration?: number;
  approvalStatus: string;
  createdAt: string;
}

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function AdminDoctorApprovalPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch pending doctors
  useEffect(() => {
    fetchPendingDoctors();
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPendingDoctors = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const result = await getPendingDoctorsAction(page, 10);
      if (result.success) {
        setDoctors(Array.isArray(result.data) ? (result.data as Doctor[]) : []);
        setTotalPages(result.pagination?.totalPages || 1);
      } else {
        setDoctors([]);
        setErrorMessage(result.message || "Failed to load doctors");
      }
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
      setErrorMessage("Failed to load doctors");
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowApproveDialog(true);
  };

  const handleReject = async (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setRejectReason("");
    setShowRejectDialog(true);
  };

  const confirmApprove = async () => {
    if (!selectedDoctor) return;

    try {
      setErrorMessage(null);
      setActionLoading(selectedDoctor._id);
      const result = await approveDoctorAction(selectedDoctor._id, "admin");

      if (result.success) {
        setSuccessMessage(result.message);
        setShowApproveDialog(false);
        // Remove approved doctor immediately to keep UI and backend in sync.
        setDoctors((prev) =>
          prev.filter((doctor) => doctor._id !== selectedDoctor._id),
        );
        setSelectedDoctor(null);
        setTimeout(() => {
          fetchPendingDoctors();
          setSuccessMessage(null);
        }, 2000);
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      setErrorMessage("Failed to approve doctor");
    } finally {
      setActionLoading(null);
    }
  };

  const confirmReject = async () => {
    if (!selectedDoctor) return;

    try {
      setErrorMessage(null);
      setActionLoading(selectedDoctor._id);
      const result = await rejectDoctorAction(selectedDoctor._id, rejectReason);

      if (result.success) {
        setSuccessMessage(result.message);
        setShowRejectDialog(false);
        setDoctors((prev) =>
          prev.filter((doctor) => doctor._id !== selectedDoctor._id),
        );
        setSelectedDoctor(null);
        setRejectReason("");
        setTimeout(() => {
          fetchPendingDoctors();
          setSuccessMessage(null);
        }, 2000);
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      setErrorMessage("Failed to reject doctor");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">
          Doctor Applications
        </h1>
        <p className="text-zinc-500 mt-2">
          Review and approve pending doctor applications
        </p>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600" />
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800">{errorMessage}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#1F6F68]" />
        </div>
      ) : doctors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-zinc-500">No pending doctor applications</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Doctor Cards */}
          <div className="space-y-4">
            {doctors.map((doctor) => (
              <Card
                key={doctor._id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column - Personal Info */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-zinc-900">
                          {doctor.fullName}
                        </h3>
                        <p className="text-sm text-zinc-500">
                          {doctor.specialization}
                        </p>
                      </div>

                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-medium text-zinc-600">
                            Email:
                          </span>{" "}
                          {doctor.email}
                        </p>
                        <p>
                          <span className="font-medium text-zinc-600">
                            Phone:
                          </span>{" "}
                          {doctor.phone}
                        </p>
                        <p>
                          <span className="font-medium text-zinc-600">
                            License:
                          </span>{" "}
                          {doctor.licenseNumber}
                        </p>
                        <p>
                          <span className="font-medium text-zinc-600">
                            Age:
                          </span>{" "}
                          {doctor.age}
                          {doctor.gender && `, ${doctor.gender}`}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-zinc-200">
                        <p className="text-sm font-medium text-zinc-600">
                          Location
                        </p>
                        <p className="text-sm text-zinc-600">
                          {doctor.address?.street || "N/A"},{" "}
                          {doctor.address?.city || "N/A"},{" "}
                          {doctor.address?.country || "N/A"}{" "}
                          {doctor.address?.zipCode || ""}
                        </p>
                      </div>
                    </div>

                    {/* Right Column - Professional Info */}
                    <div className="space-y-4">
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-medium text-zinc-600">
                            Consultation Fee:
                          </span>{" "}
                          ${doctor.consultationFee}
                        </p>
                        <p>
                          <span className="font-medium text-zinc-600">
                            Session Duration:
                          </span>{" "}
                          {doctor.slotDuration ?? "N/A"} minutes
                        </p>
                        <p>
                          <span className="font-medium text-zinc-600">
                            Hours:
                          </span>{" "}
                          {doctor.startTime || "N/A"} -{" "}
                          {doctor.endTime || "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="font-medium text-zinc-600 mb-2">
                          Available Days
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(doctor.availableDays ?? []).map((day) => (
                            <Badge
                              key={day}
                              variant="secondary"
                              className="text-xs"
                            >
                              {dayNames[day] ?? `Day ${day}`}
                            </Badge>
                          ))}
                          {(doctor.availableDays ?? []).length === 0 && (
                            <Badge variant="secondary" className="text-xs">
                              No schedule provided
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-zinc-200 flex gap-3">
                        <Button
                          onClick={() => handleApprove(doctor)}
                          disabled={actionLoading === doctor._id}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          {actionLoading === doctor._id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4 mr-2" />
                          )}
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleReject(doctor)}
                          disabled={actionLoading === doctor._id}
                          variant="outline"
                          className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                        >
                          {actionLoading === doctor._id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <X className="w-4 h-4 mr-2" />
                          )}
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-4 mt-8">
              <Button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                variant="outline"
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-600">
                  Page {page} of {totalPages}
                </span>
              </div>
              <Button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                variant="outline"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Approve Dialog */}
      <Dialog
        open={showApproveDialog}
        onOpenChange={(open) => {
          setShowApproveDialog(open);
          if (!open && actionLoading === null) {
            setSelectedDoctor(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Doctor Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve {selectedDoctor?.fullName}&apos;s
              application?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApproveDialog(false)}
              disabled={actionLoading !== null}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmApprove}
              disabled={actionLoading !== null}
              className="bg-green-600 hover:bg-green-700"
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={showRejectDialog}
        onOpenChange={(open) => {
          setShowRejectDialog(open);
          if (!open && actionLoading === null) {
            setSelectedDoctor(null);
            setRejectReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Doctor Application</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting {selectedDoctor?.fullName}&apos;s
              application.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-24"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              disabled={actionLoading !== null}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmReject}
              disabled={actionLoading !== null || !rejectReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
