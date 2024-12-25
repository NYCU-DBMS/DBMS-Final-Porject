import { create } from 'zustand'

import { registerUser } from '@/api/user'

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
  user_id: number
  username: string
  password: string
  email: string
  token: string
}

export interface AuthState {
  user: User | null
  isLoggedIn: boolean
  login: (user: User) => void
  logout: () => void
  register: (username: string, email: string, password: string) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  login: (user) =>
    set({
      user,
      isLoggedIn: true,
    }),
  logout: () =>
    set({
      user: null,
      isLoggedIn: false,
    }),
  register: async (username, email, password) => {
    try {
      const data = await registerUser(username, email, password)
      console.log(data)
      const { user } = data
      set({
        user: {
          user_id: user.id,
          username: user.username,
          password: '', // 密碼不應存儲在前端
          email: user.email,
          token: '', // 根據需求設置
        },
        isLoggedIn: true,
      })
    } catch (error) {
      throw error
    }
  },
}))
