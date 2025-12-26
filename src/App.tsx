import { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [websiteData, setWebsiteData] = useState<any>(null);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const storedWebsiteData = localStorage.getItem('websiteData');
    if (loggedIn && storedWebsiteData) {
      setIsLoggedIn(true);
      setWebsiteData(JSON.parse(storedWebsiteData));
    }
  }, []);

  const handleLogin = (status: string, website?: any) => {
    if (status === 'authenticated' && website) {
      setIsLoggedIn(true);
      setWebsiteData(website);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('websiteData', JSON.stringify(website));
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setWebsiteData(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('websiteData');
  };

  return (
    <>
      {isLoggedIn ? <AdminPanel onLogout={handleLogout} websiteData={websiteData} /> : <Login onLogin={handleLogin} />}
    </>
  );
}

export default App;
