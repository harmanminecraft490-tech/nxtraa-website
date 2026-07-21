import type { Metadata } from "next";

import AnnouncementBar from "../components/layout/announcementbar";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/footer";

export const metadata: Metadata = {
  title: "Return Policy",
  description: "Nxteraa Return Policy - Learn about our 7-day replacement policy, return eligibility, process, and conditions for returning your order.",
  openGraph: {
    title: "Return Policy | Nxteraa",
    description: "Learn about our 7-day replacement policy, return eligibility, process, and conditions.",
    url: "https://nxtraa.online/return_policy",
    siteName: "Nxteraa",
  },
};

export default function ReturnPolicyPage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="min-h-screen min-h-dvh bg-white">
        <div className="page-wrap section-space !pt-10">
          <div className="mx-auto max-w-3xl">
            <p className="eyebrow">Legal</p>
            <h1 className="section-title mt-3 text-ink-950">Return Policy</h1>
            <p className="mt-3 text-sm text-ink-500">
              Last updated: July 2026
            </p>

            <div className="prose-premium mt-10 space-y-8 text-ink-700">
              <section>
                <h2 className="text-xl font-black text-ink-950">1. Overview</h2>
                <p className="mt-3 leading-relaxed">
                  At Nxteraa, your satisfaction is our priority. We want you to love every purchase you make from us. If something isnt right with your order, were here to help. This Return Policy explains your rights and the process for returning or replacing products purchased on nxtraa.online.
                </p>
                <p className="mt-3 leading-relaxed">
                  By placing an order with Nxteraa, you agree to the terms outlined in this policy. Please read it carefully before making a purchase.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">2. 7-Day Replacement Window</h2>
                <p className="mt-3 leading-relaxed">
                  We offer a <strong>7-day replacement guarantee</strong> from the date of delivery. If you receive a product that is defective, damaged, or does not match what you ordered, you may request a replacement within 7 calendar days of delivery.
                </p>
                <p className="mt-3 leading-relaxed">
                  Requests made after the 7-day period will not be eligible for replacement unless required by applicable consumer law.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">3. Eligibility Criteria</h2>
                <p className="mt-3 leading-relaxed">
                  You may initiate a return or replacement in the following cases:
                </p>
                <ul className="mt-3 space-y-2 list-disc list-inside leading-relaxed">
                  <li><strong>Wrong product:</strong> You received an item different from what you ordered</li>
                  <li><strong>Damaged product:</strong> The product arrived physically damaged due to shipping</li>
                  <li><strong>Manufacturing defect:</strong> The product has a functional defect that affects normal use</li>
                  <li><strong>Missing items:</strong> Your order is missing one or more items from the package</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">4. How to Initiate a Return</h2>
                <p className="mt-3 leading-relaxed">
                  To start a return or replacement request, follow these steps:
                </p>
                <ol className="mt-3 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>Contact us within <strong>7 days</strong> of delivery</li>
                  <li>Provide your <strong>order number</strong> and a brief description of the issue</li>
                  <li>Share <strong>photographic or video evidence</strong> clearly showing the defect, damage, or incorrect item</li>
                  <li>Our support team will review your request within <strong>24 hours</strong></li>
                  <li>If approved, you will receive instructions for the pickup and replacement</li>
                </ol>
                <p className="mt-3 leading-relaxed">
                  You can reach us via email at <a href="mailto:support@nxtraa.online" className="text-accent hover:underline">support@nxtraa.online</a> or WhatsApp at <a href="https://wa.me/919999653622" className="text-accent hover:underline">+91 99996 53622</a>.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">5. Return Process</h2>
                <p className="mt-3 leading-relaxed">
                  Once your return request is approved, here is what happens:
                </p>
                <ul className="mt-3 space-y-2 list-disc list-inside leading-relaxed">
                  <li><strong>Pickup:</strong> We will arrange a free pickup of the item from your delivery address. Our courier partner will contact you to schedule a convenient time.</li>
                  <li><strong>Inspection:</strong> Once we receive the returned item, our team will inspect it to verify the issue. This typically takes 2-3 business days.</li>
                  <li><strong>Replacement:</strong> If the issue is confirmed, we will dispatch a replacement product within 2-3 business days at no additional cost.</li>
                  <li><strong>Notification:</strong> You will receive updates via email and WhatsApp at every stage of the process.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">6. Condition Requirements</h2>
                <p className="mt-3 leading-relaxed">
                  To qualify for a replacement, the returned product must meet the following conditions:
                </p>
                <ul className="mt-3 space-y-2 list-disc list-inside leading-relaxed">
                  <li>The product must be in its <strong>original packaging</strong> with all tags, accessories, and manuals included</li>
                  <li>The product should not show signs of <strong>physical damage caused by misuse</strong>, drops, liquid damage, or unauthorized repairs</li>
                  <li>All <strong>serial numbers and barcodes</strong> must be intact and legible</li>
                  <li>The product must not have been <strong>modified or tampered with</strong> in any way</li>
                </ul>
                <p className="mt-3 leading-relaxed">
                  Failure to meet these conditions may result in the return request being rejected and the product being sent back to you.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">7. Non-Returnable Items</h2>
                <p className="mt-3 leading-relaxed">
                  The following items and situations are <strong>not eligible</strong> for return or replacement:
                </p>
                <ul className="mt-3 space-y-2 list-disc list-inside leading-relaxed">
                  <li>Products returned after the <strong>7-day window</strong></li>
                  <li>Products damaged due to <strong>misuse, negligence, accident, or improper handling</strong></li>
                  <li>Products that have been <strong>used, worn, or installed</strong> beyond basic inspection</li>
                  <li>Products without <strong>original packaging and accessories</strong></li>
                  <li><strong>Consumable items</strong> that have been opened (e.g., screen protectors, skins)</li>
                  <li><strong>Normal wear and tear</strong> or minor cosmetic variations that do not affect functionality</li>
                  <li>Products purchased from <strong>third-party sellers or unauthorized retailers</strong></li>
                  <li><strong>Free promotional items</strong> unless the main product is also being returned</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">8. Refunds After Return</h2>
                <p className="mt-3 leading-relaxed">
                  In most cases, we process a <strong>replacement</strong> rather than a refund. However, a refund may be issued in the following circumstances:
                </p>
                <ul className="mt-3 space-y-2 list-disc list-inside leading-relaxed">
                  <li>The replacement product is also found to be defective</li>
                  <li>The original product is no longer in stock and no equivalent replacement is available</li>
                  <li>You specifically requested a refund and the product has been verified as defective</li>
                </ul>
                <p className="mt-3 leading-relaxed">
                  Refunds are processed to the original payment method within 5-10 business days after the returned product has been inspected and approved. The timeline for the refund to reflect in your account depends on your bank or payment provider.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">9. Shipping Costs</h2>
                <p className="mt-3 leading-relaxed">
                  <strong>Return shipping:</strong> We cover the cost of return shipping for all eligible replacement requests. A free pickup will be arranged by our team.
                </p>
                <p className="mt-3 leading-relaxed">
                  <strong>Original shipping charges:</strong> Shipping charges paid at the time of purchase are non-refundable, except in cases where the wrong product was shipped or the product arrived damaged.
                </p>
                <p className="mt-3 leading-relaxed">
                  <strong>COD charges:</strong> Any Cash on Delivery convenience fees paid are non-refundable.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-black text-ink-950">10. Contact Us</h2>
                <p className="mt-3 leading-relaxed">
                  If you have any questions about this Return Policy or need help with a return request, please contact us:
                </p>
                <ul className="mt-3 space-y-2 list-disc list-inside leading-relaxed">
                  <li>Website: <a href="https://nxtraa.online/support" className="text-accent hover:underline">https://nxtraa.online/support</a></li>
                  <li>Email: <a href="mailto:support@nxtraa.online" className="text-accent hover:underline">support@nxtraa.online</a></li>
                  <li>WhatsApp: <a href="https://wa.me/919999653622" className="text-accent hover:underline">+91 99996 53622</a></li>
                </ul>
                <p className="mt-3 leading-relaxed">
                  Our support team is available Monday to Saturday, 10:00 AM to 7:00 PM IST. We aim to respond to all inquiries within 24 hours.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
