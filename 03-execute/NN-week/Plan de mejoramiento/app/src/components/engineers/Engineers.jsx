import { useState } from "react";
import { apiRequest } from "../../services/auth";

export default function Engineers({ engineers, onRefresh, canOperate }) {
  const [form, setForm] = useState({
    employee_code: "",
    full_name: "",
  });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      await apiRequest("/engineers", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setForm({ employee_code: "", full_name: "" });
      setMessage("Ingeniero registrado correctamente.");
      await onRefresh();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card">
      <h2>Ingenieros</h2>
      <p>Consulta y registro de ingenieros.</p>

      {message && <p role="status">{message}</p>}

      {canOperate && (
        <form className="module-form" onSubmit={handleSubmit}>
          <input
            required
            placeholder="Código de empleado"
            value={form.employee_code}
            onChange={(event) =>
              setForm({ ...form, employee_code: event.target.value })
            }
          />

          <input
            required
            placeholder="Nombre completo"
            value={form.full_name}
            onChange={(event) =>
              setForm({ ...form, full_name: event.target.value })
            }
          />

          <button disabled={busy}>
            {busy ? "Guardando..." : "Registrar ingeniero"}
          </button>
        </form>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody>
            {engineers.map((engineer) => (
              <tr key={engineer.id}>
                <td>{engineer.employee_code}</td>
                <td>{engineer.full_name}</td>
                <td>{engineer.is_active ? "Activo" : "Inactivo"}</td>
              </tr>
            ))}

            {engineers.length === 0 && (
              <tr>
                <td colSpan="3">No hay ingenieros registrados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}