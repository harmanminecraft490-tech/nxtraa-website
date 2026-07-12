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
        {/* All four perks stay on one line on phones (boAt-style strip). */}
        <div className="grid grid-cols-4 gap-px bg-mist">
          {perks.map(({ icon: Icon, label, sub }) => (
            <div
              key={label}
              className="flex flex-col items-center bg-white px-1 py-3.5 text-center sm:px-5 sm:py-8"
            >
              <Icon className="h-[18px] w-[18px] text-accent sm:h-6 sm:w-6" strokeWidth={2} />
              <p className="mt-1.5 text-[9px] font-bold leading-tight text-ink-950 sm:mt-3 sm:text-sm sm:leading-snug">
                {label}
              </p>
              <p className="mt-0.5 text-[8px] font-medium leading-tight text-ink-500 sm:mt-1.5 sm:text-xs sm:leading-relaxed">
                {sub}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
