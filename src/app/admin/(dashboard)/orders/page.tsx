"use client";

import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faPhone,
  faCalendarDays,
  faChevronLeft,
  faChevronRight,
  faLock,
  faArrowRight,
  faSpinner,
  faInbox,
  faTriangleExclamation,
  faTriangleExclamation as faWarn,
} from "@fortawesome/free-solid-svg-icons";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import {
  ALLOWED_TRANSITIONS,
  DELIVERED_CODE,
  CANCELED_CODE,
} from "@/lib/order-status";
import {
  StatusBadge,
  statusLabel,
  statusUi,
} from "@/components/admin/orderStatusUi";
import OrderDetailsModal from "@/components/admin/OrderDetailsModal";

// Stops the icons flashing huge before the CSS loads.
// Skip these two lines if your root layout already does this.
config.autoAddCss = false;

interface OrderRow {
  id: number;
  status: number;
  dateSubmitted: string;
  userName: string;
  phoneNumber: string;
  customerDeleted: boolean;
}

interface PaginatedResponse {
  orders: OrderRow[];
  totalOrders: number;
  totalPages: number;
  currentPage: number;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Details modal
  const [detailsId, setDetailsId] = useState<number | null>(null);

  // Pending status change that needs confirmation
  const [pending, setPending] = useState<{
    order: OrderRow;
    status: number;
  } | null>(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const limit = 12;

  const fetchOrders = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders?page=${page}&limit=${limit}`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data: PaginatedResponse = await res.json();

      setOrders(data.orders);
      setTotalPages(data.totalPages || 1);
      setTotalOrders(data.totalOrders);
      setCurrentPage(data.currentPage);
    } catch (err) {
      console.error(err);
      setError("Could not load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage, fetchOrders]);

  const handleConfirmChange = async () => {
    if (!pending) return;

    setUpdating(true);
    setUpdateError(null);
    try {
      const res = await fetch(`/api/orders/${pending.order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: pending.status }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setUpdateError(data.message || "Failed to update order");
        return;
      }

      setPending(null);
      fetchOrders(currentPage);
    } catch {
      setUpdateError("An error occurred while updating the order.");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelChange = () => {
    if (updating) return;
    setPending(null);
    setUpdateError(null);
  };

  const closeDetails = useCallback(() => setDetailsId(null), []);

  const pendingIsFinal =
    pending !== null &&
    (pending.status === DELIVERED_CODE || pending.status === CANCELED_CODE);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
        <p className="text-sm text-gray-500">Total Orders: {totalOrders}</p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <FontAwesomeIcon icon={faTriangleExclamation} />
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Order</th>
              <th className="px-5 py-3 font-semibold">Customer</th>
              <th className="px-5 py-3 font-semibold">Phone</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Submitted</th>
              <th className="px-5 py-3 font-semibold">Update status</th>
              <th className="px-5 py-3 text-right font-semibold">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-500">
                  <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                  Loading orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-400">
                  <FontAwesomeIcon icon={faInbox} className="mb-2 h-6 w-6" />
                  <p className="text-sm">No orders found.</p>
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const nextOptions = ALLOWED_TRANSITIONS[order.status] ?? [];
                const date = new Date(order.dateSubmitted);
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3.5">
                      <span className="rounded-md bg-gray-100 px-2 py-1 font-mono text-xs font-semibold text-gray-700">
                        #{order.id}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                          {order.userName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800">
                          {order.userName || "Unknown"}
                        </span>
                        {order.customerDeleted && (
                          <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                            Account deleted
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-2">
                        <FontAwesomeIcon
                          icon={faPhone}
                          className="h-3 w-3 text-gray-400"
                        />
                        {order.phoneNumber}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <StatusBadge code={order.status} />
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-start gap-2">
                        <FontAwesomeIcon
                          icon={faCalendarDays}
                          className="mt-1 h-3 w-3 text-gray-400"
                        />
                        <div>
                          <p className="text-gray-800">
                            {date.toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-400">
                            {date.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Status change buttons */}
                    <td className="px-5 py-3.5">
                      {nextOptions.length === 0 ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                          <FontAwesomeIcon icon={faLock} />
                          Final
                        </span>
                      ) : (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <FontAwesomeIcon
                            icon={faArrowRight}
                            className="h-3 w-3 text-gray-300"
                          />
                          {nextOptions.map((s) => {
                            const ui = statusUi(s);
                            return (
                              <button
                                key={s}
                                onClick={() =>
                                  setPending({ order, status: s })
                                }
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${ui.button}`}
                              >
                                <FontAwesomeIcon
                                  icon={ui.icon}
                                  className="h-3 w-3"
                                />
                                {statusLabel(s)}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setDetailsId(order.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                        title="View details"
                        aria-label={`View order ${order.id}`}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Page <span className="font-semibold">{currentPage}</span> of{" "}
            <span className="font-semibold">{totalPages}</span>
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="h-3 w-3" />
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || loading}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
              <FontAwesomeIcon icon={faChevronRight} className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Details modal */}
      <OrderDetailsModal orderId={detailsId} onClose={closeDetails} />

      {/* Status change confirmation modal */}
      {pending && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={handleCancelChange}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-gray-900">
              Change order status
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Order #{pending.order.id} · {pending.order.userName}
            </p>

            {/* From -> To */}
            <div className="mt-5 flex items-center justify-center gap-3 rounded-lg bg-gray-50 p-4">
              <StatusBadge code={pending.order.status} />
              <FontAwesomeIcon icon={faArrowRight} className="text-gray-400" />
              <StatusBadge code={pending.status} />
            </div>

            {pendingIsFinal && (
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
                <FontAwesomeIcon icon={faWarn} className="mt-0.5" />
                <p>
                  This status is final and can&apos;t be changed afterwards.
                  {pending.status === DELIVERED_CODE &&
                    " Sold counts of the ordered products will be increased."}
                </p>
              </div>
            )}

            {updateError && (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {updateError}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={handleCancelChange}
                disabled={updating}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmChange}
                disabled={updating}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {updating && <FontAwesomeIcon icon={faSpinner} spin />}
                {updating ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}