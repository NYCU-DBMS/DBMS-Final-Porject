import { useEffect, useState, Fragment } from "react"
import { useParams } from "react-router-dom"
import { Dialog, Transition } from '@headlessui/react'
import { fetchAnimeById } from "@/api/anime"
import { 
  insertAnimeToList, 
  deleteAnimeFromList, 
  getFavoriteList,
  createFavoriteList,
  getUsersList
} from "@/api/favorite"
import { useAuthStore } from "@/store"
import AnimeImage from "@/components/AnimeImage"
import { Score } from '@/components/Score'
import { FaHeart, FaRegHeart, FaPlus, FaTrash } from "react-icons/fa"
import { IoMdClose } from "react-icons/io"
import toast from 'react-hot-toast'
import { Comment } from "@/components/Comment"

interface Anime {
  Name: string
  Score: number
  Category: string | string[]
  Description: string
  Type: string
  Episodes: number
  Air_Date: string
  End_Date: string
  Image_URL: string
}

const defaultAnime: Anime = {
  Name: '',
  Score: 0,
  Category: [],
  Description: '',
  Type: '',
  Episodes: 0,
  Air_Date: '',
  End_Date: '',
  Image_URL: ''
}

export default function AnimePage() {
  const { user, isLoggedIn } = useAuthStore()
  const { id } = useParams<{id: string}>()
  const numberId = Number(id)
  const [currentAnime, setCurrentAnime] = useState<Anime>(defaultAnime)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newListTitle, setNewListTitle] = useState("")
  const [userLists, setUserLists] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [animeInLists, setAnimeInLists] = useState<string[]>([])

  const formatCategory = (category: string | string[] | undefined): string => {
    if (!category) return '無類型信息'
    if (Array.isArray(category)) return category.join(", ")
    if (typeof category === 'string') {
      if (category.includes(',')) return category
      if (category.includes('|')) return category.split('|').join(", ")
      return category
    }
    return '無類型信息'
  }

  const checkAnimeInLists = async () => {
    if (!isLoggedIn || !user?.user_id) return
  
    try {
      const promises = userLists.map(async (list) => {
        const result = await getFavoriteList(user.user_id, list)
        if (!result.error && result.anime_id.includes(numberId)) {
          return list
        }
        return null
      })
  
      const results = await Promise.all(promises)
      const containingLists = results.filter((list): list is string => list !== null)
      setAnimeInLists(containingLists)
    } catch (err) {
      console.error("Error checking anime lists:", err)
    }
  }

  useEffect(() => {
    if (userLists.length > 0) {
      checkAnimeInLists()
    }
  }, [userLists, numberId])

  useEffect(() => {
    const fetchAndSetAnime = async () => {
      if (!id) {
        console.log('No ID provided')
        return
      }
      
      try {
        setLoading(true)
        const animeData = await fetchAnimeById(numberId)
        
        const processCategory = (category: string | string[] | unknown): string[] => {
          if (typeof category === 'string') {
            return category.split(',').map((cat: string) => cat.trim())
          }
          if (Array.isArray(category)) {
            return category.map(String)
          }
          return []
        }
  
        const processedAnime = {
          ...animeData,
          Category: processCategory(animeData.Category)
        }
        
        setCurrentAnime(processedAnime)
        setError("")
      } catch (err) {
        console.error("Error fetching anime:", err)
        setError("無法獲取動畫信息")
        toast.error("無法獲取動畫信息")
      } finally {
        setLoading(false)
      }
    }
    fetchAndSetAnime()
  }, [id])

  const fetchUserLists = async () => {
    if (!isLoggedIn || !user?.user_id) {
      return
    }

    try {
      const result = await getUsersList(user.user_id)
      if (result.error) {
        throw new Error(result.error)
      }
      setUserLists(result.list_titles)
      setError("")
    } catch (err) {
      console.error("Error fetching user lists:", err)
      setError("獲取收藏清單失敗")
      toast.error("獲取收藏清單失敗")
    }
  }

  useEffect(() => {
    fetchUserLists()
  }, [user, isLoggedIn])

  const handleAddToList = async (listTitle: string) => {
    if (!isLoggedIn || !user?.user_id) {
      toast.error("請先登入")
      return
    }

    try {
      const result = await insertAnimeToList(user.user_id, listTitle, numberId)
      if (result.error) {
        throw new Error(result.error)
      }
      setAnimeInLists(prev => [...prev, listTitle])
      setIsModalOpen(false)
      setError("")
      toast.success(`已添加到「${listTitle}」`)
    } catch (err) {
      console.error("Error adding to list:", err)
      setError("添加失敗，請稍後再試")
      toast.error("添加失敗，請稍後再試")
    }
  }

  const handleRemoveFromList = async (listTitle: string) => {
    if (!isLoggedIn || !user?.user_id) {
      toast.error("請先登入")
      return
    }
  
    try {
      const result = await deleteAnimeFromList(user.user_id, listTitle, numberId)
      if (result.error) {
        throw new Error(result.error)
      }
      setAnimeInLists(prev => prev.filter(list => list !== listTitle))
      toast.success(`已從「${listTitle}」中移除`)
    } catch (err) {
      console.error("Error removing from list:", err)
      toast.error("移除失敗，請稍後再試")
    }
  }

  const handleCreateNewList = async () => {
    if (!isLoggedIn || !user?.user_id) {
      toast.error("請先登入")
      return
    }

    if (!newListTitle.trim()) {
      setError("清單名稱不能為空")
      toast.error("清單名稱不能為空")
      return
    }

    try {
      const result = await createFavoriteList(user.user_id, newListTitle)
      if (result.error) {
        throw new Error(result.error)
      }
      setUserLists([...userLists, newListTitle])
      await handleAddToList(newListTitle)
      setNewListTitle("")
      setError("")
      toast.success("已創建新清單並添加動畫")
    } catch (err) {
      console.error("Error creating list:", err)
      setError("創建清單失敗，請稍後再試")
      toast.error("創建清單失敗，請稍後再試")
    }
  }

  const handleQuickAdd = async () => {
    if (!isLoggedIn || !user?.user_id) {
      toast.error("請先登入")
      return
    }
  
    try {
      if (animeInLists.includes("快速收藏")) {
        const result = await deleteAnimeFromList(user.user_id, "快速收藏", numberId)
        if (result.error) {
          throw new Error(result.error)
        }
        setAnimeInLists(prev => prev.filter(list => list !== "快速收藏"))
        toast.success("已從快速收藏中移除")
      } else {
        let result = await insertAnimeToList(user.user_id, "快速收藏", numberId)
        
        if (result.error?.includes("List not exist")) {
          await createFavoriteList(user.user_id, "快速收藏")
          result = await insertAnimeToList(user.user_id, "快速收藏", numberId)
        }
  
        if (result.error) {
          throw new Error(result.error)
        }
  
        setAnimeInLists(prev => [...prev, "快速收藏"])
        if (!userLists.includes("快速收藏")) {
          setUserLists(prev => [...prev, "快速收藏"])
        }
        toast.success("已添加到快速收藏")
      }
    } catch (err) {
      console.error("Error handling quick favorite:", err)
      toast.error("操作失敗，請稍後再試")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (!currentAnime) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        {error || "無法獲取動畫信息"}
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* 主要內容區塊 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* 左側區塊 - 圖片和評分 */}
                <div className="w-full md:w-1/3 p-6 bg-gray-50 dark:bg-gray-800/50">
                  <div className="sticky top-6 space-y-6">
                    <div className="rounded-lg overflow-hidden shadow-md">
                      <AnimeImage animeId={numberId} />
                    </div>
                    {user?.user_id && (
                      <Score
                        user_id={user.user_id}
                        currentAnimeId={numberId}
                      />
                    )}
                  </div>
                </div>
                
                {/* 右側區塊 - 詳細信息 */}
                <div className="flex-1 p-6 md:border-l border-gray-200 dark:border-gray-700">
                  {/* 標題和按鈕區 */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {currentAnime.Name}
                    </h1>
                    <div className="flex gap-3">
                      <button 
                        onClick={handleQuickAdd}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all transform hover:scale-105
                          ${animeInLists.includes("快速收藏")
                            ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800/50'
                            : 'bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg'
                          }`}
                      >
                        {animeInLists.includes("快速收藏") ? (
                          <>
                            <FaHeart className="text-lg" />
                            <span className="font-medium">已收藏</span>
                          </>
                        ) : (
                          <>
                            <FaRegHeart className="text-lg" />
                            <span className="font-medium">收藏</span>
                          </>
                        )}
                      </button>
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg 
                                 hover:bg-gray-700 transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
                      >
                        <FaPlus />
                        <span className="font-medium">加入清單</span>
                      </button>
                    </div>
                  </div>

                  {/* 資訊卡片 */}
                  <div className="grid gap-6">
                    {/* 基本資訊卡片 */}
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <p className="flex items-center gap-2">
                            <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[80px]">ID:</span>
                            <span className="text-gray-900 dark:text-gray-100">{numberId}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[80px]">評分:</span>
                            <span className="text-gray-900 dark:text-gray-100">{currentAnime.Score}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[80px]">類別:</span>
                            <span className="text-gray-900 dark:text-gray-100">{currentAnime.Type}</span>
                          </p>
                        </div>
                        <div className="space-y-3">
                          <p className="flex items-center gap-2">
                            <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[80px]">集數:</span>
                            <span className="text-gray-900 dark:text-gray-100">
                              {currentAnime.Episodes === -1 ? "連載中" : currentAnime.Episodes}
                            </span>
                          </p>
                          <p className="flex items-center gap-2">
                            <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[80px]">開播:</span>
                            <span className="text-gray-900 dark:text-gray-100">{currentAnime.Air_Date}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[80px]">結束:</span>
                            <span className="text-gray-900 dark:text-gray-100">
                              {currentAnime.End_Date === "?" ? "尚未結束" : currentAnime.End_Date}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 類型標籤 */}
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-5">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">類型</h3>
                      <div className="flex flex-wrap gap-2">
                        {formatCategory(currentAnime.Category).split(", ").map((category, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 
                                     rounded-full text-sm font-medium"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 描述卡片 */}
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-5">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">描述</h3>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {currentAnime.Description}
                      </p>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700">
                      <div className="p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">評論區</h2>
                        <Comment 
                          user_id={user?.user_id}
                          username={user?.username}
                          currentAnimeId={numberId}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex justify-between items-center"
                  >
                    添加到收藏清單
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
                    >
                      <IoMdClose size={24} />
                    </button>
                  </Dialog.Title>

                  {error && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
                  )}

                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">選擇現有清單</h4>
                    <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                      {userLists.map((list) => {
                        const isInList = animeInLists.includes(list);
                        return (
                          <button
                            key={list}
                            onClick={() => isInList ? handleRemoveFromList(list) : handleAddToList(list)}
                            className={`w-full text-left px-4 py-2 text-sm flex justify-between items-center
                              ${isInList 
                                ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200' 
                                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'} 
                              rounded-lg transition-colors`}
                          >
                            <span>{list}</span>
                            {isInList ? (
                              <FaTrash className="h-4 w-4" />
                            ) : (
                              <FaPlus className="h-4 w-4" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">建立新清單</h4>
                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        value={newListTitle}
                        onChange={(e) => setNewListTitle(e.target.value)}
                        className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm 
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="輸入清單名稱"
                      />
                      <button
                        onClick={handleCreateNewList}
                        className="inline-flex justify-center rounded-lg border border-transparent bg-red-500 
                                 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors"
                      >
                        <FaPlus className="mr-2" />
                        建立
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}