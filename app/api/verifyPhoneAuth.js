import client from "./client";

import settings from "../config/settings";

const config = settings();

const authPhoneVerifyUrl = config.authPhoneVerifyUrl;

const send = (session_id, otp) => client.post(`${authPhoneVerifyUrl}`, { session_id, otp });
  

export default {
  send,
};
