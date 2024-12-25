import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthState } from '@/store'
import { useAuthStore } from '@/store'
import toast, { Toaster } from 'react-hot-toast'
import { NewLoginForm } from '@/components/NewLoginForm'
import { NewRegisterForm } from '@/components/NewRegisterForm'

export default function NewAuthPage() {
  const [isLoginView, setIsLoginView] = useState(true)
  const login = useAuthStore((state: AuthState) => state.login)
  const navigate = useNavigate()

  const handleLogin = async (email: string, password: string) => {
    try {
      // Mock API call - replace this with actual login API
      const response = {
        user_id: 1,
        username: 'testuser',
        password,
        email,
        token: 'mock-token',
      }
      login(response)
      navigate('/')
      toast.success('登入成功！', {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#22c55e',
          color: '#fff',
        },
      })
      // 跳轉到首頁
      navigate('/')
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error("error", {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      })
    }
  }

  return (
    <div className="m-10 flex items-center justify-center">
      <Toaster />
      <div className="w-full max-w-md">
        {isLoginView ? (
          <>
            <NewLoginForm
              onSubmit={handleLogin}
              onSwitchToRegister={() => setIsLoginView(false)}
            />
          </>
        ) : (
          <>
            <NewRegisterForm
              onSwitchToLogin={() => setIsLoginView(true)}
            />
          </>
        )}
      </div>
    </div>
  )
}