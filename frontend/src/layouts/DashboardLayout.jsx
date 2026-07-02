import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import FloatingChat from '../components/chat/FloatingChat';

const DashboardLayout = ({ title }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col pl-64">
        {/* Navbar */}
        <Navbar title={title} />

        {/* Child Router Outlets */}
        <main className="flex-1 p-8 mt-16 overflow-y-auto animate-fade-in">
          <Outlet />
        </main>
      </div>

      {/* Floating Chat — visible on every page */}
      <FloatingChat />
    </div>
  );
};

export default DashboardLayout;
