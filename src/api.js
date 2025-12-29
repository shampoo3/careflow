// api.js

const API_URL = "https://careflow-api.onrender.com";

/**
 * GET all patients
 */
export const getPatients = async () => {
  try {
    const res = await fetch(`${API_URL}/patients`);
    if (!res.ok) throw new Error("Failed to fetch patients");
    return await res.json();
  } catch (err) {
    console.error("getPatients error:", err);
    return []; 
  }
};

/**
 * ADD new patient
 */
export const addPatientAPI = async (patient) => {
  try {
    const res = await fetch(`${API_URL}/patients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(patient)
    });

    if (!res.ok) throw new Error("Failed to add patient");
    return await res.json();
  } catch (err) {
    console.error("addPatientAPI error:", err);
    throw err;
  }
};

/**
 * UPDATE patient
 */
export const updatePatientAPI = async (id, patient) => {
  try {
    const res = await fetch(`${API_URL}/patients/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(patient)
    });

    if (!res.ok) throw new Error("Failed to update patient");
  } catch (err) {
    console.error("updatePatientAPI error:", err);
    throw err;
  }
};

/**
 * DELETE patient
 */
export const deletePatientAPI = async (id) => {
  try {
    const res = await fetch(`${API_URL}/patients/${id}`, {
      method: "DELETE"
    });

    if (!res.ok) throw new Error("Failed to delete patient");
  } catch (err) {
    console.error("deletePatientAPI error:", err);
    throw err;
  }
};
