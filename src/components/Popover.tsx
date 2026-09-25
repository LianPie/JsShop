"use client";

import { ReactNode, useEffect } from "react";

type PopoverInfo = {
    open: boolean,
    onClose: () => void,
    children: React.ReactNode
}

export default function Popover({ open, onClose, children }: PopoverInfo) {
    useEffect(() => {
        // Nothing to listen for while the panel is closed
        if (!open) return;

        const handleKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };

        document.addEventListener("keydown", handleKey);

        // Cleanup: remove the listener when the panel closes or unmounts
        return () => {
            document.removeEventListener("keydown", handleKey);
        };
    }, [open, onClose]);

    if (!open) {
        return (null)
    }
    return (
        <>
            <div className="fixed inset-0 z-40" onClick={onClose}>

            </div>
            <div className="absolute top-full left-0 mt-2 z-50 w-80 rounded-xl border border-border bg-surface p-4 shadow-lg">
                {children}
            </div>

        </>
    )
}