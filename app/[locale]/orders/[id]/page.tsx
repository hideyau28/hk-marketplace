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
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <h1 className="text-2xl font-semibold">{t.order.thankYou}</h1>
            <div className="mt-4">
              <p className="text-white/80">{t.order.orderId}</p>
              <p className="mt-1 font-mono text-lg">{id}</p>
            </div>
            <Link
              href={`/${locale}`}
              className="mt-6 inline-block rounded-2xl bg-white px-6 py-3 text-black font-semibold hover:bg-white/90"
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
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-2xl font-semibold">{t.order.thankYou}</h1>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-white/60 text-sm">{t.order.orderId}</p>
              <p className="mt-1 font-mono">{order.id}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm">{t.order.status}</p>
              <p className="mt-1 font-semibold">{order.status}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm">{t.order.customerName}</p>
              <p className="mt-1">{order.customerName}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm">{t.order.phone}</p>
              <p className="mt-1">{order.phone}</p>
            </div>
          </div>

          <div className="mt-6 border-t border-white/10 pt-6">
            <p className="text-white/60 text-sm">{t.order.fulfillmentType}</p>
            <p className="mt-1 font-semibold">
              {order.fulfillmentType === "PICKUP" ? t.order.pickup : t.order.delivery}
            </p>
            {order.fulfillmentType === "DELIVERY" && fulfillmentAddress && (
              <div className="mt-2">
                <p className="text-white/60 text-sm">{t.order.deliveryAddress}</p>
                <p className="mt-1">{fulfillmentAddress.line1}</p>
                {fulfillmentAddress.district && <p className="text-white/80 text-sm">{fulfillmentAddress.district}</p>}
                {fulfillmentAddress.notes && (
                  <p className="mt-1 text-white/60 text-sm">{fulfillmentAddress.notes}</p>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 border-t border-white/10 pt-6">
            <h2 className="font-semibold">{t.order.items}</h2>
            <div className="mt-4 space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-white/80">
                    {item.name} × {item.quantity}
                  </span>
                  <span>
                    {amounts.currency} ${(item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-2 border-t border-white/10 pt-6">
            <div className="flex justify-between">
              <span className="text-white/80">{t.order.subtotal}</span>
              <span>
                {amounts.currency} ${amounts.subtotal.toFixed(2)}
              </span>
            </div>
            {amounts.deliveryFee && (
              <div className="flex justify-between">
                <span className="text-white/80">{t.order.deliveryFee}</span>
                <span>
                  {amounts.currency} ${amounts.deliveryFee.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-white/10 pt-2 text-lg font-semibold">
              <span>{t.order.total}</span>
              <span>
                {amounts.currency} ${amounts.total.toFixed(2)}
              </span>
            </div>
          </div>

          <Link
            href={`/${locale}`}
            className="mt-8 block w-full rounded-2xl bg-white py-4 text-center text-black font-semibold hover:bg-white/90"
          >
            {t.order.backToHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
