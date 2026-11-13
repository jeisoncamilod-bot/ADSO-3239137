
import { useCallback, useEffect, useState } from "react";

import Login from "./components/Login";
import PlanCatalog from "./components/plans/PlanCatalog";
import StatCard from "./components/ui/StatCard";
import LoadingState from "./components/ui/LoadingState";
import ErrorMessage from "./components/ui/ErrorMessage";

import {
  getToken,
  getCurrentUser,
  logout,
  clearToken,
} from "./services/auth";

import "./index.css";

// =====================================================
// CONFIGURACIÓN GENERAL
// =====================================================

const API_URL = "/api/v1";

const MENU_ITEMS = [
  { id: "dashboard", name: "Panel principal", icon: "▦" },
  { id: "catalog", name: "Catálogo de planos", icon: "▤" },
  { id: "categories", name: "Categorías", icon: "▣" },
  { id: "engineers", name: "Ingenieros", icon: "♙" },
  { id: "loans", name: "Préstamos y devoluciones", icon: "⇄" },
  { id: "reports", name: "Reportes", icon: "▥" },
];

const EMPTY_PLAN = {
  code: "",
  title: "",
  description: "",
  category_id: "",
  total_units: 1,
};

// =====================================================
// FUNCIONES AUXILIARES
// =====================================================

async function readJson(response) {
  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();

  if (!text.trim()) {
    throw new Error("El servidor devolvió una respuesta vacía.");
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      contentType.includes("text/html")
        ? "El servidor devolvió HTML en lugar de datos JSON."
        : "El servidor devolvió una respuesta no válida."
    );
  }
}

function getApiError(result, fallback) {
  const validationErrors = result?.errors
    ? Object.values(result.errors).flat().join(" ")
    : "";

  return validationErrors || result?.message || fallback;
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export default function App() {
  // Autenticación
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  // Navegación
  const [page, setPage] = useState("dashboard");

  // Datos del sistema
  const [plans, setPlans] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Formulario de planos
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [newPlan, setNewPlan] = useState({ ...EMPTY_PLAN });
  const [savingPlan, setSavingPlan] = useState(false);
  const [planError, setPlanError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ===================================================
  // CARGAR DATOS
  // ===================================================

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [plansResponse, categoriesResponse] = await Promise.all([
        fetch(`${API_URL}/plans`, {
          headers: { Accept: "application/json" },
        }),
        fetch(`${API_URL}/categories`, {
          headers: { Accept: "application/json" },
        }),
      ]);

      const [plansResult, categoriesResult] = await Promise.all([
        readJson(plansResponse),
        readJson(categoriesResponse),
      ]);

      if (!plansResponse.ok || !categoriesResponse.ok) {
        throw new Error(
          "No fue posible cargar la información desde Laravel."
        );
      }

      setPlans(
        Array.isArray(plansResult.data) ? plansResult.data : []
      );

      setCategories(
        Array.isArray(categoriesResult.data)
          ? categoriesResult.data
          : []
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ===================================================
  // RESTAURAR SESIÓN
  // ===================================================

  useEffect(() => {
    if (!getToken()) {
      return;
    }

    getCurrentUser()
      .then((authenticatedUser) => {
        setUser(authenticatedUser);
      })
      .catch(() => {
        clearToken();
        setUser(null);
      });
  }, []);

  // ===================================================
  // CERRAR SESIÓN
  // ===================================================

  async function handleLogout() {
    try {
      await logout();
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    } finally {
      clearToken();
      setUser(null);
      setShowLogin(false);
      setShowPlanForm(false);
    }
  }

  // ===================================================
  // MANEJAR FORMULARIO
  // ===================================================

  function handlePlanChange(event) {
    const { name, value } = event.target;

    setNewPlan((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function openPlanForm() {
    setPlanError("");
    setSuccessMessage("");

    if (!user || !getToken()) {
      setShowLogin(true);
      return;
    }

    setShowPlanForm(true);
  }

  function closePlanForm() {
    setShowPlanForm(false);
    setPlanError("");
    setNewPlan({ ...EMPTY_PLAN });
  }

  // ===================================================
  // REGISTRAR NUEVO PLANO
  // ===================================================

  async function handleCreatePlan(event) {
    event.preventDefault();

    if (savingPlan) {
      return;
    }

    setSavingPlan(true);
    setPlanError("");
    setSuccessMessage("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "Debes iniciar sesión para registrar un plano."
        );
      }

      const payload = {
        code: newPlan.code.trim(),
        title: newPlan.title.trim(),
        description: newPlan.description.trim(),
        category_id: Number(newPlan.category_id),
        total_units: Number(newPlan.total_units),
      };

      if (!payload.code || !payload.title) {
        throw new Error(
          "El código y el nombre del plano son obligatorios."
        );
      }

      if (
        !Number.isInteger(payload.category_id) ||
        payload.category_id <= 0
      ) {
        throw new Error("Selecciona una categoría válida.");
      }

      if (
        !Number.isInteger(payload.total_units) ||
        payload.total_units < 0
      ) {
        throw new Error(
          "La cantidad de unidades debe ser un número entero mayor o igual a cero."
        );
      }

      const response = await fetch(`${API_URL}/plans`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await readJson(response);

      if (!response.ok) {
        throw new Error(
          getApiError(result, "No fue posible registrar el plano.")
        );
      }

      if (!result.data) {
        throw new Error(
          "El servidor no confirmó los datos del plano creado."
        );
      }

      // Mostrar inmediatamente el plano registrado.
      setPlans((current) => [result.data, ...current]);

      setNewPlan({ ...EMPTY_PLAN });
      setShowPlanForm(false);
      setSuccessMessage(
        `El plano ${result.data.code || payload.code} se registró correctamente.`
      );

    } catch (err) {
      setPlanError(err.message);
    } finally {
      setSavingPlan(false);
    }
  }

  // ===================================================
  // ESTADÍSTICAS
  // ===================================================

  const availableUnits = plans.reduce(
    (total, plan) =>
      total + Number(plan.available_units || 0),
    0
  );

  const unavailableUnits = plans.reduce(
    (total, plan) =>
      total +
      Math.max(
        0,
        Number(plan.total_units || 0) -
          Number(plan.available_units || 0)
      ),
    0
  );

  const currentPage = MENU_ITEMS.find(
    (item) => item.id === page
  );

  // ===================================================
  // PANTALLA DE INICIO DE SESIÓN
  // ===================================================

  if (showLogin && !user) {
    return (
      <div className="pa-login-page">
        <button
          type="button"
          className="pa-back-button"
          onClick={() => setShowLogin(false)}
        >
          ← Volver al panel
        </button>

        <Login
          onLogin={(authenticatedUser) => {
            setUser(authenticatedUser);
            setShowLogin(false);
          }}
        />
      </div>
    );
  }

  // ===================================================
  // INTERFAZ PRINCIPAL
  // ===================================================

  return (
    <div className="pa-app">

      {/* MENÚ LATERAL */}
      <aside className="pa-sidebar">
        <div className="pa-brand">
          <div className="pa-brand-icon">▤</div>

          <div>
            <strong>Plans Archive</strong>
            <small>Gestión documental</small>
          </div>
        </div>

        <p className="pa-sidebar-label">
          MENÚ PRINCIPAL
        </p>

        <nav className="pa-sidebar-nav">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={
                page === item.id ? "is-active" : ""
              }
              onClick={() => {
                setPage(item.id);
                setSuccessMessage("");
                setPlanError("");
              }}
            >
              <span aria-hidden="true">
                {item.icon}
              </span>

              {item.name}
            </button>
          ))}
        </nav>

        <div className="pa-sidebar-bottom">
          Plans Archive
          <small>
            Laravel · React · PostgreSQL
          </small>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="pa-main">

        {/* ENCABEZADO */}
        <header className="pa-topbar">
          <div>
            <span className="pa-eyebrow">
              SISTEMA DE INVENTARIO DOCUMENTAL
            </span>

            <h1>{currentPage?.name}</h1>

            <p>
              Administración de planos de ingeniería.
            </p>
          </div>

          <div className="pa-account">
            {user ? (
              <>
                <span>
                  {user.name || user.email}
                </span>

                <button
                  type="button"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <button
                type="button"
                className="pa-primary-button"
                onClick={() => setShowLogin(true)}
              >
                Iniciar sesión
              </button>
            )}
          </div>
        </header>

        <div className="pa-main-content">

          {/* MENSAJES DEL SISTEMA */}
          {error && (
            <ErrorMessage message={error} />
          )}

          {successMessage && (
            <div
              className="pa-success-message"
              role="status"
            >
              ✓ {successMessage}
            </div>
          )}

          {loading && <LoadingState />}

          {/* PANEL PRINCIPAL */}
          {page === "dashboard" && (
            <>
              <section className="pa-welcome">
                <div>
                  <span>
                    BIENVENIDO A PLANS ARCHIVE
                  </span>

                  <h2>
                    Control de planos en un solo lugar
                  </h2>

                  <p>
                    Consulta y administra tu inventario
                    documental de manera organizada.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setPage("catalog")}
                >
                  Explorar planos →
                </button>
              </section>

              <section className="pa-stats-grid">
                <StatCard
                  title="Planos registrados"
                  value={plans.length}
                  icon="▤"
                />

                <StatCard
                  title="Unidades disponibles"
                  value={availableUnits}
                  icon="✓"
                />

                <StatCard
                  title="Categorías"
                  value={categories.length}
                  icon="▣"
                />

                <StatCard
                  title="Unidades no disponibles"
                  value={unavailableUnits}
                  icon="⇄"
                />
              </section>

              <PlanCatalog
                plans={plans}
                categories={categories}
              />
            </>
          )}

          {/* CATÁLOGO DE PLANOS */}
          {page === "catalog" && (
            <>
              <div className="pa-catalog-actions">
                <div>
                  <h2>Inventario de planos</h2>
                  <p>
                    Consulta y registra planos de ingeniería.
                  </p>
                </div>

                <button
                  type="button"
                  className="pa-primary-button"
                  onClick={
                    showPlanForm
                      ? closePlanForm
                      : openPlanForm
                  }
                >
                  {showPlanForm
                    ? "Cerrar formulario"
                    : "+ Nuevo plano"}
                </button>
              </div>

              {/* FORMULARIO DE REGISTRO */}
              {showPlanForm && (
                <section className="pa-panel pa-create-panel">
                  <div className="pa-form-heading">
                    <div>
                      <h2>Registrar nuevo plano</h2>
                      <p>
                        Completa los campos para agregar
                        un plano al inventario.
                      </p>
                    </div>
                  </div>

                  <form
                    className="pa-create-form"
                    onSubmit={handleCreatePlan}
                  >
                    <label>
                      Código del plano
                      <input
                        name="code"
                        type="text"
                        required
                        maxLength={60}
                        placeholder="Ej. ARQ-001"
                        value={newPlan.code}
                        onChange={handlePlanChange}
                      />
                    </label>

                    <label>
                      Nombre del plano
                      <input
                        name="title"
                        type="text"
                        required
                        maxLength={200}
                        placeholder="Ej. Plano arquitectónico general"
                        value={newPlan.title}
                        onChange={handlePlanChange}
                      />
                    </label>

                    <label>
                      Categoría
                      <select
                        name="category_id"
                        required
                        value={newPlan.category_id}
                        onChange={handlePlanChange}
                      >
                        <option value="">
                          Selecciona una categoría
                        </option>

                        {categories.map((category) => (
                          <option
                            key={category.id}
                            value={category.id}
                          >
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Cantidad de unidades
                      <input
                        name="total_units"
                        type="number"
                        min="0"
                        step="1"
                        required
                        value={newPlan.total_units}
                        onChange={handlePlanChange}
                      />
                    </label>

                    <label className="pa-create-full">
                      Descripción
                      <textarea
                        name="description"
                        rows={4}
                        placeholder="Escribe una descripción del plano..."
                        value={newPlan.description}
                        onChange={handlePlanChange}
                      />
                    </label>

                    {planError && (
                      <p
                        className="pa-create-error"
                        role="alert"
                      >
                        {planError}
                      </p>
                    )}

                    <div className="pa-form-actions pa-create-full">
                      <button
                        type="button"
                        className="pa-secondary-button"
                        onClick={closePlanForm}
                        disabled={savingPlan}
                      >
                        Cancelar
                      </button>

                      <button
                        type="submit"
                        className="pa-primary-button"
                        disabled={savingPlan}
                      >
                        {savingPlan
                          ? "Guardando..."
                          : "Guardar plano"}
                      </button>
                    </div>
                  </form>
                </section>
              )}

              <PlanCatalog
                plans={plans}
                categories={categories}
              />
            </>
          )}

          {/* CATEGORÍAS */}
          {page === "categories" && (
            <section className="pa-panel">
              <h2>Categorías registradas</h2>

              <p>
                Clasificación de los planos de ingeniería.
              </p>

              <div className="pa-category-grid">
                {categories.map((category) => (
                  <div
                    className="pa-category-tile"
                    key={category.id}
                  >
                    <span>▣</span>
                    <strong>{category.name}</strong>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* INGENIEROS */}
          {page === "engineers" && (
            <section className="pa-panel">
              <h2>Gestión de ingenieros</h2>
              <p>
                Módulo pendiente de conectar con la API.
              </p>
            </section>
          )}

          {/* PRÉSTAMOS */}
          {page === "loans" && (
            <section className="pa-panel">
              <h2>Préstamos y devoluciones</h2>
              <p>
                Módulo pendiente de conectar con la API.
              </p>
            </section>
          )}

          {/* REPORTES */}
          {page === "reports" && (
            <section className="pa-panel">
              <h2>Reportes</h2>
              <p>
                Módulo pendiente de conectar con la API.
              </p>
            </section>
          )}

        </div>
      </main>
    </div>
  );
}
