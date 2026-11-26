export default function PageHeader({ title, subtitle, actions }) {
  return (
    <header className="pa-page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && (
        <div className="pa-page-header__actions">{actions}</div>
      )}
    </header>
  );
}
