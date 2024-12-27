import React from 'react'

interface ScoreProps {
  currentScore: number
  onScoreChange: (score: number) => void
  onRemoveScore: () => void
}

export const Score: React.FC<ScoreProps> = ({ currentScore, onScoreChange, onRemoveScore }) => {
  // you can use currentScore, onScoreChange, onRemoveScore here
  return (
    <div>Score</div>
  )
}
