import React from 'react';

interface HeaderProps {
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">پنل مدیریت</h1>
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          {/* <span>خوش آمدید، کاربر</span> */}
          <button onClick={onLogout} className="bg-blue-500 hover:bg-blue-700 px-3 py-1 rounded">خروج</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
