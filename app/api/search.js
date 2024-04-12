import client from "./client";

const endpoint = "/search";

const getAllSearchItems = () => client.get(endpoint);

const addSearchItem = (title) => client.post(endpoint, title);

export default { getAllSearchItems, addSearchItem };
