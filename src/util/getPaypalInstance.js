import paypalNpm from "paypal-rest-sdk";

/**
 * @name getPaypalInstance
 * @param {Object} paypalConfig Paypal API Key, see https://paypal.com/docs/keys
 * @returns {Object} The Paypal SDK object
 */
export default function getPaypalInstance(paypalConfig) {
  paypalNpm.configure(paypalConfig);
  return paypalNpm;
}
