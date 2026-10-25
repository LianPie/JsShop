"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxesStacked,
  faTruckFast,
  faCircleCheck,
  faCircleXmark,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import siteContent from "@/data/site-content.json"; // adjust path if needed
import { orderStatusKey, type OrderStatus } from "@/lib/order-status";

// Labels come from "orders.status" in site-content.json
const STATUS_LABELS = siteContent.orders.status as Record<OrderStatus, string>;
export const statusLabel = (code: number) => STATUS_LABELS[orderStatusKey(code)];

interface StatusUi {
  icon: IconDefinition;
  badge: string; // read-only pill
  button: string; // clickable action button
}

const STATUS_UI: Record<OrderStatus, StatusUi> = {
  stockChecking: {
    icon: faBoxesStacked,
    badge: "bg-gray-100 text-gray-700 ring-gray-200",
    button: "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100",
  },
  processing: {
    icon: faTruckFast,
    badge: "bg-blue-50 text-blue-700 ring-blue-200",
    button: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
  },
  delivered: {
    icon: faCircleCheck,
    badge: "bg-green-50 text-green-700 ring-green-200",
    button: "border-green-200 bg-green-50 text-green-700 hover:bg-green-100",
  },
  canceled: {
    icon: faCircleXmark,
    badge: "bg-red-50 text-red-700 ring-red-200",
    button: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
  },
};

export const statusUi = (code: number) => STATUS_UI[orderStatusKey(code)];

export function StatusBadge({ code }: { code: number }) {
  const ui = statusUi(code);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${ui.badge}`}
    >
      <FontAwesomeIcon icon={ui.icon} className="h-3 w-3" />
      {statusLabel(code)}
    </span>
  );
}