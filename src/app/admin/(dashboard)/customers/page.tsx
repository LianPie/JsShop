"use client";

import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faPhone,
  faBagShopping,
  faUserCheck,
  faUserSlash,
  faTrash,
  faChevronLeft,
  faChevronRight,
  faSpinner,
  faInbox,
  faTriangleExclamation,
  faCalendarDays,
  faCircleCheck,
  faBan,
} from "@fortawesome/free-solid-svg-icons";

interface CustomerRow {
  id: number;
  userName: string;
  phoneNumber: string;
  status: boolean;
  dateCreated: string;
  orderCount: number;
}

interface PaginatedResponse {
  customers: CustomerRow[];
  totalCustomers: number;
  totalPages: number;
  currentPage: number;
}

type Action = "disable" | "enable" | "delete";

const limit = 12;

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [pending, setPending] = useState<{ customer: CustomerRow; action: Action } | null>(null);
  const [working, setWorking] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchCustomers = useCallback(async (page: number, query: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (query) params.set("search", query);

      const res = await fetch(`/api/customers?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data: PaginatedResponse = await res.json();

      setCustomers(data.customers);
      setTotalPages(data.totalPages || 1);
      setTotalCustomers(data.totalCustomers);
      setCurrentPage(data.currentPage);
    } catch (err) {
      console.error(err);
      setError("Could not load customers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers(currentPage, search);
  }, [currentPage, search, fetchCustomers]);

  const handleConfirm = async () => {
    if (!pending) return;
    const { customer, action } = pending;

    setWorking(true);
    setActionError(null);
    try {
      const res =
        action === "delete"
          ? await fetch(`/api/customers/${customer.id}`, { method: "DELETE" })
          : await fetch(`/api/customers/${customer.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: action === "enable" }),
            });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setActionError(data.message || "Action failed");
        return;
      }

      setPending(null);

      // Deleting the last row on a page: step back one page
      if (action === "delete" && customers.length === 1 && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      } else {
        fetchCustomers(currentPage, search);
      }
    } catch {
      setActionError("An error occurred. Please try again.");
    } finally {
      setWorking(false);
    }
  };

  const handleCancel = useCallback(() => {
    if (working) return;
    setPending(null);
    setActionError(null);
  }, [working]);

  const openAction = (customer: CustomerRow, action: Action) => {
    setActionError(null);
    setPending({ customer, action });
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
          <p className="text-sm text-gray-500">Total Customers: {totalCustomers}</p>
        </div>

        <div className="relative w-full sm:w-72">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
          />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search name or phone..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <FontAwesomeIcon icon={faTriangleExclamation} />
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Customer</th>
              <th className="px-5 py-3 font-semibold">Phone</th>
              <th className="px-5 py-3 font-semibold">Orders</th>
              <th className="px-5 py-3 font-semibold">Account</th>
              <th className="px-5 py-3 font-semibold">Joined</th>
              <th className="px-5 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-500">
                  <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                  Loading customers...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400">
                  <FontAwesomeIcon icon={faInbox} className="mb-2 h-6 w-6" />
                  <p className="text-sm">No customers found.</p>
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                          c.status ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {c.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className={`font-medium ${c.status ? "text-gray-800" : "text-gray-400"}`}>
                          {c.userName}
                        </p>
                        <p className="text-xs text-gray-400">#{c.id}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-2">
                      <FontAwesomeIcon icon={faPhone} className="h-3 w-3 text-gray-400" />
                      {c.phoneNumber}
                    </span>
                  </td>

                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-2">
                      <FontAwesomeIcon icon={faBagShopping} className="h-3 w-3 text-gray-400" />
                      {c.orderCount}
                    </span>
                  </td>

                  <td className="px-5 py-3.5">
                    {c.status ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-200">
                        <FontAwesomeIcon icon={faCircleCheck} className="h-3 w-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-200">
                        <FontAwesomeIcon icon={faBan} className="h-3 w-3" />
                        Disabled
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-2">
                      <FontAwesomeIcon icon={faCalendarDays} className="h-3 w-3 text-gray-400" />
                      {new Date(c.dateCreated).toLocaleDateString()}
                    </span>
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      {c.status ? (
                        <button
                          onClick={() => openAction(c, "disable")}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100"
                        >
                          <FontAwesomeIcon icon={faUserSlash} className="h-3 w-3" />
                          Disable
                        </button>
                      ) : (
                        <button
                          onClick={() => openAction(c, "enable")}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100"
                        >
                          <FontAwesomeIcon icon={faUserCheck} className="h-3 w-3" />
                          Enable
                        </button>
                      )}
                      <button
                        onClick={() => openAction(c, "delete")}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                        title="Delete customer"
                        aria-label={`Delete ${c.userName}`}
                      >
                        <FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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

      {pending && (
        <ConfirmModal
          pending={pending}
          working={working}
          error={actionError}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}

const ACTION_TEXT: Record<
  Action,
  { title: string; button: string; buttonClass: string; iconBg: string }
> = {
  disable: {
    title: "Disable account",
    button: "Disable",
    buttonClass: "bg-amber-600 hover:bg-amber-700",
    iconBg: "bg-amber-100 text-amber-600",
  },
  enable: {
    title: "Enable account",
    button: "Enable",
    buttonClass: "bg-green-600 hover:bg-green-700",
    iconBg: "bg-green-100 text-green-600",
  },
  delete: {
    title: "Delete customer",
    button: "Delete",
    buttonClass: "bg-red-600 hover:bg-red-700",
    iconBg: "bg-red-100 text-red-600",
  },
};

const ACTION_ICON = {
  disable: faUserSlash,
  enable: faUserCheck,
  delete: faTrash,
};

function ConfirmModal({
  pending,
  working,
  error,
  onConfirm,
  onCancel,
}: {
  pending: { customer: CustomerRow; action: Action };
  working: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { customer, action } = pending;
  const text = ACTION_TEXT[action];

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${text.iconBg}`}
          >
            <FontAwesomeIcon icon={ACTION_ICON[action]} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{text.title}</h2>
            <p className="mt-1 text-sm text-gray-600">
              <span className="font-medium text-gray-900">{customer.userName}</span> (
              {customer.phoneNumber})
            </p>

            {action === "disable" && (
              <p className="mt-3 text-sm text-gray-600">
                They will be logged out and won&apos;t be able to sign in until you enable the
                account again.
              </p>
            )}
            {action === "enable" && (
              <p className="mt-3 text-sm text-gray-600">They will be able to sign in again.</p>
            )}
            {action === "delete" && (
              <p className="mt-3 text-sm text-gray-600">
                The account, its saved addresses and sessions will be permanently deleted.{" "}
                {customer.orderCount > 0
                  ? `Their ${customer.orderCount} order${
                      customer.orderCount === 1 ? "" : "s"
                    } will be kept, with the name, phone and delivery address they were placed with.`
                  : "This customer has no orders."}{" "}
                This can&apos;t be undone.
              </p>
            )}
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={working}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={working}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${text.buttonClass}`}
          >
            {working && <FontAwesomeIcon icon={faSpinner} spin />}
            {working ? "Working..." : text.button}
          </button>
        </div>
      </div>
    </div>
  );
}