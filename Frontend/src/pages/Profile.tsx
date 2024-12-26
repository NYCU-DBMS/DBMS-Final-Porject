import { useState } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Label } from "../components/ui/label"
import toast from "react-hot-toast"
import { api } from "../services/api"
import { User, Lock, Mail, IdCard } from "lucide-react"
import { useAuthStore } from "@/store"

const getPasswordChangeErrorMessage = (error: any): string => {
  const errorMessage = error?.response?.data?.message || error.message;
  return errorMessage;
};

export default function Profile() {
  const { user } = useAuthStore()
  console.log(user)
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("新密碼不匹配！", {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      });
      return
    }
    setIsLoading(true)
    try {
      await api.changePassword(
        passwords.currentPassword,
        passwords.newPassword
      );

      toast.success("密碼修改成功！", {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#22c55e',
          color: '#fff',
        },
      });
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error: any) {
      console.error('Password change error:', error);
      const errorMessage = getPasswordChangeErrorMessage(error);
      toast.error(errorMessage, {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      });
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-800 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="bg-[#1a1a1a] border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="w-5 h-5" />
                個人資料
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-white" />
                  <div>
                    <Label className="text-white">用戶名</Label>
                    <div className="text-white">{user?.username}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-white" />
                  <div>
                    <Label className="text-white">電子郵件</Label>
                    <div className="text-white">{user?.email}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <IdCard className="w-4 h-4 text-white" />
                  <div>
                    <Label className="text-white">用戶 ID</Label>
                    <div className="text-white">{user?.user_id}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Lock className="w-5 h-5" />
                修改密碼
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword" className="text-white">
                    當前密碼
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords(prev => ({
                      ...prev,
                      currentPassword: e.target.value
                    }))}
                    className="mt-1 bg-[#2a2a2a] border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword" className="text-white">
                    新密碼
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords(prev => ({
                      ...prev,
                      newPassword: e.target.value
                    }))}
                    className="mt-1 bg-[#2a2a2a] border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword" className="text-white">
                    確認新密碼
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords(prev => ({
                      ...prev,
                      confirmPassword: e.target.value
                    }))}
                    className="mt-1 bg-[#2a2a2a] border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                >
                  {isLoading ? "修改中..." : "修改密碼"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}