import { SLOTS } from '../data/constants'
import { getFitLevel } from '../utils/fit'
import FitDot from './FitDot'

export default function SquadBoard({ squad, activeSlotId }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {SLOTS.map((slot) => {
        const player = squad[slot.id]
        const isActive = slot.id === activeSlotId
        return (
          <div
            key={slot.id}
            className={`rounded-lg border p-3 text-center transition
              ${isActive ? 'border-fuchsia-400 bg-fuchsia-400/10' : 'border-slate-800 bg-slate-900'}`}
          >
            <div className="text-[11px] uppercase tracking-wider text-slate-500">{slot.label}</div>
            {player ? (
              <div className="mt-1 flex items-center justify-center gap-1.5 text-sm font-medium text-slate-100">
                {player.name}
                <FitDot level={getFitLevel(player, slot.id)} />
              </div>
            ) : (
              <div className="mt-1 text-sm text-slate-600">—</div>
            )}
          </div>
        )
      })}
    </div>
  )
}
