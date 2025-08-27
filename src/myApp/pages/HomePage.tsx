import { Footer } from "../components/Footer";
import Sidebar from "../components/Sidebar";

export const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <header>...</header>
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4">Contenido principal</main>
      </div>
      
      <Footer/>
    </div>
  );
};
