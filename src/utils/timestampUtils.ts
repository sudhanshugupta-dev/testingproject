/**
 * Timestamp formatting utilities for chat messages
 * Provides consistent formatting for message timestamps with proper localization
 */

import { useTranslation } from 'react-i18next';

export interface TimestampFormatOptions {
  includeTime?: boolean;
  short?: boolean;
  relative?: boolean;
}

/**
 * Format timestamp for message display
 */
export const formatMessageTime = (timestamp?: number | string | Date): string => {
  if (!timestamp) return '';
  
  try {
    const date = new Date(typeof timestamp === 'number' ? timestamp : timestamp);
    
    if (isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  } catch {
    return '';
  }
};

/**
 * Format timestamp for date separators (Today, Yesterday, or date)
 */
export const formatDateSeparator = (timestamp?: number | string | Date): string => {
  if (!timestamp) return '';
  
  try {
    const date = new Date(typeof timestamp === 'number' ? timestamp : timestamp);
    
    if (isNaN(date.getTime())) {
      return '';
    }

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    // Reset time to start of day for accurate comparison
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (messageDate.getTime() === todayDate.getTime()) {
      return 'Today';
    }
    
    if (messageDate.getTime() === yesterdayDate.getTime()) {
      return 'Yesterday';
    }

    // For older dates, show the date
    const diffTime = todayDate.getTime() - messageDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) {
      // Show day of week for this week
      return date.toLocaleDateString([], { weekday: 'long' });
    }
    
    if (date.getFullYear() === today.getFullYear()) {
      // Same year, show month and day
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Different year, show full date
    return date.toLocaleDateString([], { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch {
    return '';
  }
};

/**
 * Format timestamp for last message in chat list
 */
export const formatLastMessageTime = (timestamp?: number | string | Date): string => {
  if (!timestamp) return '';
  
  try {
    const date = new Date(typeof timestamp === 'number' ? timestamp : timestamp);
    
    if (isNaN(date.getTime())) {
      return '';
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 1) {
      return 'now';
    }
    
    if (diffMinutes < 60) {
      return `${diffMinutes}m`;
    }
    
    if (diffHours < 24) {
      return `${diffHours}h`;
    }
    
    if (diffDays === 1) {
      return 'yesterday';
    }
    
    if (diffDays < 7) {
      return `${diffDays}d`;
    }
    
    // For older messages, show date
    const today = new Date();
    if (date.getFullYear() === today.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    return date.toLocaleDateString([], { 
      year: '2-digit', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch {
    return '';
  }
};

/**
 * Format relative time (e.g., "2 minutes ago", "1 hour ago")
 */
export const formatRelativeTime = (timestamp?: number | string | Date): string => {
  if (!timestamp) return '';
  
  try {
    const date = new Date(typeof timestamp === 'number' ? timestamp : timestamp);
    
    if (isNaN(date.getTime())) {
      return '';
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffMs / 60);
    const diffHours = Math.floor(diffMs / 3600);
    const diffDays = Math.floor(diffMs / 86400);

    if (diffSeconds < 60) {
      return 'just now';
    }
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    }
    
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    }
    
    if (diffDays === 1) {
      return 'yesterday';
    }
    
    if (diffDays < 30) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    }
    
    // For very old messages, just show the date
    return formatDateSeparator(timestamp);
  } catch {
    return '';
  }
};

/**
 * Check if two timestamps are on the same day
 */
export const isSameDay = (timestamp1?: number | string | Date, timestamp2?: number | string | Date): boolean => {
  if (!timestamp1 || !timestamp2) return false;
  
  try {
    const date1 = new Date(typeof timestamp1 === 'number' ? timestamp1 : timestamp1);
    const date2 = new Date(typeof timestamp2 === 'number' ? timestamp2 : timestamp2);
    
    if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
      return false;
    }

    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  } catch {
    return false;
  }
};

/**
 * Check if timestamp is today
 */
export const isToday = (timestamp?: number | string | Date): boolean => {
  if (!timestamp) return false;
  return isSameDay(timestamp, new Date());
};

/**
 * Check if timestamp is yesterday
 */
export const isYesterday = (timestamp?: number | string | Date): boolean => {
  if (!timestamp) return false;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(timestamp, yesterday);
};

/**
 * Get time difference in human readable format
 */
export const getTimeDifference = (
  startTime?: number | string | Date,
  endTime?: number | string | Date
): string => {
  if (!startTime || !endTime) return '';
  
  try {
    const start = new Date(typeof startTime === 'number' ? startTime : startTime);
    const end = new Date(typeof endTime === 'number' ? endTime : endTime);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return '';
    }

    const diffMs = Math.abs(end.getTime() - start.getTime());
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'}`;
    }
    
    if (diffHours > 0) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'}`;
    }
    
    if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'}`;
    }
    
    return `${diffSeconds} second${diffSeconds === 1 ? '' : 's'}`;
  } catch {
    return '';
  }
};

/**
 * Format timestamp for detailed view (includes date and time)
 */
export const formatDetailedTimestamp = (timestamp?: number | string | Date): string => {
  if (!timestamp) return '';
  
  try {
    const date = new Date(typeof timestamp === 'number' ? timestamp : timestamp);
    
    if (isNaN(date.getTime())) {
      return '';
    }

    const today = new Date();
    const isCurrentYear = date.getFullYear() === today.getFullYear();
    
    const dateOptions: Intl.DateTimeFormatOptions = isCurrentYear
      ? { month: 'short', day: 'numeric' }
      : { year: 'numeric', month: 'short', day: 'numeric' };
    
    const timeString = date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    
    if (isToday(timestamp)) {
      return `Today at ${timeString}`;
    }
    
    if (isYesterday(timestamp)) {
      return `Yesterday at ${timeString}`;
    }
    
    const dateString = date.toLocaleDateString([], dateOptions);
    return `${dateString} at ${timeString}`;
  } catch {
    return '';
  }
};

/**
 * React hook for timestamp formatting with i18n support
 */
export const useTimestampFormatter = () => {
  const { t } = useTranslation();
  
  const formatMessageTimeLocalized = (timestamp?: number | string | Date): string => {
    return formatMessageTime(timestamp);
  };

  const formatDateSeparatorLocalized = (timestamp?: number | string | Date): string => {
    const formatted = formatDateSeparator(timestamp);
    // You can add translation keys here for localization
    switch (formatted) {
      case 'Today':
        return t('common.today', 'Today');
      case 'Yesterday':
        return t('common.yesterday', 'Yesterday');
      default:
        return formatted;
    }
  };

  const formatLastMessageTimeLocalized = (timestamp?: number | string | Date): string => {
    const formatted = formatLastMessageTime(timestamp);
    if (formatted === 'now') {
      return t('common.now', 'now');
    }
    if (formatted === 'yesterday') {
      return t('common.yesterday', 'yesterday');
    }
    return formatted;
  };

  return {
    formatMessageTime: formatMessageTimeLocalized,
    formatDateSeparator: formatDateSeparatorLocalized,
    formatLastMessageTime: formatLastMessageTimeLocalized,
    formatRelativeTime,
    formatDetailedTimestamp,
    isSameDay,
    isToday,
    isYesterday,
    getTimeDifference,
  };
};
