export default function LoadingState({
  message = "Cargando información..."
}) {
  return (
    <div className="pa-loading-state" role="status">
      <span className="pa-loading-state__spinner" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
