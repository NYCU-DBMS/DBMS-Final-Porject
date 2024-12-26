import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { AuthState } from '@/store'
import { useAuthStore } from '@/store'

interface LoginFormProps {
  onSwitchToRegister: () => void 
}

export const NewLoginForm = ({ onSwitchToRegister }: LoginFormProps) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const login = useAuthStore((state: AuthState) => state.login)
  const navigate = useNavigate()
  const handleLogin = async (username: string, password: string) => {
    try {
      if (login(username, password) !== undefined) {
        toast.error('登入失敗！', {
          duration: 2000,
          position: 'top-center',
          style: {
            background: '#ef4444',
            color: '#fff',
          },
        })
        return
      }
      navigate('/')
      toast.success('登入成功！', {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#22c55e',
          color: '#fff',
        },
      })
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleLogin(username, password)
  }
  
  return (
    <div className='flex justify-center items-center'>
      <form onSubmit={handleSubmit} className="space-y-6 bg-[#1a1a1a] p-8 rounded-xl shadow-lg overflow-auto">
        <h2 className="text-2xl font-bold text-white mb-6">SIGN IN</h2>
        
        <div className="space-y-2">
          <label htmlFor="username" className="block text-sm font-medium text-gray-300">
            Username
          </label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            required
            />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-300">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            required
            />
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
          Sign In
        </button>

        <div className="text-center mt-4">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-blue-500 hover:text-blue-400 transition duration-200"
              >
              Register here
            </button>
          </p>
        </div>
      </form>
    </div>
  )
}