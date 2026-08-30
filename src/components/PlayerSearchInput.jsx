/** A plain name-search box, shared by every draft screen (Classic, Blind,
 * Rotation, Daily, Ultimate) so you can jump straight to a player by typing
 * instead of scanning the whole pool. */
export default function PlayerSearchInput({ value, onChange }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search players by name…"
      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
    />
  )
}
