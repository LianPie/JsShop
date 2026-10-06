"use client";

import { useState } from "react";

type Address = {
  id: number;
  address: string;
  zipcode: string;
};

export default function AddressSelector({
  savedAddresses,
}: {
  savedAddresses: Address[];
}) {
  const [selectedId, setSelectedId] = useState<number | "new">(
    savedAddresses.length > 0 ? savedAddresses[0].id : "new"
  );

  return (
    <div className="flex flex-col gap-4 border-t border-border pt-4">
      <h2 className="text-lg font-medium">Shipping Address</h2>

      {savedAddresses.length > 0 && (
        <div className="flex flex-col gap-2">
          {savedAddresses.map((addr) => (
            <label
              key={addr.id}
              className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition ${
                selectedId === addr.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-surface-hover"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="addressSelection"
                  value={addr.id}
                  checked={selectedId === addr.id}
                  onChange={() => setSelectedId(addr.id)}
                />
                <span className="text-sm">{addr.address} ({addr.zipcode})</span>
              </div>
            </label>
          ))}

          <label
            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
              selectedId === "new"
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-surface-hover"
            }`}
          >
            <input
              type="radio"
              name="addressSelection"
              value="new"
              checked={selectedId === "new"}
              onChange={() => setSelectedId("new")}
            />
            <span className="text-sm font-medium">Add a new address</span>
          </label>
        </div>
      )}

      {selectedId === "new" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <input
              type="text"
              name="newAddress"
              required
              placeholder="Street Address"
              className="w-full rounded-md border border-border bg-background p-2 text-sm"
            />
          </div>
          <div>
            <input
              type="text"
              name="newZipcode"
              required
              placeholder="Zipcode"
              className="w-full rounded-md border border-border bg-background p-2 text-sm"
            />
          </div>
        </div>
      )}

      {/* Hidden input to pass selected existing address ID */}
      <input
        type="hidden"
        name="addressId"
        value={selectedId === "new" ? "" : selectedId}
      />
    </div>
  );
}