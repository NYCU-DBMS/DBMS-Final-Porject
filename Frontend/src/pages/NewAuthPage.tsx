import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LoginForm from '../components/LoginForm'
import { RegisterForm } from '../components/RegisterForm'
import { useAuth } from '../contexts/AuthContext'
import toast, { Toaster } from 'react-hot-toast'

export default function NewAuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password)
      navigate('/')
      toast.success('登入成功！', {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#22c55e',
          color: '#fff',
        },
      })
    } catch (error: any) {
      console.error('Login error:', error)
      const errorMessage = getLoginErrorMessage(error)
      toast.error(errorMessage, {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      })
    }
  }

  const handleRegister = async (email: string, password: string, username: string) => {
    try {
      await register(email, password, username)
      navigate('/')
      toast.success('註冊成功！', {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#22c55e', 
          color: '#fff',
        },
      })
    } catch (error: any) {
      console.error('Registration error:', error)
      const errorMessage = getRegistrationErrorMessage(error)
      toast.error(errorMessage, {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      })
    }
  }

  const getLoginErrorMessage = (error: any): string => {
    const errorMessage = error?.response?.data?.message || error.message
    return errorMessage
  }

  const getRegistrationErrorMessage = (error: any): string => {
    const errorMessage = error?.response?.data?.message || error.message
    return errorMessage
  }

  return (
    <div className="m-10 flex items-center justify-center">
      <Toaster />
      <div className="w-full max-w-md">
        {isLogin ? (
          <>
            <LoginForm 
              onSubmit={handleLogin} 
              onSwitchToRegister={() => setIsLogin(false)} 
            />
          </>
        ) : (
          <>
            <RegisterForm 
              onSubmit={handleRegister}
              onSwitchToLogin={() => setIsLogin(true)} 
            />
          </>
        )}
      </div>
    </div>
  )
}