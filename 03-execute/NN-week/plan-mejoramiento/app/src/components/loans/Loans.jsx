import { useState } from "react";
import { apiRequest } from "../../services/auth";

export default function Loans({
  plans,
  engineers,
  loans,
  onRefresh,
  canOperate,
}) {
  const [form, setForm] = useState({
    plan_id: "",
    engineer_id: "",
  });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function createLoan(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      await apiRequest("/loans", {
        method: "POST",
        body: JSON.stringify({
          plan_id: Number(form.plan_id),
          engineer_id: Number(form.engineer_id),
        }),
      });

      setForm({ plan_id: "", engineer_id: "" });
      setMessage("Préstamo registrado correctamente.");
      await onRefresh();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function returnLoan(loanId) {
    if (!window.confirm("¿Confirmas la devolución de este plano?")) {
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      await apiRequest(`/loans/${loanId}/returns`, {
        method: "POST",
        body: JSON.stringify({}),
      });

      setMessage("Devolución registrada correctamente.");
      await onRefresh();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  function isReturned(loan) {
    return Boolean(
      loan.loan_return ||
      loan.loanReturn ||
      loan.returned_at ||
      loan.return
    );
  }

  return (
    <>
      {canOperate && (
        <section className="card">
          <h2>Registrar préstamo</h2>

          {message && <p role="status">{message}</p>}

          <form className="module-form" onSubmit={createLoan}>
            <select
              required
              value={form.plan_id}
              onChange={(event) =>
                setForm({ ...form, plan_id: event.target.value })
              }
            >
              <option value="">Seleccionar plano</option>

              {plans
                .filter((plan) => plan.is_active && plan.available_units > 0)
                .map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.code} - {plan.title}
                  </option>
                ))}
            </select>

            <select
              required
              value={form.engineer_id}
              onChange={(event) =>
                setForm({ ...form, engineer_id: event.target.value })
              }
            >
              <option value="">Seleccionar ingeniero</option>

              {engineers
                .filter((engineer) => engineer.is_active)
                .map((engineer) => (
                  <option key={engineer.id} value={engineer.id}>
                    {engineer.full_name}
                  </option>
                ))}
            </select>

            <button disabled={busy}>
              {busy ? "Procesando..." : "Registrar préstamo"}
            </button>
          </form>
        </section>
      )}

      <section className="card">
        <h2>Historial de préstamos</h2>

        {!canOperate && message && <p role="status">{message}</p>}

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Plano</th>
                <th>Fecha límite</th>
                <th>Estado / Acción</th>
              </tr>
            </thead>

            <tbody>
              {loans.map((loan) => (
                <tr key={loan.id}>
                  <td>#{loan.id}</td>
                  <td>{loan.plan_code_snapshot}</td>
                  <td>
                    {loan.due_at
                      ? new Date(loan.due_at).toLocaleDateString("es-CO")
                      : "—"}
                  </td>
                  <td>
                    {isReturned(loan) ? (
                      "Devuelto"
                    ) : canOperate ? (
                      <button
                        disabled={busy}
                        onClick={() => returnLoan(loan.id)}
                      >
                        Registrar devolución
                      </button>
                    ) : (
                      "Pendiente"
                    )}
                  </td>
                </tr>
              ))}

              {loans.length === 0 && (
                <tr>
                  <td colSpan="4">No hay préstamos registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}