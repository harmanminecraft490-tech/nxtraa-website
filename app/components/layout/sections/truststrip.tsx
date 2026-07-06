import { BadgeCheck, RotateCcw, ShieldCheck, Truck } from "lucide-react";

const perks = [
  { icon: Truck, label: "Free Express Delivery", sub: "On orders Rs. 999+" },
  { icon: ShieldCheck, label: "1 Year Warranty", sub: "Brand assured" },
  { icon: RotateCcw, label: "7-Day Replacement", sub: "Easy returns" },
  { icon: BadgeCheck, label: "Made for India", sub: "Quality guaranteed" },
];

export default function TrustStrip() {
  return (
    <section className="border-b border-line-soft bg-white">
      <div className="page-wrap">
        <div className="grid grid-cols-2 gap-px bg-mist sm:grid-cols-4">
          {perks.map(({ icon: Icon, label, sub }) => (
            <div
              key={label}
              className="flex flex-col items-center bg-white px-4 py-5 text-center sm:px-5 sm:py-8"
            >
              <Icon className="text-accent" size={24} strokeWidth={2} />
              <p className="mt-2 text-xs font-bold leading-snug text-ink-950 sm:mt-3 sm:text-sm">{label}</p>
              <p className="mt-1 text-[10px] font-medium leading-relaxed text-ink-500 sm:mt-1.5 sm:text-xs">{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
