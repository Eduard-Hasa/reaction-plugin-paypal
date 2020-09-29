import Logger from "@reactioncommerce/logger";
import paypalActionsAsync from "./paypalActionsAsync.js";
import getPaypalInstanceForShop from "./getPaypalInstanceForShop.js";

/**
 * @name paypalListRefunds
 * @method
 * @summary List refunds
 * @param {Object} context an object containing the per-request state
 * @param {Object} paymentMethod object containing transaction ID
 * @return {Object} list refunds result
 * @private
 */
export default async function paypalListRefunds(context, paymentMethod) {

  let result = [];
  try {
    /**
      * Paypal Instance
    */
    const paypal = await getPaypalInstanceForShop(context, paymentMethod.shopId);

      //   var listPayment = {
      //     'count': '12',
      //     'start_index': '1'
      // };
      // const payments = await paypalActionsAsync(paypal, "payment", "list", listPayment);
      // /* INFO : payments */console.info("\n#--| payments :\n", payments, "\n~~~~~~~~|", (new Date()).toLocaleTimeString(), "\n\n");

    const payment = await paypalActionsAsync(paypal, "payment", "get", paymentMethod.transactionId);
    /**
      * Get Refunds
    */
    payment.transactions.forEach(transaction => transaction.related_resources.forEach(resource => {
      if (resource.refund) {
        result.push({
          type: resource.refund.state,
          amount: parseFloat(resource.refund.amount.total),
          created: resource.refund.create_time,
          currency: resource.refund.amount.currency,
          raw: resource.refund
        });
      }
    }));
  } catch (error) {
    Logger.error("Encountered an error when trying to list refunds", error.message);
  }
  return result;
}
