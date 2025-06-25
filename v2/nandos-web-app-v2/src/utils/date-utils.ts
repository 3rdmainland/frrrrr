export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * Checks if a date type is valid date
 * @param {Date} date - The date to check against
 * @returns {boolean} True if valid otherwise false
 */
export function isValdDate(date: Date): boolean {
    return !isNaN(date.getTime());
}

/**
 * Returns the date number padded with 0. E.g: 3 -> '03'
 * @param {string | number} str - The date number
 * @returns {string}  The padded number
 */
export function padDateNumber(num: string | number): string {
    return `${num}`.padStart(2, '0');
}

/**
 * Returns a string in the format DD/MM/YYY
 * @param {Date} date - input date
 * @returns {string} The formatted string
 */
export function formatDate(date: Date): string {
    const paddedDay =  padDateNumber(date.getDate());
    const paddedMonth = padDateNumber(date.getMonth() + 1);
    return `${paddedDay}/${paddedMonth}/${date.getFullYear()}`;
}