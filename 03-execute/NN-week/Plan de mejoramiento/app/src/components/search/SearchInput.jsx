export default function SearchInput({ value, onChange, placeholder = "Buscar..." }) {
  return (
    <input
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className="pa-search-input"
    />
  );
}
