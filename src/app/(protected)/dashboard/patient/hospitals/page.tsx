import NearbyHospitalsClient from "@/modules/hospital/components/NearbyHospitalsClient";

export default function PatientHospitalsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-base-300 bg-base-100 p-6">
        <h1 className="text-2xl font-semibold text-base-content">
          Nearby Hospitals
        </h1>
        <p className="mt-2 text-sm text-base-content/70">
          Find nearby hospitals with live map view and distance from your
          location.
        </p>
      </div>

      <NearbyHospitalsClient />
    </div>
  );
}
