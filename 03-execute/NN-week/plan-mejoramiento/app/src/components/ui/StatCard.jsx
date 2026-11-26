export default function StatCard({ title, value, description, icon }) {
  return (
    <article className="pa-stat-card">
      <div className="pa-stat-card__top">
        <span className="pa-stat-card__title">{title}</span>
        {icon && <span aria-hidden="true">{icon}</span>}
      </div>
      <strong className="pa-stat-card__value">{value}</strong>
      {description && (
        <p className="pa-stat-card__description">{description}</p>
      )}
    </article>
  );
}
