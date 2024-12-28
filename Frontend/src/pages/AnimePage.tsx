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
      <div className="container mx-auto px-4 py-8 bg-white dark:bg-gray-900">
        <div className="flex flex-col md:flex-row items-start gap-8 max-w-6xl mx-auto">
          <div className="w-full md:w-1/3 space-y-4">
            <AnimeImage animeId={numberId} />
            {user?.user_id && (
              <Score
                user_id={user.user_id}
                currentAnimeId={numberId}
              />
            )}
          </div>
          
          <div className="flex flex-col gap-4 w-full md:w-2/3">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold dark:text-white">{currentAnime.Name}</h1>
              <div className="flex gap-2">
                <button 
                  onClick={handleQuickAdd}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                    ${animeInLists.includes("快速收藏")
                      ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800'
                      : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                >
                  {animeInLists.includes("快速收藏") ? (
                    <>
                      <FaHeart />
                      取消收藏
                    </>
                  ) : (
                    <>
                      <FaRegHeart />
                      快速收藏
                    </>
                  )}
                </button>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <FaPlus />
                  添加到清單
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 dark:text-white">
              <p className="text-sm text-gray-600 dark:text-gray-300">ID: {numberId}</p>
              <p><strong>評分:</strong> {currentAnime.Score}</p>
              <p><strong>類型:</strong> {formatCategory(currentAnime.Category)}</p>
              <p className="max-w-prose"><strong>描述:</strong> {currentAnime.Description}</p>
              <p><strong>類別:</strong> {currentAnime.Type}</p>
              <p><strong>集數:</strong> {currentAnime.Episodes === -1 ? "連載中" : currentAnime.Episodes}</p>
              <p><strong>開播日期:</strong> {currentAnime.Air_Date}</p>
              <p><strong>結束日期:</strong> {currentAnime.End_Date === "?" ? "尚未結束" : currentAnime.End_Date}</p>
            </div>
          </div>
        </div>
        <div className="mt-8">
          {user?.user_id && (
            <Score
              user_id={user.user_id}
              currentAnimeId={numberId}
            />
          )}

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