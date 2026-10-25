"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faUser,
  faPhone,
  faLocationDot,
  faCalendarDays,
  faImage,
  faSpinner,
  faTriangleExclamation,
  faCircleCheck,
  faMoneyBill,
  faCheckDouble,
} from "@fortawesome/free-solid-svg-icons";
import { StatusBadge } from "@/components/admin/orderStatusUi";

interface OrderItemDetails {
  id: number;
  productId: number;
  name: string;
  image: string;
  quantity: number;
  unitPrice: number;
  paymentStatus: boolean;
}

interface OrderDetails {
  id: number;
  status: number;
  dateSubmitted: string;
  userName: string;
  phoneNumber: string;
  address: string;
  zipcode: string;
  items: OrderItemDetails[];
}

interface Props {
  orderId: number | null; // null = closed
  onClose: () => void;
}

export default function OrderDetailsModal({ orderId, onClose }: Props) {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Payment marking
  const [savingIds, setSavingIds] = useState<number[]>([]);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId === null) return;

    let cancelled = false;
    setOrder(null);
    setError(null);
    setPayError(null);
    setSavingIds([]);
    setLoading(true);

    fetch(`/api/orders/${orderId}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "Failed to load order");
        return data as OrderDetails;
      })
      .then((data) => {
        if (!cancelled) setOrder(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  useEffect(() => {
    if (orderId === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [orderId, onClose]);

  const setPaid = async (itemIds: number[], paymentStatus: boolean) => {
    if (!order || itemIds.length === 0) return;

    setPayError(null);
    setSavingIds((prev) => [...prev, ...itemIds]);

    try {
      const res = await fetch(`/api/orders/${order.id}/payments`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemIds, paymentStatus }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setPayError(data.message || "Failed to update payment status");
        return;
      }

      // Update only after the server confirmed
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((i) =>
                itemIds.includes(i.id) ? { ...i, paymentStatus } : i
              ),
            }
          : prev
      );
    } catch {
      setPayError("An error occurred while updating payment status.");
    } finally {
      setSavingIds((prev) => prev.filter((id) => !itemIds.includes(id)));
    }
  };

  if (orderId === null) return null;

  const items = order?.items ?? [];
  const total = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const paidTotal = items
    .filter((i) => i.paymentStatus)
    .reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const paidCount = items.filter((i) => i.paymentStatus).length;
  const unpaidIds = items.filter((i) => !i.paymentStatus).map((i) => i.id);
  const remaining = total - paidTotal;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Order #{orderId}
            </h2>
            {order && <StatusBadge code={order.status} />}
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-12 text-gray-500">
              <FontAwesomeIcon icon={faSpinner} spin />
              Loading order...
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              <FontAwesomeIcon icon={faTriangleExclamation} />
              {error}
            </div>
          )}

          {order && (
            <div className="space-y-6">
              {/* Customer info */}
              <div className="grid gap-3 rounded-lg bg-gray-50 p-4 text-sm sm:grid-cols-2">
                <InfoRow icon={faUser} label="Customer" value={order.userName} />
                <InfoRow icon={faPhone} label="Phone" value={order.phoneNumber} />
                <InfoRow
                  icon={faCalendarDays}
                  label="Submitted"
                  value={new Date(order.dateSubmitted).toLocaleString()}
                />
                <InfoRow
                  icon={faLocationDot}
                  label="Address"
                  value={`${order.address} (${order.zipcode})`}
                />
              </div>

              {/* Items */}
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                    Products ({items.length})
                  </h3>
                  {unpaidIds.length > 0 && (
                    <button
                      onClick={() => setPaid(unpaidIds, true)}
                      disabled={savingIds.length > 0}
                      className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
                    >
                      <FontAwesomeIcon icon={faCheckDouble} className="h-3 w-3" />
                      Mark all as paid
                    </button>
                  )}
                </div>

                {payError && (
                  <div className="mb-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    <FontAwesomeIcon icon={faTriangleExclamation} />
                    {payError}
                  </div>
                )}

                <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
                  {items.map((item) => {
                    const saving = savingIds.includes(item.id);
                    return (
                      <li key={item.id} className="flex items-center gap-4 p-3">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-12 w-12 rounded-md border object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gray-100 text-gray-400">
                            <FontAwesomeIcon icon={faImage} />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-gray-800">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.quantity} × ${item.unitPrice.toFixed(2)}
                          </p>
                        </div>

                        {/* Paid toggle */}
                        <button
                          onClick={() => setPaid([item.id], !item.paymentStatus)}
                          disabled={saving}
                          title={
                            item.paymentStatus
                              ? "Click to mark as unpaid"
                              : "Click to mark as paid"
                          }
                          className={`inline-flex w-28 items-center justify-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-60 ${
                            item.paymentStatus
                              ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                              : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                          }`}
                        >
                          <FontAwesomeIcon
                            icon={
                              saving
                                ? faSpinner
                                : item.paymentStatus
                                ? faCircleCheck
                                : faMoneyBill
                            }
                            spin={saving}
                            className="h-3 w-3"
                          />
                          {item.paymentStatus ? "Paid" : "Mark paid"}
                        </button>

                        <span className="w-20 text-right text-sm font-semibold text-gray-800">
                          ${(item.quantity * item.unitPrice).toFixed(2)}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {/* Totals */}
                <div className="mt-4 space-y-1.5 rounded-lg bg-gray-50 px-4 py-3 text-sm">
                  <div className="flex items-center justify-between text-gray-500">
                    <span>
                      Paid ({paidCount} of {items.length})
                    </span>
                    <span className="font-medium text-green-700">
                      ${paidTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-gray-500">
                    <span>Remaining</span>
                    <span
                      className={`font-medium ${
                        remaining > 0 ? "text-amber-700" : "text-gray-400"
                      }`}
                    >
                      ${remaining.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-200 pt-2">
                    <span className="text-gray-700">Total</span>
                    <span className="text-lg font-bold text-gray-900">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-gray-200 px-6 py-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  badge,
}: {
  icon: typeof faUser;
  label: string;
  value: string;
  badge?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
        <FontAwesomeIcon icon={icon} className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="break-words font-medium text-gray-800">
          {value}
          {badge && (
            <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-normal text-gray-600">
              {badge}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}