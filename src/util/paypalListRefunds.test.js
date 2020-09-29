/* eslint camelcase: 0 */
import nock from "nock";
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import paypalListRefunds from "./paypalListRefunds.js";

// eslint-disable-next-line no-undef
jest.mock("./getpaypalInstanceForShop", () => jest.fn().mockImplementation(() => require("paypal")("paypal_API_KEY")));

test("should call paypalApi.methods.listRefunds with the proper parameters and return a properly" +
"formatted list of refunds", async () => {
  const paymentMethod = {
    processor: "paypal",
    displayName: "Visa 4242",
    paymentPluginName: "reaction-paypal",
    method: "credit",
    transactionId: "ch_17iCSlBXXkbZQs3xUpRw24mL",
    amount: 19.99,
    status: "completed",
    mode: "capture",
    createdAt: new Date(),
    workflow: {
      status: "new"
    },
    metadata: {}
  };

  const paypalRefundListResult = {
    object: "list",
    data: [
      {
        id: "re_17iCTeBXXkbZQs3xYZ3iJyB6",
        object: "refund",
        amount: 1999,
        balance_transaction: "txn_17iCTeBXXkbZQs3xl9FKE5an",
        charge: "ch_17iCSlBXXkbZQs3xUpRw24mL",
        created: 1456358130,
        currency: "usd",
        metadata: {},
        reason: null,
        receipt_number: null
      }
    ],
    has_more: false,
    url: "/v1/refunds"
  };

  nock("https://api.paypal.com:443")
    .get("/v1/refunds")
    .reply(200, paypalRefundListResult);

  const result = await paypalListRefunds(mockContext, paymentMethod);

  expect(result.length).toBe(1);
  expect(result[0].type).toBe("refund");
  expect(result[0].amount).toBe(19.99);
  expect(result[0].currency).toBe("usd");
});
