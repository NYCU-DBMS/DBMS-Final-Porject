import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import FavoriteList from '@/components/FavoriteList';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

export default function FavoriteListPage() {
  const [animeList, setAnimeList] = useState<{ image: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      initializeFavoriteList();
    } else {
      setLoading(false); 
    }
  }, [user]);

  const initializeFavoriteList = async () => {
    try {
      await fetchFavoriteList();
    } catch (error: any) {
      console.log('清單不存在，創建中...');
      await createFavoriteList();
      await fetchFavoriteList();
    } finally {
      setLoading(false);
    }
  };

  const createFavoriteList = async () => {
    try {
      const response = await axios.post('/api/favorite/create', {
        user_id: user?.id,
        list_title: 'My Favorites',
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      toast.success('收藏清單已成功創建！', {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#22c55e',
          color: '#fff',
        },
      });
    } catch (error: any) {
      console.error('Error creating favorite list:', error);
      toast.error('無法創建收藏清單，請稍後重試。', {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      });
    }
  };

  const fetchFavoriteList = async () => {
    try {
      const response = await axios.post('/api/favorite/getList', {
        user_id: user?.id,
        list_title: 'My Favorites',
      });

      const { anime_id, anime_name } = response.data;

      const fetchedAnimeList = anime_id.map((id: number, index: number) => ({
        image: `/assets/anime${id}.jpg`,
        title: anime_name[index],
      }));

      setAnimeList(fetchedAnimeList);
    } catch (error: any) {
      console.error('Error fetching favorite list:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center my-10">
      <Toaster />
      <div className="text-2xl font-bold mb-5">My Favorite Anime List</div>
      {animeList.length > 0 ? (
        <FavoriteList animeList={animeList} />
      ) : (
        <div className="text-lg text-gray-500">No favorite anime found.</div>
      )}
    </div>
  );
}
