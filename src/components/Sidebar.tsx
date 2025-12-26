import React from 'react';

const Sidebar: React.FC = () => {
  const menuItems = [
    { name: 'داشبورد', icon: '📊' },
    { name: 'کاربران', icon: '👥' },
    { name: 'محصولات', icon: '📦' },
    { name: 'سفارشات', icon: '🛒' },
    { name: 'تنظیمات', icon: '⚙️' },
  ];

  return (
    <aside className="bg-gray-800 text-white w-64 min-h-screen p-4 fixed right-0 top-16">
      <nav>
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <a
                href="#"
                className="flex items-center space-x-3 rtl:space-x-reverse p-3 rounded hover:bg-gray-700 transition"
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
