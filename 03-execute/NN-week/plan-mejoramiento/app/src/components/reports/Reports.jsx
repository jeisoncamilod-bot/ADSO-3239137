export default function Reports({ report }) {
  const records = Array.isArray(report)
    ? report
    : Array.isArray(report?.data)
      ? report.data
      : [];

  return (
    <section className="card">
      <h2>Planos más solicitados</h2>
      <p>Reporte generado por Laravel.</p>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Plano</th>
              <th>Solicitudes</th>
            </tr>
          </thead>

          <tbody>
            {records.map((item, index) => (
              <tr key={item.id ?? index}>
                <td>
                  {item.title ??
                    item.plan_title ??
                    item.code ??
                    item.plan_code ??
                    `Plano ${index + 1}`}
                </td>
                <td>
                  {item.loan_count ??
                    item.loans_count ??
                    item.total_loans ??
                    item.request_count ??
                    "—"}
                </td>
              </tr>
            ))}

            {records.length === 0 && (
              <tr>
                <td colSpan="2">No hay solicitudes registradas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}