import { Footer } from "../components/Footer";
import Sidebar from "../components/Sidebar";

export const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Sidebar />
      <Footer/>
    </div>
  );
};
