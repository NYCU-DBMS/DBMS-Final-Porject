import { useEffect, useState } from 'react';
import { getScore } from '@/api/score';


interface ScoreProps {
  user_id: string;
  currentAnimeId: number;
}

export const Score = ({ user_id, currentAnimeId }: ScoreProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [score, setScore] = useState(-1);
  useEffect(() => {
    const fetchScore = async () => {
      const result = await getScore(user_id, currentAnimeId);
      setScore(result.score);
      setIsLoading(false);
    };
    fetchScore();
  }, [user_id, currentAnimeId]);
  if (isLoading) {
    return <div className='text-center'>加載評分中...請稍後</div>;
  }
  return <div className='text-center'>你的評分: {score === -1 ? '尚未評分' : score}</div>;
}