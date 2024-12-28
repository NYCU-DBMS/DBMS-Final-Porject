import { getComment, deleteCommentByID, addComment } from "@/api/comment"
import { useEffect, useState } from "react"

interface CommentProps {
  user_id?: string
  username?: string
  currentAnimeId: number
}

interface CommentData {
  id: number
  text: string
  user: string
}

export const Comment = ({ user_id, username, currentAnimeId }: CommentProps) => {
  const [comments, setComments] = useState<CommentData[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [newComment, setNewComment] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const handleDelete = async (commentId: number) => {
    try {
      const response = await deleteCommentByID(commentId)
      if (response.msg === "success") {
        setComments((prevComments) => prevComments.filter((comment) => comment.id !== commentId))
      } else {
        console.error(response.error)
      }
    } catch (error) {
      console.error("Error deleting comment:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !newComment.trim()) return

    setIsSubmitting(true)
    try {
      if (!user_id) throw new Error("User ID not found.")
      const response = await addComment(user_id, currentAnimeId, newComment)
      if (response.msg === "success") {
        const updatedResponse = await getComment(currentAnimeId)
        const transformedComments = updatedResponse.comment_id.map((id: number, index: number) => ({
          id,
          text: updatedResponse.content[index],
          user: updatedResponse.username[index],
        }))
        setComments(transformedComments)
        setNewComment("")
      } else {
        setError(response.error)
      }
    } catch (error) {
      setError("Failed to submit comment. Please try again.")
      console.error("Error submitting comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await getComment(currentAnimeId)
        const transformedComments = response.comment_id.map((id: number, index: number) => ({
          id,
          text: response.content[index],
          user: response.username[index],
        }))
        setComments(transformedComments)
      } catch (err) {
        setError("Failed to load comments. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [currentAnimeId])

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Comments</h1>
      {username && (
        <form onSubmit={handleSubmit} className="w-full mb-8">
          <div className="relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full p-4 border border-gray-200 rounded-lg resize-none
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       transition-all duration-200 ease-in-out
                       dark:bg-gray-700 dark:border-gray-600 dark:text-white
                       dark:placeholder-gray-400
                       pb-14"
              rows={4}
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="absolute bottom-3 right-3 w-10 h-10 rounded-full
                       flex items-center justify-center
                       transition-all duration-200 ease-in-out
                       disabled:bg-gray-300 disabled:cursor-not-allowed
                       disabled:text-gray-400
                       enabled:bg-blue-600 enabled:hover:bg-blue-700
                       enabled:text-white"
              aria-label="Submit comment"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-5 h-5"
              >
                <path 
                  d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z"
                />
              </svg>
            </button>
          </div>
        </form>
      )}

      {/* Loading and Error States */}
      {loading && (
        <div className="flex items-center justify-center w-full py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      {error && (
        <div className="w-full p-4 mb-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && comments.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No comments yet. Be the first to comment!</p>
        </div>
      )}
      
      {/* Comments List */}
      {!loading && !error && comments.length > 0 && (
        <ul className="w-full space-y-4">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm
                         hover:shadow-md transition-shadow duration-200
                         border border-gray-100 dark:border-gray-700"
            >
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2">
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {comment.user}
                  </span>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {comment.text}
                  </p>
                </div>
                {username === comment.user && (
                  <button
                    className="text-gray-400 hover:text-red-500 transition-colors duration-200
                             p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => handleDelete(comment.id)}
                    aria-label="Delete comment"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}