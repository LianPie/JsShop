import type { ChangeEvent, FormEvent, HTMLAttributes, ReactNode } from "react";

type AuthFieldInfo = {
    id: string;
    label: string;
    type?: string;
    autoComplete?: string;
    inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
    // Optional: only needed when the parent wants to read the value as you type
    value?: string;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    invalid?: boolean;
    describedBy?: string;
    // Strips anything that isn't 0-9 as you type or paste
    digitsOnly?: boolean;
    maxLength?: number;
    children?: ReactNode;
}

const stripNonDigits = (event: FormEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const digits = input.value.replace(/\D/g, "");
    if (digits !== input.value) input.value = digits;
};

// Label + input used by the login and signup forms.
// Anything passed as children (hints, errors) is shown under the input.
export function AuthField({ id, label, type = "text", autoComplete, inputMode, value, onChange, invalid, describedBy, digitsOnly, maxLength, children }: AuthFieldInfo) {
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={id} className="text-sm font-medium">
                {label}
            </label>
            <input
                id={id}
                name={id}
                type={type}
                inputMode={digitsOnly ? "numeric" : inputMode}
                pattern={digitsOnly ? "[0-9]*" : undefined}
                onInput={digitsOnly ? stripNonDigits : undefined}
                autoComplete={autoComplete}
                maxLength={maxLength}
                value={value}
                onChange={onChange}
                aria-invalid={invalid || undefined}
                aria-describedby={describedBy}
                required
                className="rounded-lg border border-border bg-surface px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 aria-invalid:border-red-500 aria-invalid:focus:ring-red-500/30"
            />
            {children}
        </div>
    );
}

// Accent on the phone's starfield background, primary on desktop's white card
// disabled: while a request is in flight, so it can't be sent twice
export function AuthSubmit({ children, disabled = false }: { children: ReactNode; disabled?: boolean }) {
    return (
        <button
            type="submit"
            disabled={disabled}
            className="mt-2 rounded-lg bg-accent px-6 py-3 font-medium text-nav-fore transition hover:brightness-95 disabled:cursor-wait disabled:opacity-60 md:bg-primary md:text-white md:hover:bg-primary-hover md:hover:brightness-100"
        >
            {children}
        </button>
    );
}
