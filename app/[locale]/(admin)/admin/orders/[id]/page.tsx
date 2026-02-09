import { prisma } from "@/lib/prisma";
import { getAdminTenantId } from "@/lib/tenant";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import OrderStatusUpdate from "./order-status-update";
import PaymentActions from "./payment-actions";
import AdminNotes from "./admin-notes";
import type { Locale } from "@/lib/i18n";
import SidebarToggle from "@/components/admin/SidebarToggle";

type PageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function OrderDetailPage({ params }: PageProps) {
  const { locale, id } = await params;
  const l = locale as Locale;

  const tenantId = await getAdminTenantId();

  // Fetch order with payment attempts (scoped to tenant)
  const order = await prisma.order.findFirst({
    where: { id, tenantId },
    include: {
      paymentAttempts: {
        select: {
          id: true,
          provider: true,
          status: true,
          amount: true,
          currency: true,
          stripeCheckoutSessionId: true,
          stripePaymentIntentId: true,
          stripeChargeId: true,
          failureCode: true,
          failureMessage: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const amounts = order.amounts as any;
  const items = order.items as any[];
  const fulfillmentAddress = order.fulfillmentAddress as any;

  return (
    <div className="p-4 pb-16">
      <div className="flex items-center gap-4 mb-6">
        <SidebarToggle />
        <Link
          href={`/${locale}/admin/orders`}
          className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Orders</span>
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="text-zinc-500 text-sm">Order Details</div>
          <h1 className="mt-1 text-2xl font-semibold text-zinc-900">{order.orderNumber || order.id}</h1>
          <div className="mt-2 text-zinc-500 text-sm">
            Created: {new Date(order.createdAt).toLocaleString()}
          </div>
        </div>
        <a
          href={`/api/admin/orders/${order.id}/receipt`}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
        >
          View Receipt
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6">
          <h3 className="text-lg font-semibold text-zinc-900 mb-4">Customer Information</h3>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-zinc-500">Name</div>
              <div className="text-zinc-900 font-medium">{order.customerName}</div>
            </div>
            <div>
              <div className="text-sm text-zinc-500">Phone</div>
              <div className="text-zinc-900 font-medium">{order.phone}</div>
            </div>
            {order.email && (
              <div>
                <div className="text-sm text-zinc-500">Email</div>
                <div className="text-zinc-900 font-medium">{order.email}</div>
              </div>
            )}
          </div>
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6">
          <h3 className="text-lg font-semibold text-zinc-900 mb-4">Order Status</h3>
          <OrderStatusUpdate
            order={{
              id: order.id,
              status: order.status,
              trackingNumber: order.trackingNumber,
              cancelReason: order.cancelReason,
              refundReason: order.refundReason,
              statusHistory: order.statusHistory,
            }}
            locale={l}
          />
        </div>

        {/* Fulfillment Info */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6">
          <h3 className="text-lg font-semibold text-zinc-900 mb-4">Fulfillment</h3>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-zinc-500">Type</div>
              <div className="text-zinc-900 font-medium">{order.fulfillmentType}</div>
            </div>
            {fulfillmentAddress && order.fulfillmentType === "DELIVERY" && (
              <div>
                <div className="text-sm text-zinc-500">Address</div>
                <div className="text-zinc-900">
                  {fulfillmentAddress.street && <div>{fulfillmentAddress.street}</div>}
                  {fulfillmentAddress.district && <div>{fulfillmentAddress.district}</div>}
                  {fulfillmentAddress.region && <div>{fulfillmentAddress.region}</div>}
                </div>
              </div>
            )}
            {order.note && (
              <div>
                <div className="text-sm text-zinc-500">Note</div>
                <div className="text-zinc-900">{order.note}</div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6">
          <h3 className="text-lg font-semibold text-zinc-900 mb-4">Payment Information</h3>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-zinc-500">Subtotal</div>
              <div className="text-zinc-900 font-medium">
                ${Math.round(amounts.subtotal || 0)}
              </div>
            </div>
            <div>
              <div className="text-sm text-zinc-500">Delivery Fee</div>
              <div className="text-zinc-900 font-medium">
                ${Math.round(amounts.deliveryFee || 0)}
              </div>
            </div>
            <div className="pt-3 border-t border-zinc-200">
              <div className="text-sm text-zinc-500">Total</div>
              <div className="text-xl font-bold text-zinc-900">
                ${Math.round(amounts.total || 0)}
              </div>
            </div>
            {order.paidAt && (
              <div>
                <div className="text-sm text-zinc-500">Paid At</div>
                <div className="text-zinc-900 text-sm">
                  {new Date(order.paidAt).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 mt-6">
        <h3 className="text-lg font-semibold text-zinc-900 mb-4">Order Items</h3>
        <div className="space-y-4">
          {items.map((item: any, index: number) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-zinc-100 last:border-0">
              <div className="flex items-center gap-4">
                {item.imageUrl && (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                )}
                <div>
                  <div className="font-medium text-zinc-900">{item.title}</div>
                  {item.brand && <div className="text-sm text-zinc-500">{item.brand}</div>}
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-zinc-900">
                  ${Math.round(item.price || 0)} × {item.quantity}
                </div>
                <div className="text-sm text-zinc-500">
                  ${Math.round((item.price || 0) * (item.quantity || 1))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Local Payment (FPS/PayMe/Alipay) */}
      {order.paymentMethod && (
        <div className="mt-6">
          <PaymentActions
            orderId={order.id}
            orderStatus={order.status}
            paymentMethod={order.paymentMethod}
            paymentStatus={order.paymentStatus}
            paymentProof={order.paymentProof}
            paymentConfirmedAt={order.paymentConfirmedAt?.toISOString() ?? null}
            paymentConfirmedBy={order.paymentConfirmedBy ?? null}
          />
        </div>
      )}

      {/* Admin Notes */}
      <div className="mt-6">
        <AdminNotes
          orderId={order.id}
          notes={order.adminNotes ? JSON.parse(order.adminNotes) : []}
          locale={l}
        />
      </div>

      {/* Payment Attempts */}
      {order.paymentAttempts.length > 0 && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 mt-6">
          <h3 className="text-lg font-semibold text-zinc-900 mb-4">Payment Attempts</h3>
          <div className="space-y-3">
            {order.paymentAttempts.map((attempt) => (
              <div key={attempt.id} className="p-4 bg-zinc-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-zinc-900">
                    {attempt.provider} - {attempt.status}
                  </span>
                  <span className="text-sm text-zinc-500">
                    {new Date(attempt.createdAt).toLocaleString()}
                  </span>
                </div>
                {attempt.amount && (
                  <div className="text-sm text-zinc-600">
                    Amount: {attempt.currency} {(attempt.amount / 100).toFixed(2)}
                  </div>
                )}
                {attempt.failureMessage && (
                  <div className="text-sm text-red-600 mt-1">
                    Error: {attempt.failureMessage}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
