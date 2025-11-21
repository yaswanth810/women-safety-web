import { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Login, Signup } from './pages/Auth';
import { SOSAlert } from './pages/SOSAlert';
import { ReportIncident } from './pages/ReportIncident';
import { Forum } from './pages/Forum';
import { LegalResources } from './pages/LegalResources';
import { Profile } from './pages/Profile';
import { AdminDashboard } from './pages/AdminDashboard';

function App() {
  const { loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/') setCurrentPage('home');
    else if (path === '/login') setCurrentPage('login');
    else if (path === '/signup') setCurrentPage('signup');
    else if (path === '/sos') setCurrentPage('sos');
    else if (path === '/report') setCurrentPage('report');
    else if (path === '/forum') setCurrentPage('forum');
    else if (path === '/resources') setCurrentPage('resources');
    else if (path === '/profile') setCurrentPage('profile');
    else if (path === '/admin') setCurrentPage('admin');
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentPage !== 'login' && currentPage !== 'signup' && <Navbar />}

      {currentPage === 'home' && <Home />}
      {currentPage === 'login' && <Login />}
      {currentPage === 'signup' && <Signup />}
      {currentPage === 'sos' && <SOSAlert />}
      {currentPage === 'report' && <ReportIncident />}
      {currentPage === 'forum' && <Forum />}
      {currentPage === 'resources' && <LegalResources />}
      {currentPage === 'profile' && <Profile />}
      {currentPage === 'admin' && <AdminDashboard />}
    </div>
  );
}

export default App;
