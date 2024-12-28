interface CommentProps {
  user_id?: string
  currentAnimeId: number
}

export const Comment = ({ user_id, currentAnimeId }: CommentProps) => {
  return (
    <div className="flex flex-col items-center mt-5">
      <h1>Comment</h1>
      <p>user_id: {user_id}</p>
      <p>currentAnimeId: {currentAnimeId}</p>
    </div>
  )
}