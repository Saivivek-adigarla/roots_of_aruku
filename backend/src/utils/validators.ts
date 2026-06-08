export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Indian phone number format: 10 digits, starting with 6-9
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
};

export const validatePrice = (price: number): boolean => {
  return Number.isFinite(price) && price > 0;
};

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>]/g, '');
};

export const validateProductName = (name: string): boolean => {
  return name.length >= 3 && name.length <= 255;
};

export const validateDescription = (desc: string): boolean => {
  return desc.length >= 10 && desc.length <= 2000;
};
