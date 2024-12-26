import { create } from 'zustand'

import { registerUser, searchUser, login, updatePassword } from '@/api/user'

interface Anime {
  id: number
  Name: string
  Score: number
  Category: string[]
  Description: string
  Type: string
  Episodes: number
  AirDate: string
  EndDate?: string
  Image_URL: string

  setAnimeIds: (ids: number[]) => void
}

interface AnimeStore {
  animes: Anime[]
  setAnimes: (animes: Anime[]) => void
}

export const useAnimeStore = create<AnimeStore>((set) => ({
  animes: [],
  setAnimes: (animes: Anime[]) => set({ animes }),
}))

interface User {
  user_id: string
  username: string
  password: string
  email: string
  token: string
}

export interface AuthState {
  user: User | null
  isLoggedIn: boolean
  login: (username: string, password: string) => void
  logout: () => void
  register: (username: string, email: string, password: string) => void
  updatePassword: (oldPW: string, newPW: string) => void
}

type UserResponse = {
  id: string
  username: string
  email: string
  token: string
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  login: async (username, password) => {
    const data = await login(username, password)
    console.log(data)
    // if success, set user and isLoggedIn to true
    // if failed, show error message, and do nothing
    if (data.error) {
      console.error(data.error)
      return
    }
    const result: UserResponse = await searchUser(username)
    console.log(result)
    set({
      user: {
        user_id: result.id,
        username: result.username,
        password: '', // 密碼不應存儲在前端
        email: result.email,
        token: result.token,
      },
      isLoggedIn: true,
    })

  },
  logout: () =>
    set({
      user: null,
      isLoggedIn: false,
    }),
  register: async (username, email, password) => {
    try {
      const data = await registerUser(username, email, password)
      console.log(data)
      if (data.error) {
        console.error(data.error)
        return
      }
      const { user } = data
      set({
        user: {
          user_id: user.id,
          username: user.username,
          password: '', // 密碼不應存儲在前端
          email: user.email,
          token: '', // 根據需求設置
        },
      })
    } catch (error) {
      throw error
    }
  },
  updatePassword: async (oldPW: string, newPW: string) => {
    // update password
    try {
      const data = await updatePassword(oldPW, newPW)
      console.log(data)
      if (data.error) {
        console.error(data.error)
        return
      }
      set((state) => ({
        user: {
          user_id: state.user?.user_id || '',
          username: state.user?.username || '',
          email: state.user?.email || '',
          token: state.user?.token || '',
          password: newPW,
        },
      }))
    } catch (error) {
      throw error
    }
  },
}))
