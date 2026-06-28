import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen font-sans flex flex-col">
      {/* Fixed Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Fixed Top Navbar */}
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      {/* Page content pushed right of sidebar, below navbar */}
      <div className="flex-1 flex flex-col lg:pl-[260px]">
        <main className="flex-1 pt-20 pb-8 px-4 md:px-6 lg:px-8 max-w-screen-2xl w-full mx-auto">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
