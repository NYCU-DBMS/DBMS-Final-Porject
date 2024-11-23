import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import { AuthPage } from './pages/AuthPage';
import FavoriteListPage from './pages/FavoriteListPage';
import Profile from './pages/Profile';  // 添加這行
import NavBar from './components/NavBar';
import Links from './components/Links';
import toast, { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext';

const AppContent = () => {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('登出成功！', {
      duration: 1500,
      position: 'top-center',
      style: {
        background: '#22c55e',
        color: '#fff',
      },
    });
    navigate('/', { replace: true });
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='min-h-screen flex flex-col dark:bg-slate-800'>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 1500,
          style: {
            background: '#22c55e',
            color: '#fff',
          },
        }}
      />
      <NavBar
        isLoggedIn={!!user}
        onLogout={handleLogout}
        userName={user?.username || ''}
      />
      <Links />
      <div className='flex-1'>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route
            path="/favorites"
            element={
              user ? <FavoriteListPage /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/profile"
            element={
              user ? <Profile /> : <Navigate to="/login" replace />
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}