import { Navigate, Route, Routes } from "react-router-dom";
import { Header } from "../components/Header";

import { HomePage } from "../pages/HomePage";
// import { ProfilePage } from "../pages/ProfilePage";

// import { AllUsersPage } from "../pages/AllUsersPage";

import { WelcomePage } from "../pages/WelcomePage";
import Income from "../../auth/pages/Income";



export const MyAppRouter = () => {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/home" element={<HomePage />} />
         <Route path='/income' element={<Income/>} />
        {/* <Route path="/profile" element={<ProfilePage />} /> */}
       
        {/* <Route path="/all-users" element={<AllUsersPage />} /> */}
        <Route path="*" element={<Navigate to="/" />} />
      
      </Routes>
    </>
  );
};