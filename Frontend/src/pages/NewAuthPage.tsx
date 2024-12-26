import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { NewLoginForm } from '@/components/NewLoginForm'
import { NewRegisterForm } from '@/components/NewRegisterForm'

export default function NewAuthPage() {
  const [isLoginView, setIsLoginView] = useState(true)

  return (
    <div className="m-10 flex items-center justify-center">
      <Toaster />
      <div className="w-full max-w-md">
        {isLoginView ? (
          <NewLoginForm
            onSwitchToRegister={() => setIsLoginView(false)}
          />
        ) : (
            <NewRegisterForm
              onSwitchToLogin={() => setIsLoginView(true)}
            />
        )}
      </div>
    </div>
  )
}