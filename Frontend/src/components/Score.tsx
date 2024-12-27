import { useEffect, useState } from 'react';
import { getScore, addScore, removeScore } from '@/api/score';

interface ScoreProps {
  user_id: string;
  currentAnimeId: number;
}

export const Score = ({ user_id, currentAnimeId }: ScoreProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isOperationLoading, setIsOperationLoading] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [inputScore, setInputScore] = useState<number | ''>('');

  useEffect(() => {
    const fetchScore = async () => {
      setIsLoading(true);
      try {
        const result = await getScore(user_id, currentAnimeId);
        setScore(result.score);
      } catch (error) {
        console.error("Error fetching score:", error);
        alert('獲取評分失敗，請稍後再試');
      } finally {
        setIsLoading(false);
      }
    };
    fetchScore();
  }, [user_id, currentAnimeId]);

  const handleScoreChange = async () => {
    if (Number(inputScore) < 0 || Number(inputScore) > 10) {
      alert('請輸入有效的評分（0到10之間）');
      return;
    }

    setIsOperationLoading(true);
    try {
      await addScore(user_id, currentAnimeId, Number(inputScore));
      setScore(Number(inputScore));
      setInputScore('');
    } catch (error) {
      console.error("Error adding score:", error);
      alert('評分失敗，請稍後再試');
    } finally {
      setIsOperationLoading(false);
    }
  };

  const handleRemoveScore = async () => {
    setIsOperationLoading(true);
    try {
      await removeScore(user_id, currentAnimeId);
      setScore(null);
    } catch (error) {
      console.error("Error removing score:", error);
      alert('移除評分失敗，請稍後再試');
    } finally {
      setIsOperationLoading(false);
    }
  };

  if (isLoading || isOperationLoading) {
    return <div className='text-center'>加載評分中...請稍後</div>;
  }

  return (
    <div className='flex items-center justify-center gap-4'>
      <div className='text-center'>你的評分: {score === null ? '尚未評分' : score}</div>
      <div className='flex items-center gap-2'>
        <input
          type="number"
          min={0}
          max={10}
          value={inputScore}
          onChange={(e) => setInputScore(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder="輸入評分（0-10）"
          className="border rounded p-2 dark:bg-gray-800"
          disabled={isOperationLoading}
        />
        <button
          onClick={handleScoreChange}
          className="bg-blue-500 text-white rounded px-4 py-2 disabled:opacity-50"
          disabled={isOperationLoading}
        >
          提交評分
        </button>
        {score !== null && (
          <button
            onClick={handleRemoveScore}
            className="bg-red-500 text-white rounded px-4 py-2 disabled:opacity-50"
            disabled={isOperationLoading}
          >
            移除評分
          </button>
        )}
      </div>
    </div>
  );
};