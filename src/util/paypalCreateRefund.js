import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";
import lodash from "lodash";
import getPaypalInstanceForShop from "./getPaypalInstanceForShop.js";
import paypalActionsAsync from "./paypalActionsAsync.js";
/**
 * @name paypalCreateRefund
 * @method
 * @summary Create a Paypal refund for an order
 * @param {Object} context an object containing the per-request state
 * @param {Object} paymentMethod object containing transaction ID
 * @param {Number} amount the amount to be refunded
 * @return {Object} refund result
 * @private
 */
export default async function paypalCreateRefund(context, paymentMethod, amount) {
  let result;
  /* INFO : paypalCreateRefund */console.info("\n#--| paypalCreateRefund :\n", amount, "\n~~~~~~~~|", (new Date()).toLocaleTimeString(), "\n\n");
  /**
    * TODO GET SaleID From DB
  */
  try {
    /**
      * Paypal Instance
    */
    const paypal = await getPaypalInstanceForShop(context, paymentMethod.shopId);
    /**
      * get Payment
    */
    const payment = await paypalActionsAsync(paypal, "payment", "get", paymentMethod.transactionId);
    /**
      * Get SaleId
    */
    const saleId = lodash.get(payment, "transactions[0].related_resources[0].sale.id");
    if(!saleId){ throw new ReactionError("paypal-refund", "Paypal refund faild the saleId not defined"); }
    /* INFO : saleId */console.info("\n#--| saleId :\n", saleId, "\n~~~~~~~~|", (new Date()).toLocaleTimeString(), "\n\n");

    let opts = {data : {
      "amount": {
          "currency": paymentMethod.currencyCode,
          "total": lodash.round(paymentMethod.amount, 2).toString()
      }
    }};
    const refundResult = await paypalActionsAsync(paypal, "sale", "refund", saleId, opts);
    Logger.debug(refundResult);
    if (refundResult && refundResult.state === "COMPLETED") {
      result = {
        saved: true,
        response: refundResult
      };
    } else {
      result = {
        saved: false,
        response: refundResult
      };
      Logger.warn("Paypal call succeeded but refund not issued");
    }
  } catch (error) {
    Logger.error(error);
    result = {
      saved: false,
      error: `Cannot issue refund: ${error.message}`
    };
    Logger.fatal("Paypal call failed, refund was not issued", error.message);
  }
  throw new ReactionError("paypal-refund",result);
  //return result;
}
