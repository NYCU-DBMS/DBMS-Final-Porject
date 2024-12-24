import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  password: string;
}

interface Anime {
  id: string;
  Name: string;
  Score: number;
  Category: string[];
  Description: string;
  Type: string;
  Episodes: number;
  AirDate: string;
  EndDate?: string;
  Image_URL: string;
}


interface AnimeStoreState {
  user: User | null;
  favoriteList: Anime[];
  currentAnime: Anime | null;
  setUser: (user: User | null) => void;
  addFavorite: (anime: Anime) => void;
  removeFavorite: (animeId: string) => void;
  clearFavorites: () => void;
  fetchAnime: (id: string) => Promise<void>; // Fetch animation by ID
}

export const useAnimeStore = create<AnimeStoreState>((set) => ({
  user: null,
  favoriteList: [],
  currentAnime: null,
  setUser: (user) => set({ user }),
  addFavorite: (anime) =>
    set((state) => {
      if (!state.favoriteList.find((fav) => fav.id === anime.id)) {
        return { favoriteList: [...state.favoriteList, anime] };
      }
      return state;
    }),
  removeFavorite: (animeId) =>
    set((state) => ({
      favoriteList: state.favoriteList.filter((anime) => anime.id !== animeId),
    })),
  clearFavorites: () => set({ favoriteList: [] }),
  fetchAnime: async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/anime/${id}`);
      const data = await response.json();
      set({ currentAnime: data });
    } catch (error) {
      console.error("Failed to fetch anime data:", error);
    }
  },
}));