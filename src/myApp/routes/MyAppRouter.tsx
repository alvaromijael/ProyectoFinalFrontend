import { Navigate, Route, Routes } from "react-router-dom";
import { Header } from "../components/Header";

import { HomePage } from "../pages/HomePage";
// import { ProfilePage } from "../pages/ProfilePage";

// import { AllUsersPage } from "../pages/AllUsersPage";

import { WelcomePage } from "../pages/WelcomePage";
import CreatePatient from "../pages/patient/PatientCreate";
import PrivateRoute from "../components/PrivateRoute";
import PatientList from "../pages/patient/PatientList";
import AppointmentList from "../pages/appointment/AppointmentList";
import CreateAppointment from "../pages/appointment/CreateAppointment";
import EditPatient from "../pages/patient/PatientEdit";
import AppointmentEdit from "../pages/appointment/AppointmentEdit";

export const MyAppRouter = () => {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/patientList" element={<PatientList />} />
        <Route path="/patientCreate" element={<CreatePatient />} />
        <Route path="/patientEdit/:id" element={<EditPatient />} />
        <Route path="/appointmentList" element={<AppointmentList />} />
        <Route path="/appointmentCreate" element={<CreateAppointment />} />
         <Route path="/appointmentEdit/:id" element={<AppointmentEdit />} />
        <Route
          path="/income"
          element={
            <PrivateRoute>
              <PatientList />
            </PrivateRoute>
          }
        />
        {/* <Route path="/profile" element={<ProfilePage />} /> */}

        {/* <Route path="/all-users" element={<AllUsersPage />} /> */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};
