import FavoriteList from "@/components/FavoriteList";


export default function FavoriteListPage() {
  return (
    <div className="flex flex-col items-center my-10">
      <div className="text-2xl font-bold">My Favorite Anime List</div>
      <FavoriteList />
    </div>
  )
}
