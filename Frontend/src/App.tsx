import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import { AuthPage } from './pages/AuthPage'
import FavoriteListPage from './pages/FavoriteListPage'
import Profile from './pages/Profile'
import NavBar from './components/NavBar'
import Links from './components/Links'
import { Toaster } from 'react-hot-toast'
import AnimePage from './pages/AnimePage'
import NewAuthPage from './pages/NewAuthPage'
import { useAuthStore } from './store'

const AppContent = () => {
  const { user } = useAuthStore()

  // if (isLoading) {
  //   return <div>Loading...</div>
  // }

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
      <NavBar />
      <Links />
      <div className='flex-1'>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/new_login" element={<NewAuthPage />} />
          <Route
            path="/favorites"
            element={
              user ? <FavoriteListPage /> : <Navigate to="/new_login" replace />
            }
          />
          <Route
            path="/profile"
            element={
              user ? <Profile /> : <Navigate to="/login" replace />
            }
          />
          <Route path='/anime/:id' element={<AnimePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AppContent />
  )
}