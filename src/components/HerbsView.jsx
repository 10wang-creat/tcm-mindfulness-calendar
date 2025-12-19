import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { useState, useMemo } from 'react';

export default function HerbsView({ herbsDatabase, onSelectHerb }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');

  // 藥材分類
  const categories = {
    '全部': () => true,
    '補氣': (h) => h.effect.includes('補氣') || h.effect.includes('益氣'),
    '補血': (h) => h.effect.includes('補血') || h.effect.includes('養血'),
    '安神': (h) => h.effect.includes('安神') || h.effect.includes('寧心'),
    '活血': (h) => h.effect.includes('活血') || h.effect.includes('化瘀'),
    '清熱': (h) => h.effect.includes('清熱') || h.effect.includes('利濕'),
    '其他': (h) => {
      const keywords = ['補氣', '益氣', '補血', '養血', '安神', '寧心', '活血', '化瘀', '清熱', '利濕'];
      return !keywords.some(k => h.effect.includes(k));
    }
  };

  const filteredHerbs = useMemo(() => {
    return herbsDatabase.filter(herb => {
      const matchesSearch = herb.name.includes(searchTerm) || herb.effect.includes(searchTerm);
      const matchesCategory = categories[selectedCategory](herb);
      return matchesSearch && matchesCategory;
    });
  }, [herbsDatabase, searchTerm, selectedCategory]);

  // 分類顏色
  const categoryColors = {
    '全部': 'bg-gray-100 text-gray-700',
    '補氣': 'bg-yellow-100 text-yellow-700',
    '補血': 'bg-red-100 text-red-700',
    '安神': 'bg-purple-100 text-purple-700',
    '活血': 'bg-pink-100 text-pink-700',
    '清熱': 'bg-blue-100 text-blue-700',
    '其他': 'bg-gray-100 text-gray-600'
  };

  const getHerbColor = (herb) => {
    if (herb.effect.includes('補氣') || herb.effect.includes('益氣')) return 'from-yellow-50 to-amber-100';
    if (herb.effect.includes('補血') || herb.effect.includes('養血')) return 'from-red-50 to-rose-100';
    if (herb.effect.includes('安神') || herb.effect.includes('寧心')) return 'from-purple-50 to-violet-100';
    if (herb.effect.includes('活血') || herb.effect.includes('化瘀')) return 'from-pink-50 to-rose-100';
    if (herb.effect.includes('清熱') || herb.effect.includes('利濕')) return 'from-blue-50 to-cyan-100';
    return 'from-gray-50 to-slate-100';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 py-6"
    >
      {/* 標題 */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-serif font-bold text-gray-800 mb-1">藥材圖鑑</h2>
        <p className="text-sm text-gray-500">54種傳統中藥材</p>
      </div>

      {/* 搜尋欄 */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="搜尋藥材名稱或功效..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      {/* 分類篩選 */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        {Object.keys(categories).map(category => (
          <motion.button
            key={category}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(category)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
              ${selectedCategory === category 
                ? categoryColors[category] + ' ring-2 ring-offset-1' 
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}
            `}
          >
            {category}
          </motion.button>
        ))}
      </div>

      {/* 藥材數量 */}
      <p className="text-sm text-gray-500 mb-4">
        顯示 {filteredHerbs.length} 種藥材
      </p>

      {/* 藥材列表 */}
      <div className="grid grid-cols-2 gap-3">
        {filteredHerbs.map((herb, index) => (
          <motion.button
            key={herb.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.02 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectHerb && onSelectHerb(herb)}
            className={`
              p-4 rounded-xl bg-gradient-to-br ${getHerbColor(herb)}
              text-left shadow-sm hover:shadow-md transition-shadow
            `}
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-white/50 rounded-lg flex items-center justify-center flex-shrink-0">
                <img 
                  src={`/herbs/${herb.id}.png`}
                  alt={herb.name}
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <span className="hidden text-2xl">🌿</span>
              </div>
              <div className="min-w-0">
                <h3 className="font-serif font-bold text-gray-800 text-lg truncate">
                  {herb.name}
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  {herb.effect}
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* 空狀態 */}
      {filteredHerbs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-gray-500">找不到符合條件的藥材</p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedCategory('全部'); }}
            className="mt-4 text-sm text-gray-600 underline"
          >
            清除篩選條件
          </button>
        </div>
      )}
    </motion.div>
  );
}
