import React from "react";

export default function NavigationMenu({ active, onChange }) {
  const modules = [
    { id: "catalog", label: "Catalogo de planos" },
    { id: "engineers", label: "Ingenieros" },
    { id: "loans", label: "Prestamos y devoluciones" },
    { id: "reports", label: "Reportes" }
  ];

  return (
    <nav className="pa-navigation" aria-label="Modulos del sistema">
      {modules.map((module) => (
        <button
          key={module.id}
          type="button"
          className={active === module.id ? "is-active" : ""}
          aria-current={active === module.id ? "page" : undefined}
          onClick={() => onChange(module.id)}
        >
          {module.label}
        </button>
      ))}
    </nav>
  );
}
