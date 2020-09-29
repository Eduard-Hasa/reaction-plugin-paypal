/* eslint camelcase: 0 */
import nock from "nock";
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import paypalCreateRefund from "./paypalCreateRefund.js";

// eslint-disable-next-line no-undef
jest.mock("./getpaypalInstanceForShop", () => jest.fn().mockImplementation(() => require("paypal")("paypal_API_KEY")));

test("should call paypalApi.methods.createRefund with the proper parameters and return saved = true", async () => {
  const paymentMethod = {
    processor: "paypal",
    displayName: "Visa 4242",
    paymentPluginName: "reaction-paypal",
    method: "credit",
    transactionId: "ch_17hZ4wBXXkbZQs3xL5JhlSgS",
    amount: 19.99,
    status: "completed",
    mode: "capture",
    createdAt: new Date(),
    workflow: { status: "new" },
    metadata: {}
  };

  const paypalRefundResult = {
    id: "re_17hZzSBXXkbZQs3xgmmEeOci",
    object: "refund",
    amount: 1999,
    balance_transaction: "txn_17hZzSBXXkbZQs3xr6d9YECZ",
    charge: "ch_17hZ4wBXXkbZQs3xL5JhlSgS",
    created: 1456210186,
    currency: "usd",
    metadata: {},
    reason: null,
    receipt_number: null
  };

  // paypal Charge Nock
  nock("https://api.paypal.com:443")
    .post("/v1/refunds")
    .reply(200, paypalRefundResult);

  const result = await paypalCreateRefund(mockContext, paymentMethod);

  expect(result.saved).toBe(true);
});
