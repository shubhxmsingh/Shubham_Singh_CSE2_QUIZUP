import { Difficulty } from '@prisma/client';

export function adjustDifficulty(
  currentDifficulty: Difficulty,
  correctAnswersInRow: number,
  incorrectAnswersInRow: number
): Difficulty {
  // If student gets 3 or more correct in a row, increase difficulty
  if (correctAnswersInRow >= 3) {
    switch (currentDifficulty) {
      case Difficulty.EASY:
        return Difficulty.MEDIUM;
      case Difficulty.MEDIUM:
        return Difficulty.HARD;
      case Difficulty.HARD:
        return Difficulty.HARD; // Already at highest difficulty
    }
  }

  // If student gets 2 or more incorrect in a row, decrease difficulty
  if (incorrectAnswersInRow >= 2) {
    switch (currentDifficulty) {
      case Difficulty.HARD:
        return Difficulty.MEDIUM;
      case Difficulty.MEDIUM:
        return Difficulty.EASY;
      case Difficulty.EASY:
        return Difficulty.EASY; // Already at lowest difficulty
    }
  }

  // If neither condition is met, maintain current difficulty
  return currentDifficulty;
}

export function getNextQuestion(
  questions: Array<{ id: string; difficulty: Difficulty }>,
  currentDifficulty: Difficulty,
  answeredQuestions: Set<string>
): string | null {
  // Filter out already answered questions
  const availableQuestions = questions.filter(
    q => !answeredQuestions.has(q.id)
  );

  // First try to find a question of the same difficulty
  const sameDifficultyQuestion = availableQuestions.find(
    q => q.difficulty === currentDifficulty
  );

  if (sameDifficultyQuestion) {
    return sameDifficultyQuestion.id;
  }

  // If no question of same difficulty, try one level easier
  const easierDifficulty = currentDifficulty === Difficulty.HARD
    ? Difficulty.MEDIUM
    : Difficulty.EASY;

  const easierQuestion = availableQuestions.find(
    q => q.difficulty === easierDifficulty
  );

  if (easierQuestion) {
    return easierQuestion.id;
  }

  // If no easier question, try any available question
  return availableQuestions[0]?.id || null;
} 