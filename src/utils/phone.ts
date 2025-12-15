/**
 * Validate phone number format
 * Supports various formats: +1234567890, 1234567890, (123) 456-7890, etc.
 */
export const validatePhoneNumber = (phone: string): boolean => {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Check if it's a valid phone number
  // At least 10 digits, can have country code with +
  const phoneRegex = /^\+?[1-9]\d{9,14}$/;
  
  return phoneRegex.test(cleaned);
};

/**
 * Format phone number for storage (remove formatting, keep digits and +)
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters except +
  return phone.replace(/[^\d+]/g, '');
};





