/**
 * Normalizes username: lowercase and no spaces.
 */
export const normalizeUsername = (username: string): string => {
    return username.toLowerCase().trim().replace(/\s+/g, '_');
};

/**
 * Validates basic email format.
 */
export const isValidEmailFormat = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validates if the email domain matches the organization domain.
 */
export const validateEmailDomain = (email: string, domain: string): boolean => {
    const emailDomain = email.split('@')[1];
    if (!emailDomain) return false;
    return emailDomain.toLowerCase() === domain.toLowerCase();
};

/**
 * Validation result helper.
 */
export interface ValidationResult {
    isValid: boolean;
    error?: string;
}
