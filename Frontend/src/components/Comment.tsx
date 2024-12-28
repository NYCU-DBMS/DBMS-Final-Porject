import { getComment } from "@/api/comment"
import { useEffect, useState } from "react"

interface CommentProps {
  user_id?: string
  currentAnimeId: number
}

interface CommentData {
  id: number
  text: string
  user: string
}

export const Comment = ({ user_id, currentAnimeId }: CommentProps) => {
  const [comments, setComments] = useState<CommentData[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

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

      {loading && <p>Loading comments...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && comments.length === 0 && <p>No comments available.</p>}
      {!loading && !error && comments.length > 0 && (
        <ul className="w-full max-w-md">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="p-2 border-b border-gray-300"
            >
              <p><span className="text-sm text-gray-500">{comment.user}: </span>{comment.text}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
