import Logger from "@reactioncommerce/logger";
import lodash from "lodash";
import getPaypalInstanceForShop from "./getPaypalInstanceForShop.js";
import paypalActionsAsync from "./paypalActionsAsync.js";

/**
 * @summary Capture the results of a previous charge
 * @param {object} context - an object containing the per-request state
 * @param {object} payment - object containing info about the previous transaction
 * @returns {object} Object indicating the result, saved = true means success
 * @private
 */
export default async function paypalCaptureCharge(context, payment) {
  const result = { saved: false };

  try {
    /**
     * Init Paypal
     */
    const paypal = await getPaypalInstanceForShop(context, payment.shopId);
    /**
     * init captured Payment
     */
    const capture_details = {
      amount: {
        currency: payment.currencyCode,
        total: lodash.round(payment.amount, 2).toString()
      },
      is_final_capture: true
    };
    /**
     * Capture Payment
     * TODO: SAVE RESULT In DB
     */
    const authorizationID = lodash.get(payment, "transactions.0.transactions.0.related_resources.0.authorization.id");
    var paymentCaptured = {};
    try{
      paymentCaptured = await paypalActionsAsync(paypal, "authorization", "capture", authorizationID, {
        data: capture_details
      });
    }catch(err){
      // Already  Captured
      paymentCaptured = await paypalActionsAsync(paypal, "payment", "get", lodash.get(payment, "data.paymentID"));
      result.isAlreadyCaptured = true;
    }
    result.response = paymentCaptured;
    const state = paymentCaptured.state.toUpperCase();
    if (state === "PENDING") {
      result.errorMessage = paymentCaptured.reason_code || "";
      result.saved = true; //TODO : reCheck If Is Oki Payment
    } else if (state === "APPROVED") {
      result.saved = true;
    } else if (state === "COMPLETED") {
      result.saved = true;
    }
    Logger.info(
      `Paypal Captured paiment state: ${state}, paimentId: ${paymentCaptured.id}, parentPayement: ${paymentCaptured.parent_payement}, payer: ${lodash.get(
        payment,
        "transactions.0.payer.payer_info.first_name"
      )} ${lodash.get(payment, "transactions.0.payer.payer_info.last_name")} - ${lodash.get(
        payment,
        "transactions.0.payer.payer_info.email"
      )}, Amount: ${lodash.get(paymentCaptured, "amount.total")} ${lodash.get(paymentCaptured, "amount.currency")}`
    );
  } catch (error) {
    Logger.error("paypalCaptureCharge", error);
    result.error = error;
    result.errorCode = error.code;
    result.errorMessage = error.message;

    if (error.code === "charge_already_captured") {
      result.isAlreadyCaptured = true;
    }
  }

  return result;
}
