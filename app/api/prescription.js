import client from './client';

const endpoint = '/prescription';

const addPrescription = (dataObj) => client.post(endpoint, dataObj);

const getPrescriptionById = (_id) => client.get(endpoint + '/' + _id);

const enablePrescription_Alert = (_id, alertId) => {
  console.log("ENABLE ALERT PAYLOAD", {prescriptionId: _id, alertId: alertId, alert: true});
  return client.post("/prescriptionalert", {prescriptionId: _id, alertId: alertId, alert: true});
}
const disablePrescription_Alert = (_id) => {
  console.log("DISABLE ALERT PAYLOAD", {prescriptionId: _id, alertId: '', alert: false});
  return client.post("/prescriptionalert", {prescriptionId: _id, alertId: '', alert: false});
}

const getPrescriptionByAppointment = (appointmentId) =>
  client.get(endpoint + '/appointment/' + appointmentId);

const getPatientPrescriptions = (patientId) =>
  client.get(endpoint + '/patient/' + patientId);

export default {
  addPrescription,
  getPrescriptionById,
  getPrescriptionByAppointment,
  getPatientPrescriptions,
  enablePrescription_Alert,
  disablePrescription_Alert
};
