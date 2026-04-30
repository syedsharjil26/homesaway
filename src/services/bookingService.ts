import { BookingPayload } from '@/src/data/bookings';
import { validateFutureDate, validatePhone, validatePositiveNumber, validateRequired } from '@/src/services/validationService';

export function validateBookingInput(payload: BookingPayload) {
  const checks = [
    validateRequired('Full name', payload.requesterName),
    validateRequired('Phone number', payload.phoneNumber),
    validateRequired('Move-in date', payload.moveInDate),
    validateRequired('Budget', payload.budget),
    validatePhone(payload.phoneNumber),
    validateFutureDate(payload.moveInDate),
    validatePositiveNumber('Budget', payload.budget),
  ];
  return checks.find((check) => !check.ok);
}
