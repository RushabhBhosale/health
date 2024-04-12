import client from "./client";

const endpoint = "/vision";

const getVision = () => client.get(endpoint);

export default { getVision  };