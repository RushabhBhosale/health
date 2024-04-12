import client from "./client";

const endpoint = "/specialist";

const getAllSpecialist = () => client.get(endpoint);

export default { getAllSpecialist };
