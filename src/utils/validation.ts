export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string, minLength: number = 7): boolean => {
  if (password.length < minLength) {
    return false;
  }

  // Must contain at least one capital letter
  const hasCapitalLetter = /[A-Z]/.test(password);
  
  // Must contain at least one number
  const hasNumber = /[0-9]/.test(password);
  
  // Must contain at least one special character
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  return hasCapitalLetter && hasNumber && hasSpecialChar;
};

export const getPasswordValidationErrors = (password: string): string[] => {
  const errors: string[] = [];
  const minLength = 7;

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one capital letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return errors;
};

export const validateSignupData = (data: {
  name?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.name || !data.name.trim()) {
    errors.push('Name is required');
  }

  if (!data.email || !data.email.trim()) {
    errors.push('Email is required');
  } else if (!validateEmail(data.email)) {
    errors.push('Invalid email format');
  }

  if (!data.phoneNumber || !data.phoneNumber.trim()) {
    errors.push('Phone number is required');
  } else {
    // Dynamic import to avoid circular dependency
    const phoneUtils = require('./phone');
    if (!phoneUtils.validatePhoneNumber(data.phoneNumber)) {
      errors.push('Invalid phone number format');
    }
  }

  if (!data.password) {
    errors.push('Password is required');
  } else {
    const passwordErrors = getPasswordValidationErrors(data.password);
    errors.push(...passwordErrors);
  }

  if (!data.confirmPassword) {
    errors.push('Confirm password is required');
  } else if (data.password !== data.confirmPassword) {
    errors.push('Passwords do not match');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateSigninData = (data: {
  email?: string;
  password?: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.email || !data.email.trim()) {
    errors.push('Email is required');
  } else if (!validateEmail(data.email)) {
    errors.push('Invalid email format');
  }

  if (!data.password) {
    errors.push('Password is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
