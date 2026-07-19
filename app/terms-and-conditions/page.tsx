import type { Metadata } from "next";

import AnnouncementBar from "../components/layout/announcementbar";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/footer";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Nxteraa Terms and Conditions - Read the terms governing your use of nxtraa.online and purchase of our products.",
  openGraph: {
    title: "Terms and Conditions | Nxteraa",
    description: "Read the terms governing your use of nxtraa.online and purchase of our products.",
    url: "https://nxtraa.online/terms-and-conditions",
    siteName: "Nxteraa",
  },
};

export default function TermsAndConditionsPage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="min-h-screen min-h-dvh bg-white">
        <div className="page-wrap section-space !pt-10">
          <div className="mx-auto max-w-3xl">
            <p className="eyebrow">Legal</p>
            <h1 className="section-title mt-3 text-ink-950">Terms and Conditions</h1>
            <p className="mt-3 text-sm text-ink-500">
              Last updated: July 2026
            </p>

            <div className="prose-premium mt-10 space-y-8 text-ink-700">
              <section>
                <h2 className="text-xl font-black text-ink-950">1. Acceptance of Terms</h2>
                <p className="mt-3 leading-relaxed">
                  By accessing and using the Nxteraa website (nxtraa.online) and purchasing our products, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our website.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">2. Products</h2>
                <p className="mt-3 leading-relaxed">
                  Nxteraa sells premium mobile accessories including neckbands, earbuds, chargers, cables, power banks, speakers, and other accessories. All products are designed and marketed from India. We strive to display product colors, images, and descriptions as accurately as possible, but slight variations may occur due to screen settings and manufacturing processes.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">3. Orders</h2>
                <p className="mt-3 leading-relaxed">
                  When you place an order, you are making an offer to purchase the product. We reserve the right to accept or decline any order. An order confirmation email does not constitute acceptance — acceptance occurs only when the product is dispatched.
                </p>
                <p className="mt-3 leading-relaxed">
                  We reserve the right to limit the quantity of items purchased per person, per household, or per order.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">4. Pricing</h2>
                <p className="mt-3 leading-relaxed">
                  All prices are listed in Indian Rupees (₹) and are inclusive of applicable taxes unless stated otherwise. We reserve the right to change prices at any time without prior notice. In the event of a pricing error, we may cancel the order and refund any payment made.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">5. Payments</h2>
                <p className="mt-3 leading-relaxed">
                  We accept payments via UPI, credit cards, debit cards, and Cash on Delivery (COD). Online payments are processed securely through Razorpay. Cash on Delivery is available for select pin codes and may involve an additional verification step.
                </p>
                <p className="mt-3 leading-relaxed">
                  For COD orders, payment must be made in full at the time of delivery. We do not accept partial payments.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">6. Shipping</h2>
                <p className="mt-3 leading-relaxed">
                  Orders are typically dispatched within 1-2 business days. Delivery timelines vary by location and are estimates only. We are not responsible for delays caused by courier partners, natural disasters, or other circumstances beyond our control. Please refer to our Shipping Policy for complete details.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">7. Returns and Replacements</h2>
                <p className="mt-3 leading-relaxed">
                  We offer a 7-day replacement policy for defective or damaged products. To initiate a replacement, please contact our support team within 7 days of delivery with your order number and photographic evidence of the issue. Please refer to our Refund Policy for complete details.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">8. Intellectual Property</h2>
                <p className="mt-3 leading-relaxed">
                  All content on this website, including but not limited to text, graphics, logos, images, product descriptions, and software, is the property of Nxteraa and is protected by Indian and international copyright laws. You may not reproduce, distribute, or create derivative works without our express written permission.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">9. User Responsibilities</h2>
                <p className="mt-3 leading-relaxed">
                  By using our website, you agree to:
                </p>
                <ul className="mt-3 space-y-2 list-disc list-inside leading-relaxed">
                  <li>Provide accurate and complete information when creating an account and placing orders</li>
                  <li>Maintain the confidentiality of your account credentials</li>
                  <li>Not use the website for any unlawful purpose</li>
                  <li>Not attempt to gain unauthorized access to any part of the website</li>
                  <li>Not use automated systems to access the website without our permission</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">10. Limitation of Liability</h2>
                <p className="mt-3 leading-relaxed">
                  To the maximum extent permitted by law, Nxteraa shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our products or website. Our total liability shall not exceed the amount paid by you for the specific product giving rise to the claim.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">11. Governing Law and Jurisdiction</h2>
                <p className="mt-3 leading-relaxed">
                  These Terms and Conditions are governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in India.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">12. Changes to Terms</h2>
                <p className="mt-3 leading-relaxed">
                  We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting on this page. Your continued use of the website after any changes constitutes acceptance of the new terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">13. Contact Us</h2>
                <p className="mt-3 leading-relaxed">
                  For questions about these Terms and Conditions, please contact us:
                </p>
                <ul className="mt-3 space-y-2 list-disc list-inside leading-relaxed">
                  <li>Website: <a href="https://nxtraa.online" className="text-accent hover:underline">https://nxtraa.online</a></li>
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
