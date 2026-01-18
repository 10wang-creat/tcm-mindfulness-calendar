import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'tcm_mindfulness_stats';

const getDefaultStats = () => ({
  totalMeditations: 0,
  totalMinutes: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastMeditationDate: null,
  collectedHerbs: [],
  weeklyActivity: [0, 0, 0, 0, 0, 0, 0], // 週日到週六
  monthlyMeditations: 0,
  firstUseDate: null
});

export function useUserStats() {
  const [stats, setStats] = useState(getDefaultStats);

  // 載入統計數據
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // 檢查是否需要重置週活動（新的一週）
        const lastDate = parsed.lastMeditationDate ? new Date(parsed.lastMeditationDate) : null;
        const now = new Date();
        
        // 如果上次冥想超過一天，檢查連續天數
        if (lastDate) {
          const daysDiff = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
          if (daysDiff > 1) {
            parsed.currentStreak = 0; // 中斷連續
          }
        }
        
        setStats({ ...getDefaultStats(), ...parsed });
      }
    } catch (e) {
      console.error('Failed to load stats:', e);
    }
  }, []);

  // 保存統計數據
  const saveStats = useCallback((newStats) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
      setStats(newStats);
    } catch (e) {
      console.error('Failed to save stats:', e);
    }
  }, []);

  // 記錄一次冥想完成
  const recordMeditation = useCallback((herbName, minutes = 5) => {
    const now = new Date();
    const today = now.toDateString();
    const dayOfWeek = now.getDay();
    
    setStats(prev => {
      const lastDate = prev.lastMeditationDate;
      const isNewDay = lastDate !== today;
      
      // 計算連續天數
      let newStreak = prev.currentStreak;
      if (isNewDay) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastDate === yesterday.toDateString()) {
          newStreak = prev.currentStreak + 1;
        } else if (!lastDate) {
          newStreak = 1;
        } else {
          newStreak = 1; // 重新開始
        }
      }
      
      // 更新週活動
      const newWeekly = [...prev.weeklyActivity];
      newWeekly[dayOfWeek] = (newWeekly[dayOfWeek] || 0) + 1;
      
      // 收集藥材
      const newCollected = prev.collectedHerbs.includes(herbName)
        ? prev.collectedHerbs
        : [...prev.collectedHerbs, herbName];
      
      const newStats = {
        ...prev,
        totalMeditations: prev.totalMeditations + 1,
        totalMinutes: prev.totalMinutes + minutes,
        currentStreak: newStreak,
        longestStreak: Math.max(prev.longestStreak, newStreak),
        lastMeditationDate: today,
        collectedHerbs: newCollected,
        weeklyActivity: newWeekly,
        monthlyMeditations: prev.monthlyMeditations + 1,
        firstUseDate: prev.firstUseDate || today
      };
      
      saveStats(newStats);
      return newStats;
    });
  }, [saveStats]);

  // 重置統計
  const resetStats = useCallback(() => {
    const defaultStats = getDefaultStats();
    saveStats(defaultStats);
  }, [saveStats]);

  return {
    stats,
    recordMeditation,
    resetStats
  };
}
