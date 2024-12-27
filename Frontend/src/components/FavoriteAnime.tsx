import { useState } from 'react';
import { Link } from 'react-router-dom';

interface FavoriteAnimeProps {
  id: number;
  image: string;
  title: string;
  onRemove: (id: number) => void;
}

export default function FavoriteAnime({ id, image, title, onRemove }: FavoriteAnimeProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative overflow-hidden rounded-lg shadow-lg bg-white dark:bg-slate-800"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/anime/${id}`}>
        <div className="aspect-[3/4] w-full">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      </Link>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white truncate">
          {title}
        </h3>
        {isHovered && (
          <button
            onClick={() => onRemove(id)}
            className="mt-2 w-full bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}