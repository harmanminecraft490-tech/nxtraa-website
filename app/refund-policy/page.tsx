import type { Metadata } from "next";

import AnnouncementBar from "../components/layout/announcementbar";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/footer";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Nxteraa Refund Policy - Learn about our 7-day replacement policy, refund process, and cancellation terms.",
  openGraph: {
    title: "Refund Policy | Nxteraa",
    description: "Learn about our 7-day replacement policy, refund process, and cancellation terms.",
    url: "https://nxtraa.online/refund-policy",
    siteName: "Nxteraa",
  },
};

export default function RefundPolicyPage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="min-h-screen min-h-dvh bg-white">
        <div className="page-wrap section-space !pt-10">
          <div className="mx-auto max-w-3xl">
            <p className="eyebrow">Legal</p>
            <h1 className="section-title mt-3 text-ink-950">Refund Policy</h1>
            <p className="mt-3 text-sm text-ink-500">
              Last updated: July 2026
            </p>

            <div className="prose-premium mt-10 space-y-8 text-ink-700">
              <section>
                <h2 className="text-xl font-black text-ink-950">1. Cancellation Before Shipment</h2>
                <p className="mt-3 leading-relaxed">
                  If you wish to cancel your order before it has been shipped, please contact our support team immediately. Orders cancelled before dispatch will receive a full refund to the original payment method within 5-7 business days.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">2. 7-Day Replacement Policy</h2>
                <p className="mt-3 leading-relaxed">
                  We offer a 7-day replacement policy from the date of delivery. If you receive a wrong product, a damaged item, or a product with a manufacturing defect, you are eligible for a replacement. To initiate a replacement:
                </p>
                <ul className="mt-3 space-y-2 list-disc list-inside leading-relaxed">
                  <li>Contact our support team within 7 days of delivery</li>
                  <li>Provide your order number and photographic evidence of the issue</li>
                  <li>Our team will review your request within 24 hours</li>
                  <li>If approved, we will arrange a free pickup and dispatch a replacement</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">3. Wrong Product</h2>
                <p className="mt-3 leading-relaxed">
                  If you receive a product different from what you ordered, we will arrange a free pickup of the incorrect item and dispatch the correct product at no additional cost. Please keep the original packaging and tags intact.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">4. Damaged Product</h2>
                <p className="mt-3 leading-relaxed">
                  If your product arrives damaged due to shipping, please document the damage with photographs and contact us within 48 hours of delivery. We will arrange a replacement at no additional cost.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">5. Manufacturing Defects</h2>
                <p className="mt-3 leading-relaxed">
                  Products with manufacturing defects are eligible for replacement within 7 days of delivery. This covers functional defects that affect the normal use of the product. Cosmetic variations that do not affect functionality are not considered defects.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">6. Refund Processing</h2>
                <p className="mt-3 leading-relaxed">
                  Refunds are processed to the original payment method:
                </p>
                <ul className="mt-3 space-y-2 list-disc list-inside leading-relaxed">
                  <li><strong>UPI:</strong> 3-5 business days</li>
                  <li><strong>Credit/Debit Card:</strong> 5-10 business days</li>
                  <li><strong>COD:</strong> Refund via bank transfer within 7-10 business days (bank details required)</li>
                </ul>
                <p className="mt-3 leading-relaxed">
                  Refund timelines may vary depending on your bank or payment provider.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">7. Cases Not Eligible for Refund</h2>
                <p className="mt-3 leading-relaxed">
                  The following are not eligible for replacement or refund:
                </p>
                <ul className="mt-3 space-y-2 list-disc list-inside leading-relaxed">
                  <li>Requests made after 7 days of delivery</li>
                  <li>Products damaged due to misuse, negligence, or unauthorized modifications</li>
                  <li>Products without original packaging and tags</li>
                  <li>Products used in a manner inconsistent with their intended purpose</li>
                  <li>Normal wear and tear</li>
                  <li>Minor cosmetic variations that do not affect functionality</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">8. Contact Us</h2>
                <p className="mt-3 leading-relaxed">
                  To initiate a replacement or refund, please contact us:
                </p>
                <ul className="mt-3 space-y-2 list-disc list-inside leading-relaxed">
                  <li>Website: <a href="https://nxtraa.online/support" className="text-accent hover:underline">https://nxtraa.online/support</a></li>
                  <li>Email: <a href="mailto:support@nxtraa.online" className="text-accent hover:underline">support@nxtraa.online</a></li>
                  <li>WhatsApp: <a href="https://wa.me/919999653622" className="text-accent hover:underline">+91 99996 53622</a></li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
