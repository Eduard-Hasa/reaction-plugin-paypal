import SimpleSchema from "simpl-schema";
import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";
import lodash from "lodash";
import ReactionError from "@reactioncommerce/reaction-error";
import { orderInputSchema, paymentInputSchema } from "/imports/plugins/core/orders/server/no-meteor/simpleSchemas";
import getCartById from "/imports/plugins/core/cart/server/no-meteor/util/getCartById";
import getPaypalInstanceForShop from "./getPaypalInstanceForShop.js";
import paypalActionsAsync from "./paypalActionsAsync.js";

const inputSchema = new SimpleSchema({
  "order": orderInputSchema,
  "payments": {
    type: Array,
    optional: true
  },
  "payments.$": paymentInputSchema
});


/**
 * @method paypalCreatePayment
 * @summary Places an order, authorizing all payments first
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Necessary input. See SimpleSchema
 * @return {Promise<Object>} Object with `GatewayCreatePaymentPayload` property containing the created order
 */
export default async function paypalCreatePayment(context, input) {
  const cleanedInput = inputSchema.clean(input); // add default values and such
  inputSchema.validate(cleanedInput);

  const { order: orderInput, payments: paymentsInput } = cleanedInput;
  /**
    * PaymentInput is Requred
  */
  if (!paymentsInput.length || !paymentsInput[0].amount) {
    throw new ReactionError("payment-required", "Payment info is required");
  }
  /**
    * Init
  */
  const {
    cartId,
    currencyCode,
    fulfillmentGroups,
    shopId
  } = orderInput;
  /**
    * Check AccountId
  */
  const { accountId, userHasPermission } = context;
  const cart = await getCartById(context, cartId, { throwIfNotFound: true });
  if (accountId !== cart.accountId  && !userHasPermission(["owner", "admin"], shopId)) {
    throw new ReactionError("access-denied", "Access Denied");
  }
  /**
    * Amount : TODO CHECK AMOUNT & THINKING TO MULTIPLE PARTIALS PAYMENTS
  */
  const amount = paymentsInput[0].amount;
  const amountRounded = lodash.round(amount, 2);

  /**
    * Paypal Instance
  */
  const paypal = await getPaypalInstanceForShop(context, shopId);
  /**
    * Initializtion Payment
  */
  const { CANONICAL_URL: FRONT_URL } = process.env;
  const currency = currencyCode.toUpperCase();


  /**
    * URLs Init
  */
  const successUrl = FRONT_URL+"/loading";
  const cancelUrl = FRONT_URL+"/cart/checkout";
  /**
    * Init Payment JSON : TODO THINKING TO ADD MORE INFO LIKES : ITEMS, ADDRESS SEE https://github.com/paypal/PayPal-node-SDK/blob/master/samples/payout/create.js
  */
  let create_payment_json = {
    "intent": "authorize",// "order", "sale"
    "payer": { "payment_method": "paypal" /* credit_card */},
    "redirect_urls": {
      "return_url": successUrl,
      "cancel_url": cancelUrl
    },
    "transactions": [{
        "amount": {
            "currency": currency,
            "total": amountRounded
        },
        "description": ""
    }]
  };
  /**
    * Create Payment Paypal : https://github.com/paypal/PayPal-node-SDK/blob/master/samples/payout/create.js
  */
  const payment = await paypalActionsAsync(paypal, "payment", "create", create_payment_json);
  const redirectUrl = payment.links.filter((link) => link.rel == "approval_url")[0].href;

  return {
    payment,
    redirectUrl,
    successUrl,
    cancelUrl
  };
  // Success Back : ?paymentId=PAYID-LTEZRYA50N19779FD384901V&token=EC-9G765413DB087473V&PayerID=EDC9FT8AVECXE
}
