// modules/hospital/components/HospitalList.tsx

export default function HospitalList({ hospitals }) {
  return (
    <div>
      {hospitals.map((h) => (
        <div key={h.id}>
          <p>{h.name}</p>
          <p>{h.distanceKm.toFixed(2)} km</p>
        </div>
      ))}
    </div>
  );
}
