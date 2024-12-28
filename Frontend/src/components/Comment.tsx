import { getComment, deleteCommentByID } from "@/api/comment"
import { useEffect, useState } from "react"

interface CommentProps {
  username?: string
  currentAnimeId: number
}

interface CommentData {
  id: number
  text: string
  user: string
}

export const Comment = ({ username, currentAnimeId }: CommentProps) => {
  const [comments, setComments] = useState<CommentData[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

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
        console.log(transformedComments)
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

      {loading && <p>Loading comments...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && comments.length === 0 && <p>No comments available.</p>}
      {!loading && !error && comments.length > 0 && (
        <ul className="w-full max-w-md">
          {comments.map((comment) => {
              console.log("comment:", comment, "username:", username) 
              return (
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
              )
            })
          }
        </ul>
      )}
    </div>
  )
}