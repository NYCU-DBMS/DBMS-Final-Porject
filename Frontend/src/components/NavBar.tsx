import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, UserCircle } from 'lucide-react'
import { Link } from "react-router-dom"

interface NavbarProps {
  isLoggedIn: boolean
  onLogout: () => void
  userName?: string
}

export default function Navbar({ isLoggedIn, onLogout, userName }: NavbarProps) {
  return (
    <nav className="w-full border-b">
      <div className="flex h-16 items-center px-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold">Anime Helper</h2>
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
                    <p className="font-medium">{userName}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-5 w-5" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="mr-2 h-5 w-5" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}