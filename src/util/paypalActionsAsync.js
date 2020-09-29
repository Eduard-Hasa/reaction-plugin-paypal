import Logger from "@reactioncommerce/logger";
/**
 * @summary Paypal Actions Async
 * @returns {Object|null} The `promise` object.
 */
export default async function paypalActionsAsync(paypal, request, action, data, _opts){
  const opts = _opts || {};
  /**
    * Callback
  */
  const paypalActionsAsyncFunc = function (resolve, reject, error, response) {
    if (error) {
      Logger.error("paypal error when call ", request, "action", action, error.message);
      reject(error);
      return false;
    }
    resolve(response);
  };
  return new Promise((resolve, reject) => {
      /**
        * With Second Data
      */
      if (opts.data) {
        return paypal[request][action](data, opts.data, (error, response) => paypalActionsAsyncFunc(resolve, reject, error, response));
      }
      paypal[request][action](data, (error, response) => paypalActionsAsyncFunc(resolve, reject, error, response));
  });
}
