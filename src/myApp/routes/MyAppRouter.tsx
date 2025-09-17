import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "antd";
import { useAuthContext } from "../../auth/context/AuthContext";

import { Header } from "../components/Header";
import Sidebar from "../components/Sidebar";
import { Footer } from "../components/Footer";

import { HomePage } from "../pages/HomePage";
import { AllUsersPage } from "../pages/AllUsersPage";
import { WelcomePage } from "../pages/WelcomePage";
import PatientList from "../pages/patient/PatientList";
import CreatePatient from "../pages/patient/PatientCreate";
import EditPatient from "../pages/patient/PatientEdit";
import AppointmentList from "../pages/appointment/AppointmentList";
import CreateAppointment from "../pages/appointment/CreateAppointment";
import AboutUs from "../pages/landing/AboutUs";
import Specialities from "../pages/landing/Specialities";
import Laboratory from "../pages/landing/Laboratory";
import PrivateRoute from "../components/PrivateRoute";
import AppointmentEdit from "../pages/appointment/AppointmentEdit";
import { ProfilePage } from "../pages/ProfilePage";

import LabOrderForm from "../pages/laboratory/LabOrderForm";
import AppointmentManage from "../pages/manageAppointment/AppointmentManageCreate";
import AppointmentManageList from "../pages/manageAppointment/AppointmentManageList";
import AppointmentManageEdit from "../pages/manageAppointment/AppointmentManageEdit";
import AppointmentManageCreate from "../pages/manageAppointment/AppointmentManageCreate";


const { Content } = Layout;

export const MyAppRouter = () => {
  const { user, loading } = useAuthContext(); // 👈 usamos tu hook

  if (loading) return null; // o un spinner si prefieres

  return (
    <>
      <Header />

      <Layout style={{ minHeight: "calc(100vh - 24px)" }}>
        {user && <Sidebar />}

        <Content style={{ width: "100%" }}>
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route
              path="/home"
              element={
                <PrivateRoute>
                  <HomePage />
                </PrivateRoute>
              }
            />
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
            <Route
              path="/appointmentEdit/:id"
              element={
                <PrivateRoute>
                  <AppointmentEdit />
                </PrivateRoute>
              }
            />
              <Route
              path="/manageAppointmentList"
              element={
                <PrivateRoute>
                  <AppointmentManageList />
                </PrivateRoute>
              }
            />

              <Route
              path="/manageAppointmentCreate"
              element={
                <PrivateRoute>
                  <AppointmentManageCreate />
                </PrivateRoute>
              }
            />

              <Route
              path="/manageAppointmentEdit/:id"
              element={
                <PrivateRoute>
                  <AppointmentManageEdit />
                </PrivateRoute>
              }
            />

            <Route
              path="/all-users"
              element={
                <PrivateRoute>
                  <AllUsersPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile-page"
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/lab-order-form"
              element={
                <PrivateRoute>
                  <LabOrderForm />
                </PrivateRoute>
              }
            />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/specialities" element={<Specialities />} />
            <Route path="/laboratory" element={<Laboratory />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Content>
      </Layout>

      <Footer />
    </>
  );
};
