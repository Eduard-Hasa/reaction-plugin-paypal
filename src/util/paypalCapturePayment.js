import Logger from "@reactioncommerce/logger";
import accounting from "accounting-js";
import paypalCaptureCharge from "./paypalCaptureCharge.js";
import paypalCreateRefund from "./paypalCreateRefund.js";
import formatForPaypal from "./formatForPaypal.js";
import unformatFromPaypal from "./unformatFromPaypal.js";

/**
 * @name paypalCapturePayment
 * @method
 * @summary Capture payment for Paypal payment method
 * @param {Object} context an object containing the per-request state
 * @param {Object} paymentMethod object containing transaction ID
 * @return {Promise} capturing a payment in Paypal
 * @private
 */
export default async function paypalCapturePayment(context, paymentMethod) {
  const captureDetails = {
    amount: formatForPaypal(paymentMethod.amount)
  };

  // 100% discounts are not valid when using Paypal
  // If discount is 100%, capture 100% and then refund 100% of transaction
  if (captureDetails.amount === accounting.unformat(0)) {
    const voidedAmount = unformatFromPaypal(paymentMethod.amount);
    Logger.info(`100% discounts are not valid when using Paypal: ${voidedAmount}`);
    paypalCaptureCharge(context, paymentMethod);

    return paypalCreateRefund(context, paymentMethod, paymentMethod.amount);
  }
  return paypalCaptureCharge(context, paymentMethod);
}
