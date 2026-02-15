import { prisma } from "@/lib/prisma";
import { getAdminTenantId } from "@/lib/tenant";
import { hasFeature } from "@/lib/plan";
import type { Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n";
import SidebarToggle from "@/components/admin/SidebarToggle";
import { CustomersTable } from "./customers-table";
import Link from "next/link";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; sort?: string }>;
};

export default async function AdminCustomers({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { q, sort } = await searchParams;
  const l = locale as Locale;
  const t = getDict(l);

  const tenantId = await getAdminTenantId();

  // Plan gating — CRM 只限 Pro
  const crmEnabled = await hasFeature(tenantId, "crm");

  if (!crmEnabled) {
    return (
      <div className="p-4 pb-16">
        <div className="flex items-center gap-4 mb-6">
          <SidebarToggle />
          <div>
            <div className="text-zinc-500 text-sm">Admin</div>
            <h1 className="text-2xl font-semibold text-zinc-900">
              {t.admin.customers.title}
            </h1>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 mb-2">
            {t.admin.customers.proFeature}
          </h2>
          <p className="text-zinc-500 mb-6 max-w-md">
            {t.admin.customers.proFeatureDesc}
          </p>
          <Link
            href={`/${locale}/admin/settings`}
            className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
          >
            {t.admin.customers.upgrade}
          </Link>
        </div>
      </div>
    );
  }

  // Fetch orders and aggregate by phone
  const orders = await prisma.order.findMany({
    where: { tenantId },
    select: {
      phone: true,
      customerName: true,
      email: true,
      amounts: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  type CustomerSummary = {
    phone: string;
    customerName: string;
    email: string | null;
    orderCount: number;
    totalSpent: number;
    lastOrderDate: string;
  };

  const customerMap = new Map<string, CustomerSummary>();

  for (const order of orders) {
    const total =
      Number((order.amounts as Record<string, unknown>)?.total) || 0;
    const existing = customerMap.get(order.phone);

    if (!existing) {
      customerMap.set(order.phone, {
        phone: order.phone,
        customerName: order.customerName,
        email: order.email,
        orderCount: 1,
        totalSpent: total,
        lastOrderDate: order.createdAt.toISOString(),
      });
    } else {
      existing.orderCount++;
      existing.totalSpent += total;
    }
  }

  let customers = Array.from(customerMap.values());

  // Server-side search
  if (q) {
    const search = q.toLowerCase();
    customers = customers.filter(
      (c) =>
        c.customerName.toLowerCase().includes(search) ||
        c.phone.toLowerCase().includes(search) ||
        (c.email && c.email.toLowerCase().includes(search))
    );
  }

  // Server-side sort
  if (sort === "totalSpent") {
    customers.sort((a, b) => b.totalSpent - a.totalSpent);
  } else {
    customers.sort(
      (a, b) =>
        new Date(b.lastOrderDate).getTime() -
        new Date(a.lastOrderDate).getTime()
    );
  }

  return (
    <div className="p-4 pb-16">
      <div className="flex items-center gap-4 mb-6">
        <SidebarToggle />
        <div>
          <div className="text-zinc-500 text-sm">Admin</div>
          <h1 className="text-2xl font-semibold text-zinc-900">
            {t.admin.customers.title}
          </h1>
          <div className="text-zinc-500 text-sm">
            {t.admin.customers.subtitle}
          </div>
        </div>
      </div>

      <CustomersTable
        customers={customers}
        locale={l}
        searchQuery={q}
        currentSort={sort}
      />
    </div>
  );
}
