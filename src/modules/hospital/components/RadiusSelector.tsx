// modules/hospital/components/RadiusSelector.tsx

export default function RadiusSelector({ radius, setRadius }) {
  return (
    <select value={radius} onChange={(e) => setRadius(Number(e.target.value))}>
      <option value={2000}>2 km</option>
      <option value={5000}>5 km</option>
      <option value={10000}>10 km</option>
    </select>
  );
}
