import { useMemo, useState } from "react";

export default function PlanCatalog({ plans = [], categories = [] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [availability, setAvailability] = useState("all");

  const categoryName = (plan) => {
    if (plan.category?.name) return plan.category.name;
    const found = categories.find(
      (item) => String(item.id) === String(plan.category_id)
    );
    return found?.name || "Sin categoría";
  };

  const availableUnits = (plan) =>
    Number(plan.available_quantity ?? plan.available_units ?? 0);

  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const text = [
        plan.code,
        plan.name,
        plan.title,
        plan.description,
        categoryName(plan)
      ].filter(Boolean).join(" ").toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());
      const matchesCategory =
        category === "all" || String(plan.category_id) === category;
      const units = availableUnits(plan);
      const matchesAvailability =
        availability === "all" ||
        (availability === "available" && units > 0) ||
        (availability === "unavailable" && units <= 0);

      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [plans, categories, search, category, availability]);

  return (
    <section className="pa-catalog">
      <div className="pa-catalog__heading">
        <div>
          <h2>Catálogo de planos</h2>
          <p>Consulta los planos de ingeniería registrados.</p>
        </div>
        <span>{filteredPlans.length} resultados</span>
      </div>

      <div className="pa-catalog__filters">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por código, nombre o descripción..."
          aria-label="Buscar planos"
        />

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          aria-label="Filtrar por categoría"
        >
          <option value="all">Todas las categorías</option>
          {categories.map((item) => (
            <option key={item.id} value={String(item.id)}>
              {item.name}
            </option>
          ))}
        </select>

        <select
          value={availability}
          onChange={(event) => setAvailability(event.target.value)}
          aria-label="Filtrar por disponibilidad"
        >
          <option value="all">Toda la disponibilidad</option>
          <option value="available">Disponibles</option>
          <option value="unavailable">No disponibles</option>
        </select>
      </div>

      <div className="pa-catalog__table-wrap">
        <table className="pa-catalog__table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Plano</th>
              <th>Categoría</th>
              <th>Disponibles</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlans.map((plan) => {
              const units = availableUnits(plan);
              return (
                <tr key={plan.id}>
                  <td>{plan.code || "—"}</td>
                  <td>{plan.name || plan.title || "Sin nombre"}</td>
                  <td>{categoryName(plan)}</td>
                  <td>{units}</td>
                  <td>
                    <span className={
                      units > 0
                        ? "pa-catalog__status is-available"
                        : "pa-catalog__status is-unavailable"
                    }>
                      {units > 0 ? "Disponible" : "No disponible"}
                    </span>
                  </td>
                </tr>
              );
            })}

            {filteredPlans.length === 0 && (
              <tr>
                <td colSpan="5" className="pa-catalog__empty">
                  No se encontraron planos con los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
