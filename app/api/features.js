import client from "./client";

const endpoint = "/slides";

const getFeatures = () => client.get(endpoint + '/patient');

export default { getFeatures };