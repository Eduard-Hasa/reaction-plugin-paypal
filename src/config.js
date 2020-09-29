import envalid from "envalid";

const { str, testOnly } = envalid;

export default envalid.cleanEnv(
  process.env,
  {
    PAYPAL_MODE: str({
      desc: "the mode sandbox|live",
      devDefault: testOnly("YOUR_PRIVATE_paypal_API_KEY"),
    }),
    PAYPAL_CLIENT_ID: str({
      desc: "A client id paypal API key",
      devDefault: testOnly("YOUR_PRIVATE_paypal_API_KEY"),
    }),
    PAYPAL_CLIENT_SECRET: str({
      desc: "A client secret paypal API key",
      devDefault: testOnly("YOUR_PRIVATE_paypal_API_KEY"),
    }),
  },
  {
    dotEnvPath: null,
  }
);
