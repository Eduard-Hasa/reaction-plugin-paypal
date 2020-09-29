import config from "../config.js";
import getPaypalInstance from "./getPaypalInstance.js";

/**
 * @summary Given a shop ID, gets an instance of the paypal API configured with that shop's API key.
 * @param {Object} context The context object
 * @returns {Object} The paypal SDK object
 */
export default async function getpaypalInstanceForShop(context) {
  const { PAYPAL_MODE, PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = config;

  return getPaypalInstance({
    mode: PAYPAL_MODE,
    client_id: PAYPAL_CLIENT_ID,
    client_secret: PAYPAL_CLIENT_SECRET
  });
}
