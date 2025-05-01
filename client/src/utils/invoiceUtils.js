/**
 * Invoice Utility Functions
 *
 * Common functions for invoice components that handle:
 * - Payment status
 * - Due dates
 * - Seasonal calculations
 * - Date formatting
 * - Notification descriptions
 */

import { formatDistanceToNow } from "date-fns";

/**
 * Determines the payment status of an invoice.
 *
 * @param {Object} invoice - The invoice object with isSent, paymentStatus, and endDate properties
 * @returns {string} - "Paid", "Not Paid", or "Past Due"
 */
export const getPaymentStatus = (invoice) => {
  if (invoice.paymentStatus === "full") {
    return "Paid";
  }

  const endDate = new Date(invoice.endDate);
  const today = new Date();

  if (!invoice.isSent && endDate > today) {
    return "Not Paid";
  }

  return "Past Due";
};

/**
 * Determines the color for payment status.
 *
 * @param {Object} invoice - The invoice object
 * @returns {string} - Color hex code or name
 */
export const getPaymentStatusColor = (invoice) => {
  if (!invoice) return "#000000";

  if (invoice.isSent && invoice.paymentStatus === "full") {
    return "#474849"; // Dark gray for paid invoices
  }

  if (
    !invoice.isSent &&
    new Date() < new Date(invoice.endDate) &&
    invoice.paymentStatus !== "full"
  ) {
    return "none"; // No color for not paid and not yet due
  }

  return "#90080F"; // Red for past due
};

/**
 * Determines the notification type/status for an invoice based on date and sent status.
 *
 * @param {Object} invoice - The invoice object with endDate and isSent properties
 * @returns {string} - "overdue", "highpriority", or "neardue"
 */
export const getNotificationType = (invoice) => {
  if (!invoice) return "unknown";

  const endDate = new Date(invoice.endDate);
  const today = new Date();

  if (endDate < today && invoice.isSent) {
    return "overdue";
  } else if (endDate < today && !invoice.isSent) {
    return "highpriority";
  } else {
    return "neardue";
  }
};

/**
 * Formats the due time for display in notifications.
 *
 * @param {Date|string} endDate - The due date
 * @returns {string} - Formatted date or relative time
 */
export const getDueTime = (endDate) => {
  if (!endDate) return "Unknown";

  const endDateObj = endDate instanceof Date ? endDate : new Date(endDate);
  const now = new Date();
  const msInDay = 1000 * 60 * 60 * 24;
  const daysDiff = (endDateObj - now) / msInDay;

  if (daysDiff >= 0 && daysDiff <= 7) {
    return formatDistanceToNow(endDateObj, { addSuffix: true });
  } else {
    return endDateObj
      .toLocaleDateString("en-US", {
        weekday: "short",
        month: "numeric",
        day: "numeric",
        year: "numeric",
      })
      .replace(/,/g, ".");
  }
};

/**
 * Gets the notification description based on payment status and payee names.
 *
 * @param {string} payStatus - The payment status ("overdue", "neardue", "highpriority")
 * @param {string|Array} names - Names of payees, either as string or array of objects
 * @returns {string} - Descriptive text for notification
 */
export const getNotificationDescription = (payStatus, payers) => {
  if (!payers || (Array.isArray(payers) && payers.length === 0)) {
    return getBaseDescription(payStatus, "unknown recipients");
  }

  const instructorNames = payers
    .filter((payer) => payer.role === "instructor")
    .map((payer) => payer.clientName)
    .filter((name) => name && name.trim() !== "");

  if (instructorNames.length === 0) {
    return getBaseDescription(payStatus, "unknown recipients");
  }

  const formattedNames =
    instructorNames.length === 1
      ? instructorNames[0]
      : `${instructorNames.slice(0, -1).join(", ")}, and ${instructorNames[instructorNames.length - 1]}`;

  return getBaseDescription(payStatus, formattedNames);
};

/**
 * Base function for generating notification descriptions.
 *
 * @param {string} payStatus - The payment status
 * @param {string} names - Formatted names string
 * @returns {string} - Base description text
 */
export const getBaseDescription = (payStatus, names) => {
  if (payStatus === "overdue") {
    return `Payment not recorded 5 days or more since the payment deadline for `;
  } else if (payStatus === "neardue") {
    return `Email has not been sent to ${names} 1 week before the payment deadline for `;
  } else {
    // highpriority
    return `Email has not been sent to ${names} 1 week prior and payment not received 5 days past the deadline for `;
  }
};

/**
 * Determines the season based on the end date of an invoice.
 *
 * @param {Object} invoice - The invoice object with endDate
 * @returns {string} - "Winter", "Summer", "Fall", or "N/A"
 */
export const getSeason = (invoice) => {
  if (!invoice || !invoice.endDate) return "N/A";

  const month = new Date(invoice.endDate).getMonth();
  if (month >= 1 && month <= 4) {
    return "Winter";
  } else if (month >= 5 && month <= 8) {
    return "Summer";
  } else if (month >= 9 && month <= 12) {
    return "Fall";
  } else {
    return "N/A";
  }
};

/**
 * Gets the colors associated with a season.
 *
 * @param {Object} invoice - The invoice object
 * @returns {Array} - Array with background and text colors
 */
export const getSeasonColors = (invoice) => {
  if (!invoice) return ["#ffffff", "#000000"];

  const season = invoice.season || getSeason(invoice);

  if (season === "Winter") {
    return ["#EBF8FF", "#3182CE"]; // Light blue bg, blue text
  } else if (season === "Summer") {
    return ["#FFF5F7", "#D53F8C"]; // Light pink bg, pink text
  } else if (season === "Fall") {
    return ["#FFFAF0", "#DD6B20"]; // Light orange bg, orange text
  } else {
    return ["#e6f7ec", "#008000"]; // Light green bg, green text
  }
};

/**
 * SPECIALIZED DATE FORMATTING FUNCTIONS
 * Different components need different date formats - these functions preserve those formats
 */

/**
 * Formats a date for billing periods in InvoiceStats component (Month Day)
 * Example: "Jan 15"
 *
 * @param {string|Date} dateString - The date to format
 * @returns {string} - Short month and day
 */
export const formatBillingPeriodDate = (isoDate) => {
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return "N/A";
  
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

/**
 * Formats a date for the invoice table (Weekday MM/DD/YYYY)
 * Example: "Mon. 01/15/2023"
 * 
 * @param {string|Date} dateString - The date to format
 * @returns {string} - Weekday, month, day and year with periods
 */
export const formatTableDate = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date";
  
  return date
    .toLocaleDateString("en-US", {
      weekday: "short",
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    })
    .replace(/,/g, ".");
};

/**
 * Formats a date for modal confirmations (MM/DD/YYYY)
 * Example: "01/15/2023"
 * 
 * @param {string|Date} dateString - The date to format
 * @returns {string} - Standard date format with slashes
 */
export const formatModalDate = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date";
  
  return date
    .toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    })
    .replace(/,/g, ".");
};

/**
 * Generic date formatter with default formatting (shorthand version of original formatDate)
 * Example: "Jan 15, 2023"
 * 
 * @param {string|Date} dateString - The date to format
 * @param {Object} options - Optional formatting options
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString, options = {
  month: "short",
  day: "numeric",
  year: "numeric",
}) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date";

  return date.toLocaleDateString("en-US", options);
};
