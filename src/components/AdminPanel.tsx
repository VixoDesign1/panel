import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MainContent from './MainContent';

interface AdminPanelProps {
  onLogout: () => void;
  websiteData?: any;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout, websiteData }) => {
  return (
    <div className="font-vazirmatn min-h-screen">
      <Header onLogout={onLogout} />
      {/* <Sidebar /> */}
      <MainContent websiteData={websiteData} />
    </div>
  );
};

export default AdminPanel;
