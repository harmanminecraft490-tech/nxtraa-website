import type { Metadata } from "next";

import AnnouncementBar from "../components/layout/announcementbar";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Nxteraa Privacy Policy - Learn how we collect, use, and protect your personal information when you shop on nxtraa.online.",
  openGraph: {
    title: "Privacy Policy | Nxteraa",
    description: "Learn how we collect, use, and protect your personal information when you shop on nxtraa.online.",
    url: "https://nxtraa.online/privacy-policy",
    siteName: "Nxteraa",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="min-h-screen min-h-dvh bg-white">
        <div className="page-wrap section-space !pt-10">
          <div className="mx-auto max-w-3xl">
            <p className="eyebrow">Legal</p>
            <h1 className="section-title mt-3 text-ink-950">Privacy Policy</h1>
            <p className="mt-3 text-sm text-ink-500">
              Last updated: July 2026
            </p>

            <div className="prose-premium mt-10 space-y-8 text-ink-700">
              <section>
                <h2 className="text-xl font-black text-ink-950">1. Introduction</h2>
                <p className="mt-3 leading-relaxed">
                  Nxteraa (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the website nxtraa.online. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and purchase our products.
                </p>
                <p className="mt-3 leading-relaxed">
                  By using our website, you agree to the collection and use of information in accordance with this policy. If you do not agree with the terms of this policy, please do not access the website.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">2. Information We Collect</h2>
                <h3 className="mt-4 text-lg font-bold text-ink-950">Account Information</h3>
                <p className="mt-2 leading-relaxed">
                  When you create an account, we collect your name, email address, and password (stored in encrypted form). This information is necessary to process your orders and provide customer support.
                </p>

                <h3 className="mt-4 text-lg font-bold text-ink-950">Order Information</h3>
                <p className="mt-2 leading-relaxed">
                  When you place an order, we collect your shipping address, phone number, order details, and payment information. Payment details are processed securely through Razorpay and are never stored on our servers.
                </p>

                <h3 className="mt-4 text-lg font-bold text-ink-950">Payment Information</h3>
                <p className="mt-2 leading-relaxed">
                  All payment transactions are processed through Razorpay, a PCI DSS compliant payment gateway. We do not store your credit card numbers, debit card numbers, UPI IDs, or any other payment credentials on our servers.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">3. Cookies and Analytics</h2>
                <p className="mt-3 leading-relaxed">
                  We use cookies to maintain your session and shopping cart. These are essential for the website to function and do not track you across other websites. We also use Vercel Analytics to understand how visitors interact with our website. This analytics data is aggregated and anonymous.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">4. How We Use Your Information</h2>
                <ul className="mt-3 space-y-2 list-disc list-inside leading-relaxed">
                  <li>To process and fulfill your orders</li>
                  <li>To send order confirmations and shipping updates</li>
                  <li>To provide customer support</li>
                  <li>To improve our website and products</li>
                  <li>To detect and prevent fraud</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">5. Information Sharing</h2>
                <p className="mt-3 leading-relaxed">
                  We share your information only with third parties necessary to fulfill your order:
                </p>
                <ul className="mt-3 space-y-2 list-disc list-inside leading-relaxed">
                  <li><strong>Razorpay</strong> — for payment processing</li>
                  <li><strong>Courier partners</strong> — for order delivery (name, address, phone number)</li>
                  <li><strong>Vercel</strong> — for website hosting and analytics</li>
                </ul>
                <p className="mt-3 leading-relaxed">
                  We do not sell, trade, or rent your personal information to third parties for marketing purposes.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">6. Data Security</h2>
                <p className="mt-3 leading-relaxed">
                  We implement industry-standard security measures to protect your personal information. All data transmission is encrypted using SSL/TLS. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">7. Data Retention</h2>
                <p className="mt-3 leading-relaxed">
                  We retain your account information for as long as your account is active. Order information is retained for a minimum of 5 years as required by Indian tax and business regulations. You may request deletion of your account by contacting us.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">8. Your Rights</h2>
                <p className="mt-3 leading-relaxed">
                  Under Indian data protection laws, you have the right to:
                </p>
                <ul className="mt-3 space-y-2 list-disc list-inside leading-relaxed">
                  <li>Access the personal information we hold about you</li>
                  <li>Request correction of inaccurate information</li>
                  <li>Request deletion of your personal information</li>
                  <li>Opt out of non-essential communications</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">9. Children&apos;s Privacy</h2>
                <p className="mt-3 leading-relaxed">
                  Our website is not intended for children under 18 years of age. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">10. Changes to This Policy</h2>
                <p className="mt-3 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">11. Contact Us</h2>
                <p className="mt-3 leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us:
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
