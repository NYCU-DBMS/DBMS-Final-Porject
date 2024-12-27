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
import { FaHeart, FaRegHeart, FaPlus } from "react-icons/fa"
import { IoMdClose } from "react-icons/io"
import toast from 'react-hot-toast'

interface Anime {
  Name: string
  Score: number
  Category: string[]
  Description: string
  Type: string
  Episodes: number
  Air_Date: string
  End_Date: string
  Image_URL: string
}

interface FavoriteList {
  anime_id: number[]
  anime_name: string[]
}

export default function AnimePage() {
  const { user, isLoggedIn } = useAuthStore()
  const { id } = useParams<{id: string}>()
  const numberId = Number(id)
  const [currentAnime, setCurrentAnime] = useState<Anime>()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newListTitle, setNewListTitle] = useState("")
  const [userLists, setUserLists] = useState<string[]>([])
  const [selectedList, setSelectedList] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // 獲取動畫詳情
  useEffect(() => {
    const fetchAndSetAnime = async () => {
      if (!id) return
      
      try {
        setLoading(true)
        const animeData = await fetchAnimeById(numberId)
        setCurrentAnime(animeData)
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

  // 獲取用戶的收藏清單
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
      setIsModalOpen(false)
      setError("")
      toast.success(`已添加到「${listTitle}」`)
    } catch (err) {
      console.error("Error adding to list:", err)
      setError("添加失敗，請稍後再試")
      toast.error("添加失敗，請稍後再試")
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
      // 先嘗試添加到"我的收藏"
      let result = await insertAnimeToList(user.user_id, "我的收藏", numberId)
      
      // 如果清單不存在，先創建
      if (result.error?.includes("List not exist")) {
        await createFavoriteList(user.user_id, "我的收藏")
        result = await insertAnimeToList(user.user_id, "我的收藏", numberId)
      }

      if (result.error) {
        throw new Error(result.error)
      }

      toast.success("已添加到我的收藏")
    } catch (err) {
      console.error("Error quick adding:", err)
      toast.error("快速收藏失敗")
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start gap-8 max-w-6xl mx-auto">
          <div className="w-full md:w-1/3">
            <AnimeImage animeId={numberId} />
          </div>
          <div className="flex flex-col gap-4 w-full md:w-2/3">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold dark:text-white">{currentAnime.Name}</h1>
              <div className="flex gap-2">
                <button 
                  onClick={handleQuickAdd}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <FaHeart />
                  快速收藏
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
              <p><strong>類型:</strong> {currentAnime.Category.join(", ")}</p>
              <p className="max-w-prose"><strong>描述:</strong> {currentAnime.Description}</p>
              <p><strong>類別:</strong> {currentAnime.Type}</p>
              <p><strong>集數:</strong> {currentAnime.Episodes === -1 ? "連載中" : currentAnime.Episodes}</p>
              <p><strong>開播日期:</strong> {currentAnime.Air_Date}</p>
              <p><strong>結束日期:</strong> {currentAnime.End_Date === "?" ? "尚未結束" : currentAnime.End_Date}</p>
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
                    <div className="mt-2 space-y-2">
                      {userLists.map((list) => (
                        <button
                          key={list}
                          onClick={() => handleAddToList(list)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                          {list}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">建立新清單</h4>
                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        value={newListTitle}
                        onChange={(e) => setNewListTitle(e.target.value)}
                        className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="輸入清單名稱"
                      />
                      <button
                        onClick={handleCreateNewList}
                        className="inline-flex justify-center rounded-lg border border-transparent bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
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