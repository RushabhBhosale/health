import client from "./client";
import settings from "../config/settings";

const config = settings();

const authPhoneUrl = config.authPhoneUrl;

const send = (number) => client.get(`${authPhoneUrl}/${number}`);

export default {
  send,
};
