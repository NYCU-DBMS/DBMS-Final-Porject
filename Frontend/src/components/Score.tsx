import { useEffect, useState, useRef } from 'react';
import { getScore, addScore, removeScore } from '@/api/score';
import { FaStar } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface ScoreProps {
  user_id: string;
  currentAnimeId: number;
  onScoreUpdate?: (newTotalScore: number) => void; // 新增這個屬性
}

const SCORE_STORAGE_KEY = 'anime_scores';

export const Score = ({ user_id, currentAnimeId, onScoreUpdate }: ScoreProps) => {
  const [score, setScore] = useState<number | null>(() => {
    try {
      const storedScores = localStorage.getItem(SCORE_STORAGE_KEY);
      if (storedScores) {
        const scores = JSON.parse(storedScores);
        return scores[`${user_id}_${currentAnimeId}`] || null;
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
    }
    return null;
  });
  
  const [hoveredScore, setHoveredScore] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const lastRequestId = useRef(0);

  const saveScoreToStorage = (newScore: number | null) => {
    try {
      const storedScores = localStorage.getItem(SCORE_STORAGE_KEY);
      const scores = storedScores ? JSON.parse(storedScores) : {};
      if (newScore === null) {
        delete scores[`${user_id}_${currentAnimeId}`];
      } else {
        scores[`${user_id}_${currentAnimeId}`] = newScore;
      }
      localStorage.setItem(SCORE_STORAGE_KEY, JSON.stringify(scores));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  useEffect(() => {
    const fetchScore = async () => {
      const requestId = ++lastRequestId.current;
      
      try {
        const result = await getScore(user_id, currentAnimeId);
        // 確保這是最新的請求
        if (requestId === lastRequestId.current) {
          setScore(result.score);
          saveScoreToStorage(result.score);
        }
      } catch (error) {
        console.error("Error fetching score:", error);
      }
    };

    fetchScore();
  }, [user_id, currentAnimeId]);

  const handleScoreChange = async (newScore: number) => {
    if (isUpdating) return;
    
    const requestId = ++lastRequestId.current;
    const previousScore = score;
    
    setIsUpdating(true);
    setScore(newScore);
    saveScoreToStorage(newScore);
  
    try {
      const result = await addScore(user_id, currentAnimeId, newScore);
      // 確保這是最新的請求
      if (requestId !== lastRequestId.current) return;
  
      if (result.error) {
        throw new Error(typeof result.error === 'string' ? result.error : '評分失敗');
      }
      
      // 更新總評分
      if (onScoreUpdate && result.totalScore !== undefined) {
        onScoreUpdate(result.totalScore);
      }
      
      toast.success('評分成功！', { duration: 2000 });
    } catch (err: any) {
      // 只有當這是最新的請求時才回滾
      if (requestId === lastRequestId.current) {
        setScore(previousScore);
        saveScoreToStorage(previousScore);
        toast.error(err?.message || '評分失敗，請稍後再試');
      }
    } finally {
      if (requestId === lastRequestId.current) {
        setIsUpdating(false);
      }
    }
  };

  const handleRemoveScore = async () => {
    if (isUpdating) return;
    
    const requestId = ++lastRequestId.current;
    const previousScore = score;
    
    setIsUpdating(true);
    setScore(null);
    saveScoreToStorage(null);

    try {
      const result = await removeScore(user_id, currentAnimeId);
      if (requestId !== lastRequestId.current) return;
    
      if (result.error) {
        throw new Error(result.error);
      }

      // 更新總評分
      if (onScoreUpdate && result.totalScore !== undefined) {
        onScoreUpdate(result.totalScore);
      }

      toast.success('已移除評分', { duration: 2000 });
    } catch (err) {
      if (requestId === lastRequestId.current) {
        setScore(previousScore);
        saveScoreToStorage(previousScore);
        const errorMessage = err instanceof Error ? err.message : '移除評分失敗';
        toast.error(errorMessage);
      }
    } finally {
      if (requestId === lastRequestId.current) {
        setIsUpdating(false);
      }
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-md">
      <div className="flex flex-col items-center gap-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {score === null ? '為這部動畫評分' : '你的評分'}
        </h3>
        
        <div className="flex items-center gap-1">
          {[...Array(10)].map((_, index) => {
            const currentScore = index + 1;
            return (
              <button
                key={currentScore}
                disabled={isUpdating}
                className={`transition-transform hover:scale-110 focus:outline-none
                  ${isUpdating ? 'cursor-not-allowed opacity-50' : ''}`}
                onMouseEnter={() => setHoveredScore(currentScore)}
                onMouseLeave={() => setHoveredScore(null)}
                onClick={() => handleScoreChange(currentScore)}
              >
                <FaStar
                  className={`w-8 h-8 transition-colors duration-200
                    ${(hoveredScore !== null
                      ? currentScore <= hoveredScore
                      : currentScore <= (score || 0))
                      ? 'text-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                    }`}
                />
              </button>
            );
          })}
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-300">
          {isUpdating 
            ? '更新中...'
            : hoveredScore 
              ? `點擊給予 ${hoveredScore} 分`
              : score 
                ? `你給了 ${score} 分`
                : '滑鼠移到星星上預覽分數'}
        </div>

        {score !== null && (
          <button
            onClick={handleRemoveScore}
            disabled={isUpdating}
            className={`mt-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 
                     hover:text-red-700 dark:hover:text-red-300 transition-colors
                     ${isUpdating ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            移除評分
          </button>
        )}
      </div>
    </div>
  );
};