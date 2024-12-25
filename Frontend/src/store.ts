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
  animes: Anime[];
  setAnimes: (animes: Anime[]) => void;
}

export const useAnimeStore = create<AnimeStore>((set) => ({
  animes: [],
  setAnimes: (animes: Anime[]) => set({ animes }),
}));