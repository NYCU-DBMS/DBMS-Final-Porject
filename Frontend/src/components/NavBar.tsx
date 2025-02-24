import { Button } from "@/components/ui/button"
import { User, LogOut, UserCircle } from 'lucide-react'
import { Link, useNavigate } from "react-router-dom"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/store"
import { toast } from "react-hot-toast"


export default function Navbar() {
  const navigate = useNavigate()
  const { user, isLoggedIn, logout } = useAuthStore()
  const onLogout = () => {
    logout()
    toast.success('登出成功！', {
      duration: 1500,
      position: 'top-center',
      style: {
        background: '#22c55e',
        color: '#fff',
      },
    })
    navigate('/', { replace: true })
    setTimeout(() => {
      window.location.reload()
    }, 500)
  }
  return (
    <nav className="w-full border-b z-50">
      <div className="flex h-16 items-center px-4 shadow-[0_4px_10px_rgba(0,0,0,0.5)]"> 
        <div className="flex-1">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <h2 className="text-xl font-bold">Anime Helper</h2>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-12 w-12 rounded-full inline-flex items-center justify-center">
                  <UserCircle className="!h-[30px] !w-[30px]"/>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user?.username}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/Profile" className="w-full">
                    <div className="flex items-center">
                      <User className="mr-2 h-5 w-5" />
                      <span>Profile</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="mr-2 h-5 w-5" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" asChild>
              <Link to="/new_login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}