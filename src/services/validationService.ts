export type ValidationResult = {
  ok: boolean;
  message?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRequired(label: string, value: string): ValidationResult {
  if (!value.trim()) {
    return { ok: false, message: `${label} is required` };
  }
  return { ok: true };
}

export function validateEmail(email: string): ValidationResult {
  if (!EMAIL_RE.test(email.trim().toLowerCase())) {
    return { ok: false, message: 'Enter a valid email address' };
  }
  return { ok: true };
}

export function validatePhone(phone: string): ValidationResult {
  const digits = phone.replace(/[^\d]/g, '');
  if (digits.length < 10 || digits.length > 13) {
    return { ok: false, message: 'Enter a valid phone number' };
  }
  return { ok: true };
}

export function validatePositiveNumber(label: string, value: string | number): ValidationResult {
  const num = typeof value === 'number' ? value : Number(value.trim());
  if (!Number.isFinite(num) || num <= 0) {
    return { ok: false, message: `${label} must be greater than 0` };
  }
  return { ok: true };
}

export function validatePositiveInteger(label: string, value: string | number): ValidationResult {
  const num = typeof value === 'number' ? value : Number(value.trim());
  if (!Number.isInteger(num) || num <= 0) {
    return { ok: false, message: `${label} must be a whole number greater than 0` };
  }
  return { ok: true };
}

export function validateFutureDate(input: string): ValidationResult {
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    return { ok: false, message: 'Enter a valid move-in date' };
  }
  const now = new Date();
  if (parsed.getTime() < now.getTime() - 24 * 60 * 60 * 1000) {
    return { ok: false, message: 'Move-in date must be today or later' };
  }
  return { ok: true };
}
