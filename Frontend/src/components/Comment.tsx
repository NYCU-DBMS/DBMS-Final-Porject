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
        // Refresh comments after successful submission
        const updatedResponse = await getComment(currentAnimeId)
        const transformedComments = updatedResponse.comment_id.map((id: number, index: number) => ({
          id,
          text: updatedResponse.content[index],
          user: updatedResponse.username[index],
        }))
        setComments(transformedComments)
        setNewComment("") // Clear input after successful submission
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
    <div className="flex flex-col items-center mt-5">
      <h1>Comment</h1>
      
      {/* Comment Input Section */}
      {username && (
        <form onSubmit={handleSubmit} className="w-full max-w-md mb-4">
          <div className="flex flex-col gap-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your comment here..."
              className="dark:bg-slate-400 w-full p-2 border rounded-md resize-none"
              rows={3}
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit Comment"}
            </button>
          </div>
        </form>
      )}

      {loading && <p>Loading comments...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && comments.length === 0 && <p>No comments available.</p>}
      
      {!loading && !error && comments.length > 0 && (
        <ul className="w-full max-w-md">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="p-2 border-b border-gray-300 flex justify-between items-center"
            >
              <p>
                <span className="text-sm text-gray-500">{comment.user}: </span>
                {comment.text}
              </p>
              {username === comment.user && (
                <button
                  className="text-red-500 hover:text-red-700 text-sm"
                  onClick={() => handleDelete(comment.id)}
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
