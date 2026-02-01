import { getDict, type Locale } from "@/lib/i18n";
import { getOrderById } from "./actions";
import Link from "next/link";

export default async function OrderPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const t = getDict(locale as Locale);

  const result = await getOrderById(id);

  // If we can't fetch the order (no admin secret or error), show minimal confirmation
  if (!result.ok) {
    return (
      <div className="px-4 py-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center">
            <h1 className="text-2xl font-semibold text-zinc-900">{t.order.thankYou}</h1>
            <div className="mt-4">
              <p className="text-zinc-600">{t.order.orderId}</p>
              <p className="mt-1 font-mono text-lg text-zinc-900">{id}</p>
            </div>
            <Link
              href={`/${locale}`}
              className="mt-6 inline-block rounded-2xl bg-olive-600 px-6 py-3 text-white font-semibold hover:bg-olive-700"
            >
              {t.order.backToHome}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const order = result.data;
  const items = order.items as Array<{ productId: string; name: string; unitPrice: number; quantity: number }>;
  const amounts = order.amounts as {
    subtotal: number;
    deliveryFee?: number;
    total: number;
    currency: string;
  };
  const fulfillmentAddress = order.fulfillmentAddress as
    | { line1: string; district?: string; notes?: string }
    | null
    | undefined;

  return (
    <div className="px-4 py-6">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8">
          <h1 className="text-2xl font-semibold text-zinc-900">{t.order.thankYou}</h1>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-zinc-500 text-sm">{t.order.orderId}</p>
              <p className="mt-1 font-mono text-zinc-900">{order.id}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-sm">{t.order.status}</p>
              <p className="mt-1 font-semibold text-zinc-900">{order.status}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-sm">{t.order.customerName}</p>
              <p className="mt-1 text-zinc-900">{order.customerName}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-sm">{t.order.phone}</p>
              <p className="mt-1 text-zinc-900">{order.phone}</p>
            </div>
          </div>

          <div className="mt-6 border-t border-zinc-200 pt-6">
            <p className="text-zinc-500 text-sm">{t.order.fulfillmentType}</p>
            <p className="mt-1 font-semibold text-zinc-900">
              {order.fulfillmentType === "PICKUP" ? t.order.pickup : t.order.delivery}
            </p>
            {order.fulfillmentType === "DELIVERY" && fulfillmentAddress && (
              <div className="mt-2">
                <p className="text-zinc-500 text-sm">{t.order.deliveryAddress}</p>
                <p className="mt-1 text-zinc-900">{fulfillmentAddress.line1}</p>
                {fulfillmentAddress.district && <p className="text-zinc-700 text-sm">{fulfillmentAddress.district}</p>}
                {fulfillmentAddress.notes && (
                  <p className="mt-1 text-zinc-500 text-sm">{fulfillmentAddress.notes}</p>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 border-t border-zinc-200 pt-6">
            <h2 className="font-semibold text-zinc-900">{t.order.items}</h2>
            <div className="mt-4 space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-zinc-700">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="text-zinc-900">
                    {amounts.currency}${Math.round(item.unitPrice * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-2 border-t border-zinc-200 pt-6">
            <div className="flex justify-between">
              <span className="text-zinc-700">{t.order.subtotal}</span>
              <span className="text-zinc-900">
                {amounts.currency}${Math.round(amounts.subtotal).toLocaleString()}
              </span>
            </div>
            {amounts.deliveryFee && (
              <div className="flex justify-between">
                <span className="text-zinc-700">{t.order.deliveryFee}</span>
                <span className="text-zinc-900">
                  {amounts.currency}${Math.round(amounts.deliveryFee).toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-zinc-200 pt-2 text-lg font-semibold">
              <span className="text-zinc-900">{t.order.total}</span>
              <span className="text-zinc-900">
                {amounts.currency}${Math.round(amounts.total).toLocaleString()}
              </span>
            </div>
          </div>

          <Link
            href={`/${locale}`}
            className="mt-8 block w-full rounded-2xl bg-olive-600 py-4 text-center text-white font-semibold hover:bg-olive-700"
          >
            {t.order.backToHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
