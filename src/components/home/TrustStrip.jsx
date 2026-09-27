const items = ['Tailor-made Trips', 'Visa Assistance', '24/7 WhatsApp Support']

export default function TrustStrip() {
  return (
    <div className="border-y border-hairline bg-linen py-4 sm:py-5">
      <div className="container-lux flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 text-center text-[10.5px] tracking-[0.25em] text-stone uppercase sm:text-[11px] sm:tracking-[0.3em]">
        {items.map((item, i) => (
          <span key={item} className="flex items-center gap-2.5">
            {i > 0 && <span aria-hidden className="text-gold-dark">●</span>}
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
