import Random from "@reactioncommerce/random";
import getPaypalInstanceForShop from "./getPaypalInstanceForShop.js";
import paypalActionsAsync from "./paypalActionsAsync.js";
import lodash from "lodash";
import ReactionError from "@reactioncommerce/reaction-error";
import { paypal_PACKAGE_NAME } from "./constants.js";

const METHOD = "credit";
const PAYMENT_METHOD_NAME = "paypal";

// NOTE: The "processor" value is lowercased and then prefixed to various payment Meteor method names,
// so for example, if this is "Paypal", the list refunds method is expected to be named "paypal/refund/list"
const PROCESSOR = "Paypal";

// Paypal risk levels mapped to Reaction risk levels
const riskLevelMap = {
  elevated: "elevated",
  highest: "high"
};

/**
 * @summary Given a Reaction shipping address, returns a paypal shipping object. Otherwise returns null.
 * @param {Object} address The shipping address
 * @returns {Object|null} The `shipping` object.
 */
function getpaypalShippingObject(address) {
  if (!address) return null;

  return {
    address: {
      city: address.city,
      country: address.country,
      line1: address.address1,
      line2: address.address2,
      postal_code: address.postal, // eslint-disable-line camelcase
      state: address.region
    },
    name: address.fullName,
    phone: address.phone
  };
}
/**
 * Creates a Paypal charge for a single fulfillment group
 * @param {Object} context The request context
 * @param {Object} input Input necessary to create a payment
 * @returns {Object} The payment object in schema expected by the orders plugin
 */
export default async function paypalCreateAuthorizedPayment(context, input) {
  const { accountId, amount, billingAddress, currencyCode, email, shippingAddress, shopId, paymentData } = input;
  /**
   * Init Paypal
   */
  const paypal = await getPaypalInstanceForShop(context, shopId);

  /**
   * init Execut Payment
   */
  const execute_payment_json = {
    payer_id: paymentData.payerID || paymentData.PayerID,
    transactions: [
      {
        amount: {
          currency: currencyCode,
          total: lodash.round(amount, 2).toString()
        }
      }
    ]
  };
  /**
   * Execute Payment
   * TODO: SAVE RESULT In DB
   */
  const paymentExecuted = await paypalActionsAsync(paypal, "payment", "execute", paymentData.paymentID, {
    data: execute_payment_json
  });
  /**
   * TODO : Check Amount
   */
  let totalPayed = 0;
  paymentExecuted.transactions.forEach((transaction) => (totalPayed += parseFloat(transaction.amount.total)));
  if (lodash.round(totalPayed, 2) < lodash.round(amount, 2)) {
    throw new ReactionError("paypal", "Total to pay " + amount + " & The amounted payed " + totalPayed);
  }
  /**
   * Try To Authorise Payment
   */
  /**
   * Added To Be like Stripe
   */
  paymentExecuted.amount = amount;
  /**
   * Payment Detail
   */
  return {
    _id: Random.id(),
    address: billingAddress,
    amount,
    cardBrand: null,
    createdAt: new Date(paymentExecuted.create_time), // convert S to MS
    data: {
      ...paymentData,
      charge: paymentExecuted,
      gqlType: "PaypalPaymentData" // GraphQL union resolver uses this
    },
    displayName: `${lodash.get(paymentExecuted, "payer.payer_info.first_name")} ${lodash.get(
      paymentExecuted,
      "payer.payer_info.last_name"
    )} - ${lodash.get(paymentExecuted, "payer.payer_info.email")} - ${paymentExecuted.payer.payment_method} `,
    method: paymentExecuted.payer.payment_method || METHOD,
    mode: "authorize",
    name: PAYMENT_METHOD_NAME,
    paymentPluginName: paypal_PACKAGE_NAME,
    processor: PROCESSOR,
    riskLevel: "normal",
    shopId,
    status: "created",
    transactionId: paymentExecuted.id,
    transactions: [paymentExecuted]
  };
}
