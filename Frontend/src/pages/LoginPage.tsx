import { LoginForm } from '@/components/LoginForm'

export default function LoginPage() {

  // handle login form props
  const onLogin = () => {};

  return (
    <div className='flex flex-col items-center justify-center min-h-[80vh]'>
      <LoginForm onSubmit={onLogin} />
    </div>

  )
}
