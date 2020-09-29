import config from "../config.js";

/**
 * @name getPaypalConfigClient
 * @method
 * @memberof Paypal/NoMeteorQueries
 * @summary Query paypal get Client Id
 * @param {Object} context - an object containing the per-request state
 * @param {String} shopId - Shop ID for the shop that owns the restriction
 * @return {Object} paypalConfigClient
 */
export default async function getPaypalConfigClient(context) {
  return {client_id: config.PAYPAL_CLIENT_ID, mode: config.PAYPAL_MODE};
}
