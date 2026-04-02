export default function DoctorError({ message }) {
  if (!message) return null;
  return (
    <p className="mb-6 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
      {message}
    </p>
  );
}
