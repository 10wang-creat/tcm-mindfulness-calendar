import { motion } from 'framer-motion';
import { 
  Flame, Clock, Leaf, Award, TrendingUp, RotateCcw, ChevronRight, Medal
} from 'lucide-react';
import { useUserStats } from '../hooks/useUserStats';
import { useMemo } from 'react';
import { herbImages } from '../data/calendarData';

// 等級計算
const calculateLevel = (totalMeditations, totalMinutes) => {
  const xp = (totalMeditations * 50) + (totalMinutes * 2);
  let level = 1;
  let xpForNextLevel = 100;
  let currentLevelXp = 0;
  let totalXpRequired = 100;

  while (xp >= totalXpRequired) {
    level++;
    currentLevelXp = totalXpRequired;
    xpForNextLevel = level * 150;
    totalXpRequired += xpForNextLevel;
  }

  const xpInCurrentLevel = xp - currentLevelXp;
  const xpProgress = (xpInCurrentLevel / xpForNextLevel) * 100;

  return { level, xp, xpInCurrentLevel, xpForNextLevel, xpProgress };
};

// 成就定義
const achievementsList = [
  { id: 'first', name: '初心者', desc: '完成第一次正念練習', icon: '🌱', condition: (s) => s.totalMeditations >= 1 },
  { id: 'week', name: '七日連續', desc: '連續7天打卡', icon: '🔥', condition: (s) => s.longestStreak >= 7 },
  { id: 'collector10', name: '藥材獵人', desc: '收集10種藥材', icon: '🌿', condition: (s) => s.collectedHerbs.length >= 10 },
  { id: 'time60', name: '一小時修行', desc: '累計正念時長達60分鐘', icon: '⏱️', condition: (s) => s.totalMinutes >= 60 },
  { id: 'sessions10', name: '十次冥想', desc: '完成10次冥想', icon: '🧘', condition: (s) => s.totalMeditations >= 10 },
  { id: 'collector25', name: '半百收藏', desc: '收集25種藥材', icon: '📚', condition: (s) => s.collectedHerbs.length >= 25 },
  { id: 'month', name: '三十日連續', desc: '連續30天打卡', icon: '💫', condition: (s) => s.longestStreak >= 30 },
  { id: 'master', name: '百日精進', desc: '累計100天練習', icon: '💯', condition: (s) => s.totalMeditations >= 100 },
  { id: 'allHerbs', name: '藥材大師', desc: '收集全部56種藥材', icon: '🏆', condition: (s) => s.collectedHerbs.length >= 56 },
];

export default function StatsView({ herbsDatabase }) {
  const { stats, resetStats } = useUserStats();

  // 計算等級
  const levelInfo = useMemo(() => 
    calculateLevel(stats.totalMeditations, stats.totalMinutes),
    [stats.totalMeditations, stats.totalMinutes]
  );

  // 計算成就解鎖狀態
  const achievements = useMemo(() => 
    achievementsList.map(ach => ({
      ...ach,
      unlocked: ach.condition(stats)
    })),
    [stats]
  );

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  // 週活動資料
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const maxActivity = Math.max(...stats.weeklyActivity, 1);

  // 最近收集的藥材
  const recentCollections = useMemo(() => {
    const recent = [...stats.collectedHerbs].slice(-5).reverse();
    return recent.map((name, idx) => ({
      name,
      image: herbImages[name],
      daysAgo: idx === 0 ? '最近' : `${idx + 1}天前`
    }));
  }, [stats.collectedHerbs]);

  // 收集進度
  const collectionProgress = herbsDatabase 
    ? Math.round((stats.collectedHerbs.length / herbsDatabase.length) * 100)
    : 0;

  // 處理重置
  const handleReset = () => {
    if (window.confirm('確定要重置所有統計數據嗎？此操作無法復原。')) {
      resetStats();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-blue-50 pb-28">
      {/* 沉浸式標題區域 + 等級系統 */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white px-4 pt-6 pb-5 rounded-b-3xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold">我的旅程</h1>
            <p className="text-teal-200 text-sm">正念修行之路</p>
          </div>
          {/* 等級徽章 */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-white/20 backdrop-blur rounded-full px-4 py-1.5 flex items-center gap-2"
          >
            <Medal className="w-5 h-5 text-yellow-300" />
            <span className="font-bold">Lv.{levelInfo.level}</span>
          </motion.div>
        </div>

        {/* 經驗值進度條 */}
        <div className="bg-white/20 rounded-full h-2.5 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${levelInfo.xpProgress}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-gradient-to-r from-yellow-300 to-amber-400 h-full rounded-full"
          />
        </div>
        <div className="flex justify-between mt-1">
          <p className="text-teal-200 text-xs">經驗值</p>
          <p className="text-teal-200 text-xs">{levelInfo.xpInCurrentLevel} / {levelInfo.xpForNextLevel} XP</p>
        </div>
      </div>

      {/* 統計卡片區域 */}
      <div className="px-4 -mt-4">
        <div className="grid grid-cols-2 gap-3">
          {/* 連續天數 - 特色卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-4 text-white shadow-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-6 h-6" />
            </div>
            <p className="text-3xl font-bold">{stats.currentStreak}</p>
            <p className="text-orange-100 text-sm">連續天數</p>
            {stats.longestStreak > stats.currentStreak && (
              <p className="text-orange-200 text-xs mt-1">最長 {stats.longestStreak} 天</p>
            )}
          </motion.div>

          {/* 累計冥想 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl p-4 shadow-sm"
          >
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
              <Award className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.totalMeditations}</p>
            <p className="text-gray-500 text-sm">累計冥想</p>
          </motion.div>

          {/* 總時長 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-4 shadow-sm"
          >
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {stats.totalMinutes}
              <span className="text-sm font-normal text-gray-400 ml-1">分鐘</span>
            </p>
            <p className="text-gray-500 text-sm">總時長</p>
          </motion.div>

          {/* 收集藥材 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-2xl p-4 shadow-sm"
          >
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-2">
              <Leaf className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {stats.collectedHerbs.length}
              <span className="text-sm font-normal text-gray-400 ml-1">/ {herbsDatabase?.length || 56}</span>
            </p>
            <p className="text-gray-500 text-sm">收集藥材</p>
            {/* 收集進度條 */}
            <div className="mt-2 bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${collectionProgress}%` }}
                transition={{ duration: 0.5 }}
                className="bg-green-500 h-full rounded-full"
              />
            </div>
          </motion.div>
        </div>

        {/* 週活動圖表 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-4 mt-3 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-500" />
              本週活動
            </h3>
          </div>
          <div className="flex items-end justify-between gap-1 h-20">
            {stats.weeklyActivity.map((value, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(value / maxActivity) * 100}%` }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className={`w-full rounded-t-md min-h-[4px] ${
                    value > 0 ? 'bg-teal-500' : 'bg-gray-200'
                  }`}
                />
                <span className="text-xs text-gray-400 mt-1">{weekDays[index]}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 成就徽章區 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl p-4 mt-3 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800">🏅 成就徽章</h3>
            <span className="text-sm text-teal-600">{unlockedCount}/{achievements.length}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {achievements.map((ach, index) => (
              <motion.div
                key={ach.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.03 }}
                className={`relative p-3 rounded-xl text-center ${
                  ach.unlocked 
                    ? 'bg-gradient-to-br from-amber-50 to-orange-50' 
                    : 'bg-gray-50'
                }`}
              >
                <div className={`text-2xl ${!ach.unlocked && 'grayscale opacity-40'}`}>
                  {ach.icon}
                </div>
                <p className={`text-xs font-medium mt-1 ${
                  ach.unlocked ? 'text-gray-700' : 'text-gray-400'
                }`}>
                  {ach.name}
                </p>
                {ach.unlocked && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 最近收集 */}
        {recentCollections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-4 mt-3 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800">🌿 最近收集</h3>
              <button className="text-teal-600 text-sm flex items-center gap-1">
                查看全部 <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {recentCollections.map((herb, index) => (
                <motion.div
                  key={herb.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + index * 0.05 }}
                  className="flex-shrink-0 w-16 text-center"
                >
                  <div className="w-14 h-14 mx-auto bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl flex items-center justify-center">
                    {herb.image ? (
                      <img 
                        src={herb.image} 
                        alt={herb.name}
                        className="w-10 h-10 object-contain"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <span className="text-2xl">🌿</span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-gray-700 mt-1 truncate">{herb.name}</p>
                  <p className="text-xs text-gray-400">{herb.daysAgo}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 重置按鈕 */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={handleReset}
          className="w-full mt-4 py-3 text-gray-400 text-sm flex items-center justify-center gap-2 hover:text-red-500 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          重置統計數據
        </motion.button>
      </div>
    </div>
  );
}
