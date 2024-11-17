

type FavoriteAnimeProps = {
  image: string
  title: string
}

// pass image and title as props
export default function FavoriteAnime({ image, title }: FavoriteAnimeProps) {
  return (
    <div className="overflow-hidden aspect-[3/2] w-[20%]">
      <div>{title}</div>
      <img src={image} alt={title} className="w-full h-full object-cover"/>
    </div>
  )
}
