import { Timestamp } from 'firebase/firestore';

// Date formatting utilities
export const formatDate = (date: Date | Timestamp): string => {
  if (date instanceof Timestamp) {
    date = date.toDate();
  }
  
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date: Date | Timestamp): string => {
  if (date instanceof Timestamp) {
    date = date.toDate();
  }
  
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatTime = (date: Date | Timestamp): string => {
  if (date instanceof Timestamp) {
    date = date.toDate();
  }
  
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatRelativeTime = (date: Date | Timestamp): string => {
  if (date instanceof Timestamp) {
    date = date.toDate();
  }
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffSec < 60) {
    return 'just now';
  } else if (diffMin < 60) {
    return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffDay < 7) {
    return `${diffDay} ${diffDay === 1 ? 'day' : 'days'} ago`;
  } else {
    return formatDate(date);
  }
};

// Number formatting utilities
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(num);
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency
  }).format(amount);
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

// Text formatting utilities
export const capitalize = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const titleCase = (text: string): string => {
  if (!text) return '';
  return text
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
};

export const truncate = (text: string, maxLength: number = 100): string => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const slugify = (text: string): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Special formatters for the application
export const formatUserRole = (role: string): string => {
  switch (role) {
    case 'admin':
      return 'Administrator';
    case 'pm':
      return 'Project Manager';
    case 'doe':
      return 'Department Head';
    case 'employee':
      return 'Employee';
    default:
      return capitalize(role);
  }
};

export const formatSeatStatus = (status: string): string => {
  switch (status) {
    case 'available':
      return 'Available';
    case 'occupied':
      return 'Occupied';
    case 'reserved':
      return 'Reserved';
    case 'maintenance':
      return 'Maintenance';
    default:
      return capitalize(status);
  }
};

export const formatProjectStatus = (status: string): string => {
  switch (status) {
    case 'planning':
      return 'Planning';
    case 'active':
      return 'Active';
    case 'completed':
      return 'Completed';
    default:
      return capitalize(status);
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'available':
    case 'active':
    case 'completed':
      return 'green';
    case 'occupied':
    case 'planning':
      return 'blue';
    case 'reserved':
      return 'yellow';
    case 'maintenance':
      return 'red';
    default:
      return 'gray';
  }
};

export default {
  formatDate,
  formatDateTime,
  formatTime,
  formatRelativeTime,
  formatNumber,
  formatCurrency,
  formatPercentage,
  capitalize,
  titleCase,
  truncate,
  slugify,
  formatUserRole,
  formatSeatStatus,
  formatProjectStatus,
  getStatusColor
};
