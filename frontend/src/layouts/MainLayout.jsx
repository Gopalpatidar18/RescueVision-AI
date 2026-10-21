import { Outlet } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

export default function MainLayout({ children }) {
  return (
    <div className="rv-canvas min-h-screen text-[#192820] lg:pl-[248px]">
      <Sidebar />
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-7 sm:py-8 xl:px-10">
          {children || <Outlet />}
        </main>
        <Footer />
      </div>
    </div>
  );
}