import { motion } from 'framer-motion';
import { Sun, Leaf, Award, TrendingUp } from 'lucide-react';

export default function StatsView({ solarTerms, herbsDatabase }) {
  // 統計數據
  const stats = [
    { label: '藥材總數', value: herbsDatabase.length, icon: Leaf, color: 'text-green-500' },
    { label: '節氣總數', value: solarTerms.length, icon: Sun, color: 'text-orange-500' },
    { label: '全年天數', value: 365, icon: TrendingUp, color: 'text-blue-500' },
    { label: '每藥週期', value: '6-7天', icon: Award, color: 'text-purple-500' }
  ];

  // 節氣分季統計
  const seasonStats = solarTerms.reduce((acc, term) => {
    acc[term.season] = (acc[term.season] || 0) + 1;
    return acc;
  }, {});

  const seasonInfo = [
    { name: '春', count: seasonStats['春'] || 0, color: 'bg-green-500', emoji: '🌱' },
    { name: '夏', count: seasonStats['夏'] || 0, color: 'bg-red-500', emoji: '☀️' },
    { name: '秋', count: seasonStats['秋'] || 0, color: 'bg-orange-500', emoji: '🍂' },
    { name: '冬', count: seasonStats['冬'] || 0, color: 'bg-blue-500', emoji: '❄️' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 py-6"
    >
      {/* 標題 */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-serif font-bold text-gray-800 mb-1">日曆統計</h2>
        <p className="text-sm text-gray-500">2026 中藥正念日曆資訊</p>
      </div>

      {/* 主要統計卡片 */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-5 shadow-sm"
          >
            <stat.icon className={`w-8 h-8 ${stat.color} mb-3`} />
            <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* 季節分布 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h3 className="text-lg font-serif font-bold text-gray-800 mb-4">節氣季節分布</h3>
        <div className="space-y-4">
          {seasonInfo.map((season, index) => (
            <motion.div
              key={season.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-center gap-4"
            >
              <span className="text-2xl">{season.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-700">{season.name}季</span>
                  <span className="text-sm text-gray-500">{season.count} 個節氣</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(season.count / 6) * 100}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                    className={`h-full ${season.color} rounded-full`}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 關於日曆 */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
        <h3 className="text-lg font-serif font-bold text-gray-800 mb-3">關於此日曆</h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          2026 中藥正念日曆結合傳統中藥智慧與正念冥想，全年 365 天每日對應一種中藥材，
          配合二十四節氣的養生主題，引導您進行專屬的冥想練習。
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-white rounded-full text-xs text-gray-600">傳統中醫</span>
          <span className="px-3 py-1 bg-white rounded-full text-xs text-gray-600">正念冥想</span>
          <span className="px-3 py-1 bg-white rounded-full text-xs text-gray-600">二十四節氣</span>
          <span className="px-3 py-1 bg-white rounded-full text-xs text-gray-600">養生保健</span>
        </div>
      </div>

      {/* 版本資訊 */}
      <div className="text-center mt-8 text-xs text-gray-400">
        <p>版本 1.0.0</p>
        <p className="mt-1">© 2025 中藥正念日曆</p>
      </div>
    </motion.div>
  );
}
