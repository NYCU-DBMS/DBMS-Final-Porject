import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  password: string;
}

interface Anime {
  id: string;
  title: string;
  imageUrl: string;
}

interface AnimeStoreState {
  user: User | null;
  favoriteList: Anime[];
  setUser: (user: User | null) => void;
  addFavorite: (anime: Anime) => void;
  removeFavorite: (animeId: string) => void;
  clearFavorites: () => void;
}

export const useAnimeStore = create<AnimeStoreState>((set, get) => ({
  user: null,
  favoriteList: [],
  setUser: (user) => set({ user }),
  addFavorite: (anime) => {
    const currentFavorites = get().favoriteList;
    if (!currentFavorites.find((fav) => fav.id === anime.id)) {
      set({ favoriteList: [...currentFavorites, anime] });
    }
  },
  removeFavorite: (animeId) => {
    const updatedFavorites = get().favoriteList.filter(
      (anime) => anime.id !== animeId
    );
    set({ favoriteList: updatedFavorites });
  },
  clearFavorites: () => set({ favoriteList: [] }),
}));
