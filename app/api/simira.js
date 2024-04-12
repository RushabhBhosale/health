import client from './client';

const endpoint = '/sasmiralab';

const endpoint1 = '/simirapincode';

const findPincode = async (code) => {
    console.log("PINCODE ENTERED = "+code);
    return await client.get(endpoint1 + '/find/'+code);
}
const getProducts = async () => {
    console.log("GETTING SIMIRA PRODUCTS");
    return await client.get(endpoint + '/getAllTests');
}
const addPatient = async (patient) => {
    console.log("REGISTERING A MEMBER ON SIMIRA");
    return await client.post(endpoint + '/patientRegister', patient);
}
const createBooking = (payload) =>
  client.post(endpoint + '/LHRegisterBillAPI', payload);

const appointmentConfirm = (billId, appointmentId) => client.post(endpoint + '/appointmentConfirmAPI', {billId: billId, appointmentId: appointmentId});

export default { findPincode, getProducts, appointmentConfirm, addPatient, createBooking };
