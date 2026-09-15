export function AuthFormMessage({
  message,
}: {
  message: string;
}) {
  if (!message) {
    return null;
  }

  return (
    <p className="m-0 text-sm text-red-600" role="status">
      {message}
    </p>
  );
}
