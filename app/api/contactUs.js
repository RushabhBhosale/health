import client from "./client";

const endpoint = "/contactUs";
const insure_endpoint = "/insurance";

const getContactUs = () => client.get(endpoint);

const postInsurance = (insureObj) => client.post(insure_endpoint, insureObj);

export default { getContactUs, postInsurance  };