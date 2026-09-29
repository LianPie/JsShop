// Validation rules shared by the forms (browser) and the API routes (server).
// Keep this file plain TypeScript: no React, no Prisma, so both sides can import it.

// ---------- Password ----------

export const PASSWORD_MIN_LENGTH = 8;
// bcrypt only uses the first 72 bytes, so cap it well below that
export const PASSWORD_MAX_LENGTH = 64;

// One check per rule. The keys match "signup.rules" in site-content.json,
// so the form can pair each check with its label.
export const passwordRules = {
    length: (password: string) => password.length >= PASSWORD_MIN_LENGTH,
    uppercase: (password: string) => /[A-Z]/.test(password),
    lowercase: (password: string) => /[a-z]/.test(password),
};

// The rule names as a type: "length" | "uppercase" | "lowercase"
export type PasswordRule = keyof typeof passwordRules;

// True only when every rule passes (the max length isn't a checklist rule;
// the input's maxLength stops people typing past it)
export function isValidPassword(password: string): boolean {
    return password.length <= PASSWORD_MAX_LENGTH
        && Object.values(passwordRules).every((check) => check(password));
}

// ---------- Phone ----------
// TODO: normalizePhone(input) and isValidPhone(phone)

// ---------- Name ----------

export const NAME_MAX_LENGTH = 50;

// Expects an already-trimmed name
export function isValidName(name: string): boolean {
    return name.length > 0 && name.length <= NAME_MAX_LENGTH;
}
