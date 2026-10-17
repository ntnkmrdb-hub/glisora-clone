import type { Metadata } from "next";
import { PaymentGatewayCheckout } from "@/components/checkout/payment-gateway-checkout";

export const metadata: Metadata = {
  title: "Secure Checkout & Payment Gateway | NAVRANG CLOTHING",
  description: "Secure payment gateway for NAVRANG CLOTHING. Pay instantly using Google Pay, PhonePe, Paytm, BHIM UPI, Cards, Net Banking, and EMIs.",
};

export default function CheckoutPage() {
  return <PaymentGatewayCheckout />;
}
