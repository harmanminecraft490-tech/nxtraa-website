"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  MessageCircle,
  Clock,
  Send,
  CheckCircle2,
  MapPin,
  HelpCircle,
  ChevronDown,
} from "lucide-react";

import AnnouncementBar from "../components/layout/announcementbar";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/footer";

const FAQ_ITEMS = [
  {
    question: "How can I track my order?",
    answer: "You can track your order by visiting our Track Order page and entering your order number. You will also receive tracking updates via email and WhatsApp.",
  },
  {
    question: "What is your return policy?",
    answer: "We offer a 7-day replacement policy for defective or damaged products. Please contact our support team within 7 days of delivery with your order number and photographic evidence.",
  },
  {
    question: "How long does delivery take?",
    answer: "Metro cities: 3-5 business days. Tier 2 cities: 5-7 business days. Other locations: 7-10 business days. Free shipping on orders above ₹999.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept UPI (Google Pay, PhonePe, Paytm), credit cards, debit cards, and Cash on Delivery (COD) for select pin codes.",
  },
  {
    question: "Do you offer bulk or wholesale orders?",
    answer: "Yes, we offer special pricing for bulk orders. Please contact us via WhatsApp or email with your requirements.",
  },
];

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate form submission (in production, connect to an API endpoint)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSubmitted(true);
    setSubmitting(false);
    setFormState({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="min-h-screen min-h-dvh bg-canvas">
        <div className="page-wrap section-space !pt-10">
          {/* Header */}
          <div className="section-header">
            <p className="eyebrow">Get in touch</p>
            <h1 className="section-title mt-3 text-ink-950">Contact Us</h1>
            <p className="body-copy mt-4 max-w-xl mx-auto">
              Have a question about your order, need product support, or want to
              partner with us? We&apos;d love to hear from you.
            </p>
          </div>

          <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_400px]">
            {/* Contact Form */}
            <div>
              <div className="rounded-2xl border border-line bg-white p-6 sm:p-8">
                <h2 className="text-xl font-black text-ink-950">Send us a message</h2>
                <p className="mt-2 text-sm text-ink-500">
                  Fill out the form below and we&apos;ll get back to you within 24 hours.
                </p>

                {submitted ? (
                  <div className="mt-8 rounded-2xl bg-green-50 p-8 text-center">
                    <CheckCircle2 size={48} className="mx-auto text-green-500" />
                    <h3 className="mt-4 text-lg font-bold text-ink-950">Message Sent!</h3>
                    <p className="mt-2 text-sm text-ink-600">
                      Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="mt-4 text-sm font-bold text-accent hover:underline"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-bold text-ink-700 pl-1">
                          Your Name
                        </label>
                        <input
                          type="text"
                          required
                          value={formState.name}
                          onChange={(e) =>
                            setFormState((f) => ({ ...f, name: e.target.value }))
                          }
                          className="input-premium"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-bold text-ink-700 pl-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={formState.email}
                          onChange={(e) =>
                            setFormState((f) => ({ ...f, email: e.target.value }))
                          }
                          className="input-premium"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold text-ink-700 pl-1">
                        Subject
                      </label>
                      <select
                        required
                        value={formState.subject}
                        onChange={(e) =>
                          setFormState((f) => ({ ...f, subject: e.target.value }))
                        }
                        className="input-premium"
                      >
                        <option value="">Select a topic</option>
                        <option value="order">Order Issue</option>
                        <option value="return">Return / Replacement</option>
                        <option value="product">Product Question</option>
                        <option value="shipping">Shipping Inquiry</option>
                        <option value="wholesale">Wholesale / Bulk Order</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold text-ink-700 pl-1">
                        Message
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={formState.message}
                        onChange={(e) =>
                          setFormState((f) => ({ ...f, message: e.target.value }))
                        }
                        className="input-premium resize-none"
                        placeholder="Tell us how we can help..."
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Contact Info Sidebar */}
            <div className="space-y-6">
              {/* Contact Details */}
              <div className="rounded-2xl border border-line bg-white p-6">
                <h3 className="text-lg font-black text-ink-950">Contact Information</h3>
                <div className="mt-5 space-y-4">
                  <a
                    href="https://wa.me/919999653622"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-ink-600 hover:text-accent transition"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                      <MessageCircle size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-ink-950">WhatsApp</p>
                      <p>+91 99996 53622</p>
                    </div>
                  </a>
                  <a
                    href="mailto:support@nxtraa.online"
                    className="flex items-center gap-3 text-sm text-ink-600 hover:text-accent transition"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                      <Mail size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-ink-950">Email</p>
                      <p>support@nxtraa.online</p>
                    </div>
                  </a>
                  <div className="flex items-center gap-3 text-sm text-ink-600">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-ink-950">Website</p>
                      <p>nxtraa.online</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-ink-600">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-ink-950">Business Hours</p>
                      <p>Mon – Sat, 10:00 AM – 7:00 PM IST</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Google Maps Placeholder */}
              <div className="rounded-2xl border border-line bg-white overflow-hidden">
                <div className="flex h-48 items-center justify-center bg-canvas text-ink-400">
                  <div className="text-center">
                    <MapPin size={32} className="mx-auto mb-2" />
                    <p className="text-sm font-medium">India</p>
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="rounded-2xl border border-line bg-white p-6">
                <h3 className="flex items-center gap-2 text-lg font-black text-ink-950">
                  <HelpCircle size={20} className="text-accent" />
                  Frequently Asked Questions
                </h3>
                <div className="mt-5 space-y-3">
                  {FAQ_ITEMS.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-line-soft overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedFaq(expandedFaq === index ? null : index)
                        }
                        className="flex w-full items-center justify-between p-4 text-left text-sm font-bold text-ink-950 hover:bg-canvas/50 transition"
                      >
                        {item.question}
                        <ChevronDown
                          size={16}
                          className={`shrink-0 text-ink-400 transition-transform ${
                            expandedFaq === index ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {expandedFaq === index && (
                        <div className="border-t border-line-soft px-4 py-3 text-sm text-ink-600">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
