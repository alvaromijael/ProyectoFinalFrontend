import { Navigate, Route, Routes } from "react-router-dom";
import { Header } from "../components/Header";

import { HomePage } from "../pages/HomePage";
// import { ProfilePage } from "../pages/ProfilePage";

import { AllUsersPage } from "../pages/AllUsersPage";

import { WelcomePage } from "../pages/WelcomePage";
import PatientList from "../pages/patient/PatientList";
//import CreatePatient from "../pages/patient/CreatePatient";
import PrivateRoute from "../components/PrivateRoute";
//import PatientList from "../pages/patient/PatientList";
import AppointmentList from "../pages/appointment/AppointmentList";
import CreateAppointment from "../pages/appointment/CreateAppointment";

import EditPatient from "../pages/patient/PatientEdit";
import CreatePatient from "../pages/patient/PatientCreate";
import AboutUs from "../pages/landing/AboutUs";
import Specialities from "../pages/landing/Specialities";
import Laboratory from "../pages/landing/Laboratory";
export const MyAppRouter = () => {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route
          path="/patientList"
          element={
            <PrivateRoute>
              <PatientList />
            </PrivateRoute>
          }
        />
        <Route
          path="/patientCreate"
          element={
            <PrivateRoute>
              <CreatePatient />
            </PrivateRoute>
          }
        />
        <Route
          path="/patientEdit/:id"
          element={
            <PrivateRoute>
              <EditPatient />
            </PrivateRoute>
          }
        />

        <Route
          path="/appointmentList"
          element={
            <PrivateRoute>
              <AppointmentList />
            </PrivateRoute>
          }
        />
        <Route
          path="/createAppointment"
          element={
            <PrivateRoute>
              <CreateAppointment />
            </PrivateRoute>
          }
        />

        {/* <Route path="/profile" element={<ProfilePage />} /> */}

        <Route
          path="/all-users"
          element={
            <PrivateRoute>
              <AllUsersPage />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/specialities" element={<Specialities />} />
        <Route path="/laboratory" element={<Laboratory />} />
      </Routes>
          
    </>
  );
};
