import FavoriteAnime from "./FavoriteAnime";


export default function FavoriteList() {
  return (
    <div className="flex gap-5 m-10 p-10 dark:bg-slate-700 justify-center">
      <FavoriteAnime image="anime1.jpg" title="Attack on Titan" />
      <FavoriteAnime image="anime2.jpeg" title="Demon Slayer" />
      <FavoriteAnime image="anime1.jpg" title="Attack on Titan" />
      <FavoriteAnime image="anime2.jpeg" title="Demon Slayer" />
    </div>
  )
}
