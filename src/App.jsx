import { useEffect, useState, useRef } from "react";
import {
  getPatients,
  addPatientAPI,
  updatePatientAPI,
  deletePatientAPI
} from "./api";
import "./App.css";

const LOGGED_IN_DOCTOR = "Dr. Sharma";

const DOCTORS = [
  "Dr. Sharma",
  "Dr. Mehta",
  "Dr. Rao",
  "Dr. Banerjee"
];

function App() {
  /* ------------------- GLOBAL STATES ------------------- */
  const [darkMode, setDarkMode] = useState(false);
  const [userRole, setUserRole] = useState("admin");
  const [patientSearch, setPatientSearch] = useState("");

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [doctorFilter, setDoctorFilter] = useState("all");

  /* ------------------- FORM STATES ------------------- */
  const [editingPatient, setEditingPatient] = useState(null);
  const [name, setName] = useState("");
  const [condition, setCondition] = useState("");
  const [priority, setPriority] = useState("");
  const [doctor, setDoctor] = useState("");
  const [lastVisit, setLastVisit] = useState("");

  /* ------------------- INLINE EDIT STATES ------------------- */
  const [inlineEditId, setInlineEditId] = useState(null);
  const [tempPatient, setTempPatient] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);

  /* ------------------- EFFECTS ------------------- */
  useEffect(() => {
    getPatients().then(data => {
      setPatients(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    document.body.className = darkMode ? "dark" : "";
  }, [darkMode]);

  useEffect(() => {
    setPatientSearch("");
  }, [userRole]);

  /* ------------------- HELPERS ------------------- */
  const formRef = useRef(null);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });

  /* ------------------- VALIDATION ------------------- */
  const validate = () => {
    if (!name || !condition || !priority || !doctor || !lastVisit) {
      setError("All fields are required");
      return false;
    }
    setError("");
    return true;
  };

  /* ------------------- ADD / EDIT (FORM) ------------------- */
  const savePatient = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingPatient) {
      const updated = {
        ...editingPatient,
        name,
        condition,
        priority,
        doctor,
        lastVisit,
        updatedAt: new Date().toISOString()
      };

      setPatients(patients.map(p => p.id === updated.id ? updated : p));
      await updatePatientAPI(updated.id, updated);
      setEditingPatient(null);
    } else {
      const newPatient = {
        name,
        condition,
        priority,
        doctor,
        lastVisit,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const prev = patients;
      setPatients([...patients, { ...newPatient, id: Date.now() }]);

      try {
        const saved = await addPatientAPI(newPatient);
        setPatients([...prev, saved]);
      } catch {
        setPatients(prev);
      }
    }

    resetForm();
  };

  const resetForm = () => {
    setName("");
    setCondition("");
    setPriority("");
    setDoctor("");
    setLastVisit("");
  };

  const startEdit = (p) => {
    setEditingPatient(p);
    setName(p.name);
    setCondition(p.condition);
    setPriority(p.priority);
    setDoctor(p.doctor);
    setLastVisit(p.lastVisit);

    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 0);
  };


  /* ------------------- INLINE EDIT ------------------- */
  const startInlineEdit = (p) => {
    setInlineEditId(p.id);
    setTempPatient({ ...p });
  };

  const confirmInlineSave = async () => {
    const updated = patients.map(p =>
      p.id === tempPatient.id
        ? { ...tempPatient, updatedAt: new Date().toISOString() }
        : p
    );

    setPatients(updated);
    await updatePatientAPI(tempPatient.id, tempPatient);

    setInlineEditId(null);
    setTempPatient({});
    setShowConfirm(false);
  };

  /* ------------------- DELETE ------------------- */
  const deletePatient = async (id) => {
    const prev = patients;
    setPatients(patients.filter(p => p.id !== id));
    try {
      await deletePatientAPI(id);
    } catch {
      setPatients(prev);
    }
  };

  /* ------------------- FILTER + SORT ------------------- */
  const roleFiltered = patients.filter(p =>
    userRole === "doctor" ? p.doctor === LOGGED_IN_DOCTOR : true
  );

  const doctorFiltered = roleFiltered.filter(p =>
    doctorFilter === "all" ? true : p.doctor === doctorFilter
  );

  const patientFiltered = doctorFiltered.filter(p =>
    p.name.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const sortedPatients = [...patientFiltered].sort(
    (a, b) => new Date(b.lastVisit) - new Date(a.lastVisit)
  );

  /* ------------------- METRICS ------------------- */
  const totalPatients = patients.length;
  const criticalCount = patients.filter(p => p.priority === "Critical").length;
  const stableCount = patients.filter(p => p.priority === "Stable").length;

  /* =================== UI =================== */
  return (
    <div className="container mt-4">

      {/* HEADER */}
      <div className="app-header d-flex justify-content-between align-items-center">
        <div>
          <h2>🩺 CareFlow</h2>
          <p>Clinical patient monitoring dashboard</p>
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-light btn-sm" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>

          <select
            className="form-select form-select-sm w-auto"
            value={userRole}
            onChange={e => setUserRole(e.target.value)}
          >
            <option value="admin">Admin</option>
            <option value="doctor">Doctor</option>
          </select>
        </div>
      </div>

      {/* METRICS */}
      <div className="metrics">
        <div className="metric-card"><div className="metric-value">👤 {totalPatients}</div><div className="metric-label">Total</div></div>
        <div className="metric-card"><div className="metric-value">🚨 {criticalCount}</div><div className="metric-label">Critical</div></div>
        <div className="metric-card"><div className="metric-value">✅ {stableCount}</div><div className="metric-label">Stable</div></div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* ADD / EDIT FORM */}
      {userRole === "admin" && (
        <div ref={formRef} className="card p-4 mb-4">
          <h5>{editingPatient ? "Edit Patient" : "Add Patient"}</h5>

          <form onSubmit={savePatient}>
            <input
              autoFocus
              className="form-control mb-2"
              placeholder="Patient Name"
              value={name}
              onChange={e => { setName(e.target.value); setError(""); }}
            />

            <input
              className="form-control mb-2"
              placeholder="Medical Condition"
              value={condition}
              onChange={e => { setCondition(e.target.value); setError(""); }}
            />

            <input
              type="date"
              className="form-control mb-2"
              value={lastVisit}
              onChange={e => { setLastVisit(e.target.value); setError(""); }}
            />

            <select
              className="form-select mb-2"
              value={priority}
              onChange={e => { setPriority(e.target.value); setError(""); }}
            >
              <option value="">Select Priority</option>
              <option>Stable</option>
              <option>Moderate</option>
              <option>Critical</option>
            </select>

            <select
              className="form-select mb-3"
              value={doctor}
              onChange={e => { setDoctor(e.target.value); setError(""); }}
            >
              <option value="">Select Doctor</option>
              {DOCTORS.map(d => <option key={d}>{d}</option>)}
            </select>

            <button className="btn btn-success w-100" disabled={loading}>
              {editingPatient ? "Save Changes" : "Add Patient"}
            </button>

            {editingPatient && (
              <button
                type="button"
                className="btn btn-secondary w-100 mt-2"
                onClick={() => { setEditingPatient(null); resetForm(); }}
              >
                Cancel
              </button>
            )}
          </form>
        </div>
      )}

      {/* FILTER */}
      <div className="card p-3 mb-3">
        <label>Search Patient</label>
        <input
          type="text"
          className="form-control"
          placeholder="Search by patient name…"
          value={patientSearch}
          onChange={e => setPatientSearch(e.target.value)}
        />
      </div>

      {userRole === "admin" && (
      <div className="card p-3 mb-3">
        <label>Filter by Doctor</label>
        <select className="form-select" value={doctorFilter} onChange={e => setDoctorFilter(e.target.value)}>
          <option value="all">All</option>
          {DOCTORS.map(d => <option key={d}>{d}</option>)}
        </select>
      </div>
      )}

      {/* PATIENT LIST */}
      {loading ? (
        <div className="text-center text-muted mt-5">
          <div className="spinner-border mb-3" />
          <p>Loading patient records…</p>
        </div>
      ) : sortedPatients.length === 0 ? (
        <div className="text-center text-muted mt-5">
          <p style={{ fontSize: "1.2rem" }}>🩺 No patients found</p>
          <p>Add a patient or adjust filters</p>
        </div>
      ) : (
        <div className="row">
          {sortedPatients.map(p => (
            <div key={p.id} className="col-lg-6 mb-4">
              <div className={`patient-card ${userRole}-theme`}>

                {inlineEditId === p.id ? (
                  <>
                    <input className="form-control mb-1"
                      value={tempPatient.condition}
                      onChange={e => setTempPatient({ ...tempPatient, condition: e.target.value })}
                    />

                    <select className="form-select mb-1"
                      value={tempPatient.priority}
                      onChange={e => setTempPatient({ ...tempPatient, priority: e.target.value })}
                    >
                      <option>Stable</option>
                      <option>Moderate</option>
                      <option>Critical</option>
                    </select>

                    <select className="form-select mb-2"
                      value={tempPatient.doctor}
                      onChange={e => setTempPatient({ ...tempPatient, doctor: e.target.value })}
                    >
                      {DOCTORS.map(d => <option key={d}>{d}</option>)}
                    </select>

                    <button className="btn btn-success btn-sm w-100" onClick={() => setShowConfirm(true)}>
                      Save
                    </button>
                    <button className="btn btn-secondary btn-sm w-100 mt-1" onClick={() => setInlineEditId(null)}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <div className="patient-name">{p.name}</div>
                    <div className="patient-meta">🩺 {p.condition}</div>
                    <div className="patient-meta">👨‍⚕️ {p.doctor}</div>

                    <span className={`status status-${p.priority.toLowerCase()}`}>
                      {p.priority}
                    </span>

                    {userRole === "admin" && inlineEditId !== p.id && (
                      <>
                        <button className="btn btn-outline-primary btn-sm w-100 mt-2" onClick={() => startEdit(p)}>
                          Edit
                        </button>
                        <button className="btn btn-outline-secondary btn-sm w-100 mt-1" onClick={() => startInlineEdit(p)}>
                          Quick Edit
                        </button>
                        <button className="btn btn-outline-danger btn-sm w-100 mt-1" onClick={() => deletePatient(p.id)}>
                          Delete
                        </button>
                      </>
                    )}
                  </>
                )}

                <div className="audit mt-2">
                  📅 {formatDate(p.lastVisit)}<br />
                  ⏱ {formatDate(p.updatedAt)}
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* CONFIRM MODAL */}
      {showConfirm && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Confirm Save</h5>
              </div>
              <div className="modal-body">
                <p>You are about to update patient details.</p>
                <p className="text-muted mb-0">Please confirm to proceed.</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={confirmInlineSave}>Yes, Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;