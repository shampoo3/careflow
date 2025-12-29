const API_URL = "http://localhost:5000/patients";

export const getPatients = async () => {
  const res = await fetch(API_URL);
  return res.json();
};

export const addPatientAPI = async (patient) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patient)
  });
  return res.json();
};

export const updatePatientAPI = async (id, data) => {
  await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
};

export const deletePatientAPI = async (id) => {
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
};