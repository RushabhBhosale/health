import client from "./client";

const endpoint = "/privacyPolicy";

const getPrivacyPolicy = () => client.get(endpoint);

export default { getPrivacyPolicy  };