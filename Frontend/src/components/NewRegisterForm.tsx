import { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store'

interface RegisterFormProps {
  onSwitchToLogin: () => void
}

export const NewRegisterForm = ({ onSwitchToLogin }: RegisterFormProps) => {
  const { register } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast.error("密碼不一致!", {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      })
      return
    }
  
    try {
      setIsSubmitting(true)
      await register(username, email, password)
      
      toast.success('註冊成功！', {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#22c55e',
          color: '#fff',
        },
      })
      onSwitchToLogin()
      
    } catch (error: any) {
      const errorMessage = error.message || '註冊失敗，請稍後再試'
      toast.error(errorMessage, {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      })
      switch (errorMessage) {
        case '用戶名已存在':
          setUsername('')
          break
        case 'Email已被註冊':
          setEmail('')
          break
        default:
          break
      }

    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-[#1a1a1a] p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-6">CREATE ACCOUNT</h2>

      <div className="space-y-2">
        <label htmlFor="username" className="block text-sm font-medium text-gray-300">
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-300">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          required
          disabled={isSubmitting}
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
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          required
          disabled={isSubmitting}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Registering...' : 'Register'}
      </button>

      <div className="text-center mt-4">
        <p className="text-gray-400">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-blue-500 hover:text-blue-400 transition duration-200"
            disabled={isSubmitting}
          >
            Sign in here
          </button>
        </p>
      </div>
    </form>
  )
}