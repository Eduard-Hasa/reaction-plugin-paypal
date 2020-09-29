/* eslint camelcase: 0 */
import pkg from "../package.json";
import i18n from "./i18n/index.js";
import schemas from "./schemas/index.js";
import queries from "./queries/index.js";
import resolvers from "./resolvers/index.js";
import { paypal_PACKAGE_NAME } from "./util/constants.js";
import paypalCapturePayment from "./util/paypalCapturePayment.js";
import paypalCreateAuthorizedPayment from "./util/paypalCreateAuthorizedPayment.js";
import paypalCreateRefund from "./util/paypalCreateRefund.js";
import paypalListRefunds from "./util/paypalListRefunds.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "paypal Payments",
    name: paypal_PACKAGE_NAME,
    version: pkg.version,
    i18n,
    graphQL: {
      schemas,
      resolvers,
    },
    queries,
    paymentMethods: [
      {
        name: "paypal",
        canRefund: true,
        displayName: "Paypal & Card",
        functions: {
          capturePayment: paypalCapturePayment,
          createAuthorizedPayment: paypalCreateAuthorizedPayment,
          createRefund: paypalCreateRefund,
          listRefunds: paypalListRefunds,
        },
      },
    ],
  });
}
