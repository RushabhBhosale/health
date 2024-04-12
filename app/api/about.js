import client from "./client";

const endpoint = "/about";

const getAboutUs = () => client.get(endpoint);

export default { getAboutUs  };