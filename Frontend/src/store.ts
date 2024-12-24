import { create } from 'zustand';

interface Anime {
  id: number;
  Name: string;
  Score: number;
  Category: string[];
  Description: string;
  Type: string;
  Episodes: number;
  AirDate: string;
  EndDate?: string;
  Image_URL: string;

  setAnimeIds: (ids: number[]) => void;
}

interface AnimeStore {
  currentAnime: Anime | null;
  setCurrentAnime: (anime: Anime) => void;
  animes: Anime[];
  setAnimes: (animes: Anime[]) => void;
}

export const useAnimeStore = create<AnimeStore>((set) => ({
  currentAnime: null,
  setCurrentAnime: (currentAnime: Anime) => set({ currentAnime }),
  animes: [],
  setAnimes: (animes: Anime[]) => set({ animes }),
}));