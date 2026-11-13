export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null;

  return (
    <div className="pa-error-message" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  );
}
