import type { Metadata } from "next";
import { PaymentGatewayCheckout } from "@/components/checkout/payment-gateway-checkout";

export const metadata: Metadata = {
  title: "Secure Checkout | NAVRANG CLOTHING",
  description: "Secure checkout for NAVRANG CLOTHING. Pay instantly using Direct UPI (Google Pay, PhonePe, Paytm, BHIM, QR Code) or Cash on Delivery (COD).",
};

export default function CheckoutPage() {
  return <PaymentGatewayCheckout />;
}
