import type { Metadata } from "next";

import AnnouncementBar from "../components/layout/announcementbar";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/footer";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: "Nxteraa Shipping Policy - Learn about processing times, delivery estimates, tracking, and courier partners.",
  openGraph: {
    title: "Shipping Policy | Nxteraa",
    description: "Learn about processing times, delivery estimates, tracking, and courier partners.",
    url: "https://nxtraa.online/shipping-policy",
    siteName: "Nxteraa",
  },
};

export default function ShippingPolicyPage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="min-h-screen min-h-dvh bg-white">
        <div className="page-wrap section-space !pt-10">
          <div className="mx-auto max-w-3xl">
            <p className="eyebrow">Legal</p>
            <h1 className="section-title mt-3 text-ink-950">Shipping Policy</h1>
            <p className="mt-3 text-sm text-ink-500">
              Last updated: July 2026
            </p>

            <div className="prose-premium mt-10 space-y-8 text-ink-700">
              <section>
                <h2 className="text-xl font-black text-ink-950">1. Processing Time</h2>
                <p className="mt-3 leading-relaxed">
                  All orders are processed within 1-2 business days after payment confirmation. Orders placed on weekends or public holidays will be processed on the next business day. You will receive a dispatch notification via email and/or WhatsApp once your order has been shipped.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">2. Dispatch</h2>
                <p className="mt-3 leading-relaxed">
                  Orders are dispatched from our warehouse in India. Once dispatched, you will receive a tracking number via email and WhatsApp that you can use to track your order in real-time.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">3. Delivery Estimates</h2>
                <p className="mt-3 leading-relaxed">
                  Estimated delivery times vary by location:
                </p>
                <div className="mt-4 rounded-2xl border border-line bg-canvas p-6">
                  <ul className="space-y-3 text-sm">
                    <li className="flex justify-between">
                      <span className="font-bold text-ink-950">Metro Cities (Delhi, Mumbai, Bangalore, etc.)</span>
                      <span className="text-ink-600">3-5 business days</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-bold text-ink-950">Tier 2 Cities</span>
                      <span className="text-ink-600">5-7 business days</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-bold text-ink-950">Other Locations</span>
                      <span className="text-ink-600">7-10 business days</span>
                    </li>
                  </ul>
                </div>
                <p className="mt-3 leading-relaxed">
                  These are estimated timelines and not guaranteed delivery dates. Delivery may take longer during festive seasons, sales events, or due to unforeseen circumstances.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">4. Shipping Charges</h2>
                <p className="mt-3 leading-relaxed">
                  We offer free shipping on all orders above ₹999. For orders below ₹999, a flat shipping fee of ₹79 is charged. The shipping charge is displayed at checkout before you confirm your order.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">5. Courier Partners</h2>
                <p className="mt-3 leading-relaxed">
                  We partner with leading courier services across India to ensure reliable delivery. Our courier partners include Delhivery, BlueDart, DTDC, India Post, and other regional carriers. The courier partner is selected based on your location and availability.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">6. Order Tracking</h2>
                <p className="mt-3 leading-relaxed">
                  You can track your order using the tracking number provided in your dispatch notification. Visit our <a href="/track-order" className="text-accent hover:underline">Track Order</a> page and enter your order number to see the current status of your delivery.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">7. Delivery Delays</h2>
                <p className="mt-3 leading-relaxed">
                  While we strive to deliver your order within the estimated timeline, delays may occur due to:
                </p>
                <ul className="mt-3 space-y-2 list-disc list-inside leading-relaxed">
                  <li>Natural disasters or severe weather conditions</li>
                  <li>Public holidays and festive seasons</li>
                  <li>Courier partner service disruptions</li>
                  <li>Remote or hard-to-reach locations</li>
                  <li>Address verification issues</li>
                </ul>
                <p className="mt-3 leading-relaxed">
                  If your order is significantly delayed, please contact our support team for assistance.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">8. Failed Deliveries</h2>
                <p className="mt-3 leading-relaxed">
                  If a delivery attempt fails due to an incorrect address, unavailability, or refusal to accept, the courier will attempt re-delivery. After 3 failed attempts, the order may be returned to us. In such cases, we will process a refund minus any shipping charges incurred.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">9. Cash on Delivery</h2>
                <p className="mt-3 leading-relaxed">
                  Cash on Delivery (COD) is available for select pin codes. COD orders may require additional verification. Please ensure you have the exact cash amount ready at the time of delivery.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">10. Contact Us</h2>
                <p className="mt-3 leading-relaxed">
                  For shipping-related queries, please contact us:
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
