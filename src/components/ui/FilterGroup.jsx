// Pill-style radio group used for filters: thin outline, light type, champagne fill when active.
export default function FilterGroup({ label, options, value, onChange }) {
  return (
    <fieldset>
      <legend className="label-lux">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const v = typeof o === 'string' ? o : o.label
          const active = value === v
          return (
            <button
              key={v}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(v)}
              className={`min-h-11 rounded-full border px-4 py-1.5 text-[13px] pointer-fine:min-h-0 font-light tracking-wide transition-colors duration-500 ease-out ${
                active
                  ? 'border-gold bg-gold text-ink'
                  : 'border-gold/25 text-ivory/75 hover:border-gold/60 hover:text-gold-light'
              }`}
            >
              {v}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
