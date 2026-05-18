export default function Searchbar({ value, onchange, placeholder }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onchange(e.target.value)}
      placeholder = { placeholder }
      className="border px-3 py-2 rounded-md w-full"
    />
  );
}