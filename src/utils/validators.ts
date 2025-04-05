// Email validation
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Password validation
  export const isValidPassword = (password: string): boolean => {
    // At least 8 characters, with at least one uppercase, one lowercase, and one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };
  
  // Password strength checker
  export const getPasswordStrength = (password: string): {
    score: number; // 0-4, where 0 is weak and 4 is strong
    feedback: string;
  } => {
    if (!password) {
      return { score: 0, feedback: 'Password is required' };
    }
    
    let score = 0;
    const feedback = [];
    
    // Length check
    if (password.length < 8) {
      feedback.push('Password should be at least 8 characters');
    } else {
      score += 1;
    }
    
    // Uppercase letter check
    if (!/[A-Z]/.test(password)) {
      feedback.push('Add an uppercase letter');
    } else {
      score += 1;
    }
    
    // Lowercase letter check
    if (!/[a-z]/.test(password)) {
      feedback.push('Add a lowercase letter');
    } else {
      score += 1;
    }
    
    // Number check
    if (!/\d/.test(password)) {
      feedback.push('Add a number');
    } else {
      score += 1;
    }
    
    // Special character check
    if (!/[^A-Za-z0-9]/.test(password)) {
      feedback.push('Add a special character');
    } else {
      score += 1;
    }
    
    return {
      score: Math.min(4, score),
      feedback: feedback.join('. ')
    };
  };
  
  // Form field validation
  export const validateRequired = (value: any): string | null => {
    if (value === undefined || value === null || value === '') {
      return 'This field is required';
    }
    return null;
  };
  
  export const validateMinLength = (value: string, minLength: number): string | null => {
    if (!value || value.length < minLength) {
      return `Must be at least ${minLength} characters`;
    }
    return null;
  };
  
  export const validateMaxLength = (value: string, maxLength: number): string | null => {
    if (value && value.length > maxLength) {
      return `Must be no more than ${maxLength} characters`;
    }
    return null;
  };
  
  export const validateNumber = (value: string): string | null => {
    if (isNaN(Number(value))) {
      return 'Must be a number';
    }
    return null;
  };
  
  export const validateMinValue = (value: number, min: number): string | null => {
    if (value < min) {
      return `Must be at least ${min}`;
    }
    return null;
  };
  
  export const validateMaxValue = (value: number, max: number): string | null => {
    if (value > max) {
      return `Must be no more than ${max}`;
    }
    return null;
  };
  
  // Date validation
  export const isValidDate = (date: Date): boolean => {
    return date instanceof Date && !isNaN(date.getTime());
  };
  
  export const isDateInFuture = (date: Date): boolean => {
    const now = new Date();
    return date.getTime() > now.getTime();
  };
  
  export const isDateInPast = (date: Date): boolean => {
    const now = new Date();
    return date.getTime() < now.getTime();
  };
  
  export const isDateBefore = (date: Date, beforeDate: Date): boolean => {
    return date.getTime() < beforeDate.getTime();
  };
  
  export const isDateAfter = (date: Date, afterDate: Date): boolean => {
    return date.getTime() > afterDate.getTime();
  };
  
  // Application-specific validations
  export const validateEmployeeId = (employeeId: string): string | null => {
    // Example: Employee ID should be in format EMP-12345
    const regex = /^EMP-\d{5}$/;
    if (!regex.test(employeeId)) {
      return 'Employee ID should be in format EMP-12345';
    }
    return null;
  };
  
  export const validateSeatLabel = (label: string): string | null => {
    // Example: Seat label should be like "A1", "B12", etc.
    const regex = /^[A-Z]\d{1,2}$/;
    if (!regex.test(label)) {
      return 'Seat label should be a letter followed by 1-2 digits (e.g., A1, B12)';
    }
    return null;
  };
  
  export const validateZoneName = (name: string): string | null => {
    if (!name || name.trim() === '') {
      return 'Zone name is required';
    }
    if (name.length < 3) {
      return 'Zone name should be at least 3 characters';
    }
    if (name.length > 50) {
      return 'Zone name should be no more than 50 characters';
    }
    return null;
  };
  
  export const validateHexColor = (color: string): string | null => {
    const regex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!regex.test(color)) {
      return 'Color should be a valid hex code (e.g., #FF5733)';
    }
    return null;
  };
  
  // Form validation helper
  export const validateForm = (formData: Record<string, any>, validations: Record<string, (value: any) => string | null>): {
    isValid: boolean;
    errors: Record<string, string | null>;
  } => {
    const errors: Record<string, string | null> = {};
    let isValid = true;
    
    for (const field in validations) {
      if (Object.prototype.hasOwnProperty.call(validations, field)) {
        const validator = validations[field];
        const value = formData[field];
        const error = validator(value);
        
        errors[field] = error;
        
        if (error) {
          isValid = false;
        }
      }
    }
    
    return { isValid, errors };
  };
  
  export default {
    isValidEmail,
    isValidPassword,
    getPasswordStrength,
    validateRequired,
    validateMinLength,
    validateMaxLength,
    validateNumber,
    validateMinValue,
    validateMaxValue,
    isValidDate,
    isDateInFuture,
    isDateInPast,
    isDateBefore,
    isDateAfter,
    validateEmployeeId,
    validateSeatLabel,
    validateZoneName,
    validateHexColor,
    validateForm
  };