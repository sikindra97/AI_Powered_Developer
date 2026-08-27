export default function ErrorState({
  message = "Something went wrong."
}) {
  return (
    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
      <p className="text-sm font-medium text-red-700">
        {message}
      </p>
    </div>
  );
}