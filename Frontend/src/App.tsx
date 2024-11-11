import { Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/LoginPage';
import LogoutPage from './pages/LogoutPage';
import FavoriteListPage from './pages/FavoriteListPage';

import NavBar from './components/NavBar';

export default function App() {
  return (
    <div className='h-screen flex flex-col dark:bg-slate-800'>
      <NavBar />
      <div className='flex-1'>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="/favorites" element={<FavoriteListPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </div>
  )
}
