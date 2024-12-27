import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  getFavoriteList, 
  deleteAnimeFromList,
  createFavoriteList,
  getUsersList
} from "@/api/favorite";
import { fetchAnimeById } from "@/api/anime";
import { useAuthStore } from "@/store";
import toast from 'react-hot-toast';

interface AnimeDetails {
  id: number;
  name: string;
  imageUrl: string;
}

export default function FavoriteList() {
  const { user, isLoggedIn } = useAuthStore();
  const [animes, setAnimes] = useState<AnimeDetails[]>([]);
  const [userLists, setUserLists] = useState<string[]>([]);
  const [selectedList, setSelectedList] = useState<string>("我的收藏");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // 調試用
  useEffect(() => {
    console.log("Auth State:", { user, isLoggedIn });
  }, [user, isLoggedIn]);

  // 獲取用戶的所有收藏清單
  useEffect(() => {
    const fetchUserLists = async () => {
      if (!isLoggedIn || !user?.user_id) {
        setLoading(false);
        setError("請先登入");
        return;
      }

      try {
        console.log("Fetching lists for user ID:", user.user_id);
        const result = await getUsersList(user.user_id);
        console.log("User lists result:", result);

        if (result.error) {
          throw new Error(result.error);
        }

        // 如果沒有任何清單，創建默認的"快速收藏"清單
        if (!result.list_titles || result.list_titles.length === 0) {
          console.log("No lists found, creating default list");
          try {
            await createFavoriteList(user.user_id, "快速收藏"); 
            // 重新獲取清單
            const updatedResult = await getUsersList(user.user_id); 
            if (updatedResult.error) {
              throw new Error(updatedResult.error);
            }
            setUserLists(updatedResult.list_titles);
            setSelectedList("快速收藏");
          } catch (err) {
            console.error("Error creating default list:", err);
            throw new Error("無法創建默認收藏清單");
          }
        } else {
          setUserLists(result.list_titles);
          setSelectedList(result.list_titles[0]);
        }
      } catch (err) {
        console.error("Error fetching user lists:", err);
        setError("無法獲取收藏清單");
        toast.error("無法獲取收藏清單");
      } finally {
        setLoading(false);
      }
    };

    fetchUserLists();
  }, [user, isLoggedIn]);

  // 獲取選中清單的動畫
  useEffect(() => {
    const fetchAnimes = async () => {
      if (!isLoggedIn || !user?.user_id || !selectedList) return;

      setLoading(true);
      try {
        console.log("Fetching animes for list:", selectedList);
        let result = await getFavoriteList(user.user_id, selectedList);
        console.log("Anime list result:", result);
        
        if (result.error?.includes("List not exist")) {
          console.log("Creating new list:", selectedList);
          await createFavoriteList(user.user_id, selectedList);
          result = await getFavoriteList((user.user_id), selectedList);
        }

        if (result.anime_id && result.anime_id.length > 0) {
          const animeDetails = await Promise.all(
            result.anime_id.map(async (id, index) => {
              try {
                const animeData = await fetchAnimeById(id);
                return {
                  id,
                  name: result.anime_name[index],
                  imageUrl: animeData.Image_URL
                };
              } catch (err) {
                console.error(`Failed to fetch anime ${id}:`, err);
                return null;
              }
            })
          );

          setAnimes(animeDetails.filter((anime): anime is AnimeDetails => anime !== null));
        } else {
          setAnimes([]);
        }
      } catch (err) {
        console.error("Error fetching animes:", err);
        setError("無法獲取收藏的動畫");
      } finally {
        setLoading(false);
      }
    };

    fetchAnimes();
  }, [user, isLoggedIn, selectedList]);

  const handleRemoveFromList = async (animeId: number) => {
    if (!isLoggedIn || !user?.user_id) {
      toast.error("請先登入");
      return;
    }

    try {
      const result = await deleteAnimeFromList(user.user_id, selectedList, animeId);
      if (result.error) {
        throw new Error(result.error);
      }
      setAnimes(animes.filter(anime => anime.id !== animeId));
      toast.success("成功從清單中移除");
    } catch (err) {
      console.error("Error removing anime:", err);
      toast.error("無法從清單中移除動畫");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="flex justify-center items-center p-10 text-gray-600 dark:text-gray-400">
        請先登入以查看收藏清單
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex gap-5 m-10 p-10 dark:bg-slate-700 justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* 清單選擇器 */}
      <div className="flex justify-center gap-4 px-4 flex-wrap">
        {userLists.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400">
            正在創建默認收藏清單...
          </div>
        ) : (
          userLists.map(list => (
            <button
              key={list}
              onClick={() => setSelectedList(list)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedList === list
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {list}
            </button>
          ))
        )}
      </div>

      {/* 錯誤提示 */}
      {error && (
        <div className="text-center text-red-500 dark:text-red-400">
          {error}
        </div>
      )}

      {/* 動畫列表 */}
      <div className="flex flex-wrap gap-5 m-10 p-10 dark:bg-slate-700 justify-center">
        {animes.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400">
            該清單中還沒有動畫
          </div>
        ) : (
          animes.map((anime) => (
            <div 
              key={anime.id}
              className="group relative overflow-hidden aspect-[3/2] w-[20%] min-w-[200px]"
            >
              <Link to={`/anime/${anime.id}`}>
                <div className="relative h-full">
                  <img 
                    src={anime.imageUrl} 
                    alt={anime.name} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <div className="text-white font-semibold truncate">
                      {anime.name}
                    </div>
                  </div>
                </div>
              </Link>
              <button
                onClick={() => handleRemoveFromList(anime.id)}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}