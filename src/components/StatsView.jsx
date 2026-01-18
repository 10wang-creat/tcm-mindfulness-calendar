import { motion } from 'framer-motion';
import { 
  Flame, Clock, Leaf, Award, Calendar, TrendingUp, RotateCcw
} from 'lucide-react';
import { useUserStats } from '../hooks/useUserStats';

export default function StatsView({ herbsDatabase }) {
  const { stats, resetStats } = useUserStats();
  
  // 主要統計卡片數據
  const mainStats = [
    { 
      label: '連續天數', 
      value: stats.currentStreak, 
      icon: Flame, 
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      suffix: '天'
    },
    { 
      label: '累計冥想', 
      value: stats.totalMeditations, 
      icon: Calendar, 
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      suffix: '次'
    },
    { 
      label: '總時長', 
      value: stats.totalMinutes, 
      icon: Clock, 
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      suffix: '分鐘'
    },
    { 
      label: '收集藥材', 
      value: stats.collectedHerbs.length, 
      icon: Leaf, 
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      suffix: `/${herbsDatabase?.length || 56}`
    }
  ];

  // 週活動標籤
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  
  // 計算收集進度百分比
  const collectionProgress = herbsDatabase 
    ? Math.round((stats.collectedHerbs.length / herbsDatabase.length) * 100)
    : 0;

  // 處理重置確認
  const handleReset = () => {
    if (window.confirm('確定要重置所有統計數據嗎？此操作無法復原。')) {
      resetStats();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 py-6 pb-24"
    >
      {/* 標題 */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-serif font-bold text-gray-800 mb-1">我的旅程</h2>
        <p className="text-sm text-gray-500">
          {stats.firstUseDate ? `開始於 ${stats.firstUseDate}` : '開始你的正念之旅'}
        </p>
      </div>

      {/* 主要統計卡片 */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {mainStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`${stat.bgColor} rounded-2xl p-4 shadow-sm`}
          >
            <stat.icon className={`w-6 h-6 ${stat.color} mb-2`} />
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-800">{stat.value}</span>
              <span className="text-sm text-gray-500">{stat.suffix}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* 最長連續紀錄 */}
      {stats.longestStreak > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 mb-6 flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <Award className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">最長連續紀錄</p>
            <p className="text-xl font-bold text-amber-600">{stats.longestStreak} 天</p>
          </div>
        </motion.div>
      )}

      {/* 本週活動 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-5 shadow-sm mb-6"
      >
        <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          本週活動
        </h3>
        <div className="flex justify-between items-end h-24">
          {stats.weeklyActivity.map((count, index) => {
            const maxCount = Math.max(...stats.weeklyActivity, 1);
            const height = count > 0 ? Math.max((count / maxCount) * 100, 20) : 8;
            const isToday = new Date().getDay() === index;
            
            return (
              <div key={index} className="flex flex-col items-center gap-2 flex-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: 0.5 + index * 0.05, duration: 0.3 }}
                  className={`w-6 rounded-full ${
                    count > 0 
                      ? isToday ? 'bg-blue-500' : 'bg-blue-300'
                      : 'bg-gray-100'
                  }`}
                />
                <span className={`text-xs ${isToday ? 'font-bold text-blue-600' : 'text-gray-400'}`}>
                  {weekDays[index]}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* 藥材收集進度 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-5 shadow-sm mb-6"
      >
        <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Leaf className="w-4 h-4 text-green-500" />
          藥材收集進度
        </h3>
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500">已收集</span>
            <span className="font-medium text-green-600">{collectionProgress}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${collectionProgress}%` }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
            />
          </div>
        </div>
        <p className="text-xs text-gray-400">
          {stats.collectedHerbs.length} / {herbsDatabase?.length || 56} 種藥材
        </p>
      </motion.div>

      {/* 新手提示（無數據時顯示） */}
      {stats.totalMeditations === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 text-center mb-6"
        >
          <div className="text-4xl mb-3">🧘</div>
          <h3 className="font-semibold text-gray-800 mb-2">開始你的正念之旅</h3>
          <p className="text-sm text-gray-500">
            回到「今日」頁面，點擊播放按鈕開始第一次冥想，
            你的進度將會在這裡顯示。
          </p>
        </motion.div>
      )}

      {/* 重置按鈕 */}
      {stats.totalMeditations > 0 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          onClick={handleReset}
          className="w-full py-3 text-sm text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          重置統計數據
        </motion.button>
      )}

      {/* 版本資訊 */}
      <div className="text-center mt-6 text-xs text-gray-300">
        <p>中藥正念日曆 v1.0.0</p>
      </div>
    </motion.div>
  );
}
