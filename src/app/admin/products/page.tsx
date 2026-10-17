import { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAuthenticatedAdmin } from "@/lib/admin/auth";
import { DashboardClient } from "@/components/admin/dashboard-client";

export const metadata: Metadata = {
  title: "Product Management Dashboard | NAVRANG CLOTHING",
  description: "Secure administrative dashboard for managing Navrang Clothing products, CSV imports, and gallery media.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminProductsPage() {
  const isAuth = await isAuthenticatedAdmin();

  if (!isAuth) {
    redirect("/admin/login");
  }

  return <DashboardClient />;
}
