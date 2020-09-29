/**
 * @summary paypal uses a "Decimal-less" format so 10.00 becomes 1000
 * @param {Number} amount paypal amount
 * @returns {Number} Non-paypal amount
 */
export default function unformatFrompaypal(amount) {
  return (amount / 100);
}
