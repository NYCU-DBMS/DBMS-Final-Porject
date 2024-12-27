import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  getFavoriteList, 
  deleteAnimeFromList,
  createFavoriteList,
  getUsersList,
  deleteList
} from "@/api/favorite";
import { fetchAnimeById } from "@/api/anime";
import { useAuthStore } from "@/store";
import { FaTrash, FaHeart, FaTimes } from 'react-icons/fa';
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
  const [selectedList, setSelectedList] = useState<string>("快速收藏");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

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
          result = await getFavoriteList(user.user_id, selectedList);
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

  const handleDeleteList = async (listTitle: string) => {
    if (!isLoggedIn || !user?.user_id) {
      toast.error("請先登入");
      return;
    }

    // 防止刪除"我的收藏"清單
    if (listTitle === "快速收藏") {
      toast.error("無法刪除「快速收藏」清單");
      return;
    }

    // 防止刪除最後一個清單
    if (userLists.length === 1) {
      toast.error("無法刪除最後一個清單");
      return;
    }

    // 確認對話框
    if (!window.confirm(`確定要刪除「${listTitle}」清單嗎？此操作無法撤銷。`)) {
      return;
    }

    try {
      const result = await deleteList(user.user_id, listTitle);
      if (result.error) {
        throw new Error(result.error);
      }
      
      setUserLists(prev => prev.filter(list => list !== listTitle));
      if (selectedList === listTitle) {
        setSelectedList(userLists.find(list => list !== listTitle) || "快速收藏");
      }
      toast.success(`已刪除「${listTitle}」清單`);
    } catch (err) {
      console.error("Error deleting list:", err);
      toast.error("刪除清單失敗");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="flex justify-center items-center p-10 text-gray-600 dark:text-gray-400">
        請先登入以查看收藏清單
      </div>
    );
  }

  return (
  // 移除最外層的 min-h-screen，因為我們要讓背景色延伸到整個視窗
  <div className="bg-gray-50 dark:bg-gray-900 h-full w-full">
    {!isLoggedIn ? (
      // 未登入狀態也要填滿
      <div className="h-[calc(100vh-64px)] flex justify-center items-center p-10 text-gray-600 dark:text-gray-400">
        請先登入以查看收藏清單
      </div>
    ) : (
      <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-64px)]">
        {/* 標題部分 */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            我的收藏清單
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            管理您收藏的動畫作品
          </p>
        </div>

        {/* 清單選擇器 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center justify-center">
            {userLists.length === 0 ? (
              <div className="text-gray-500 dark:text-gray-400 py-2">
                正在創建默認收藏清單...
              </div>
            ) : (
              userLists.map(list => (
                <div
                  key={list}
                  className="relative group"
                >
                  <button
                    onClick={() => setSelectedList(list)}
                    className={`px-6 py-2 rounded-full transition-all duration-200 flex items-center gap-2
                      ${selectedList === list
                        ? "bg-red-500 text-white shadow-md scale-105"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                  >
                    <FaHeart className={`${selectedList === list ? "text-white" : "text-red-500"}`} />
                    <span className="truncate max-w-[150px]">{list}</span>
                    {list !== "快速收藏" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteList(list);
                        }}
                        className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        title="刪除清單"
                      >
                        <FaTimes className="w-3 h-3 hover:text-red-300" />
                      </button>
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 錯誤提示 */}
        {error && (
          <div className="text-center text-red-500 dark:text-red-400 mb-6 p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
            {error}
          </div>
        )}

        {/* 動畫列表 - 修改這裡讓它永遠填滿剩餘空間 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 min-h-[calc(100vh-280px)]">
          {loading ? (
            <div className="w-full h-full flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
          ) : animes.length === 0 ? (
            <div className="w-full h-full flex flex-col justify-center items-center">
              <FaHeart className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                該清單中還沒有動畫
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {animes.map((anime) => (
                <div 
                  key={anime.id}
                  className="group relative overflow-hidden rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-300"
                >
                  <Link to={`/anime/${anime.id}`}>
                    <div className="relative aspect-[3/4]">
                      <img 
                        src={anime.imageUrl} 
                        alt={anime.name} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <div className="text-white font-semibold text-sm line-clamp-2">
                          {anime.name}
                        </div>
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={() => handleRemoveFromList(anime.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                    title="從清單中移除"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);
}