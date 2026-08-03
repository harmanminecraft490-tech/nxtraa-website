/**
 * Minimal ambient types for @cashfreepayments/cashfree-js.
 *
 * The official loader ships without TypeScript declarations (it wraps the
 * externally-hosted cashfree.js v3 script), so we declare only the API surface
 * we use. The `checkout` widget behavior is defined by Cashfree's external
 * script; these types describe the loader contract.
 */
declare module "@cashfreepayments/cashfree-js" {
  export type CashfreeMode = "sandbox" | "production";

  export interface CashfreeCheckoutOptions {
    /** Payment session id returned by the server-side order creation API. */
    paymentSessionId: string;
    /**
     * Where to render/redirect the checkout. "_self" renders it as an overlay on
     * the current page; "_top"/"_blank" navigate; an element id embeds it.
     */
    redirectTarget?: string;
    orderId?: string;
  }

  export interface CashfreeSDK {
    checkout(options: CashfreeCheckoutOptions): Promise<unknown>;
  }

  export function load(options: { mode: CashfreeMode }): Promise<CashfreeSDK | null>;
}
