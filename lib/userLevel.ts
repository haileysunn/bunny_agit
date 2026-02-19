// 포인트 기반 레벨 및 칭호 시스템

export interface UserRank {
  level: number;
  title: string;
  minPoints: number;
  maxPoints: number;
}

export const RANK_SYSTEM: UserRank[] = [
  { level: 1, title: '아기 토끼', minPoints: 0, maxPoints: 99 },
  { level: 2, title: '꼬마 토끼', minPoints: 100, maxPoints: 299 },
  { level: 3, title: '탐험 토끼', minPoints: 300, maxPoints: 599 },
  { level: 4, title: '수색 토끼', minPoints: 600, maxPoints: 999 },
  { level: 5, title: '대장 토끼', minPoints: 1000, maxPoints: 1999 },
  { level: 6, title: '황금 토끼', minPoints: 2000, maxPoints: Infinity },
];

export function getUserRank(points: number): UserRank {
  return RANK_SYSTEM.find(
    rank => points >= rank.minPoints && points <= rank.maxPoints
  ) || RANK_SYSTEM[0];
}

export function getNextRank(points: number): UserRank | null {
  const currentRank = getUserRank(points);
  const currentIndex = RANK_SYSTEM.findIndex(r => r.level === currentRank.level);
  return RANK_SYSTEM[currentIndex + 1] || null;
}

export function getProgressToNextLevel(points: number): number {
  const currentRank = getUserRank(points);
  const nextRank = getNextRank(points);
  
  if (!nextRank) return 100;
  
  const progress = ((points - currentRank.minPoints) / (nextRank.minPoints - currentRank.minPoints)) * 100;
  return Math.min(Math.max(progress, 0), 100);
}
