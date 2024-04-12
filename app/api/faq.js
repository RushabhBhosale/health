import client from "./client";

const endpoint = "/faq";

const getFAQ = () => client.get(endpoint + '/patient');

export default { getFAQ  };