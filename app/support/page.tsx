import Link from "next/link";
import { Mail, MessageCircle, Phone } from "lucide-react";

import AnnouncementBar from "../components/layout/announcementbar";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/footer";

export default function SupportPage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="min-h-screen min-h-dvh bg-canvas">
        <div className="mx-auto w-full max-w-[900px] px-5 py-12 sm:px-8">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-accent">Support</p>
          <h1 className="mt-2 text-4xl font-black text-ink-950">How can we help?</h1>
          <p className="mt-3 text-ink-500">Warranty, orders, product questions — we are here for you.</p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              [Phone, "Call us", "Mon–Sat, 10am–7pm", "tel:+911800000000"],
              [Mail, "Email", "support@nxteraa.com", "mailto:support@nxteraa.com"],
              [MessageCircle, "WhatsApp", "Quick chat support", "https://wa.me/911800000000"],
            ].map(([Icon, title, text, href]) => (
              <a
                key={title as string}
                href={href as string}
                className="card-premium p-6 transition hover:border-line"
              >
                <Icon className="text-accent" size={28} strokeWidth={2} />
                <h2 className="mt-4 text-xl font-black text-ink-950">{title as string}</h2>
                <p className="mt-2 text-sm text-ink-500">{text as string}</p>
              </a>
            ))}
          </div>

          <section className="mt-10 card-premium p-6 sm:p-8">
            <h2 className="text-2xl font-black text-ink-950">Common questions</h2>
            <div className="mt-6 space-y-4">
              {[
                ["What is the warranty?", "All Nxteraa products include a 1-year brand warranty."],
                ["How long is delivery?", "Most orders arrive within 2–4 business days."],
                ["Can I return a product?", "Yes — 7-day replacement on eligible items."],
              ].map(([q, a]) => (
                <div key={q} className="rounded-xl bg-canvas p-4">
                  <p className="font-bold text-ink-950">{q}</p>
                  <p className="mt-1 text-sm text-ink-600">{a}</p>
                </div>
              ))}
            </div>
            <Link href="/track-order" className="mt-6 inline-flex font-bold text-accent hover:underline">
              Track an existing order &rarr;
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
