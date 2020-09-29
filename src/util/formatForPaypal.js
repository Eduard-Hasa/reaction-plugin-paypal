/**
 * @summary paypal uses a "Decimal-less" format so 10.00 becomes 1000
 * @param {Number} amount Non-paypal amount
 * @returns {Number} paypal amount
 */
export default function formatForpaypal(amount) {
  return Math.round(amount * 100);
}
