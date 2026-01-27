import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, Grid3X3, List, SlidersHorizontal } from 'lucide-react';
import { useState, useMemo } from 'react';
import { herbImages } from '../data/calendarData';
import { useUserStats } from '../hooks/useUserStats';

// 藥材拉丁學名對照表
const herbLatinNames = {
  '人參': 'Panax ginseng',
  '黃耆': 'Astragalus membranaceus',
  '黨參': 'Codonopsis pilosula',
  '白朮': 'Atractylodes macrocephala',
  '茯苓': 'Poria cocos',
  '山藥': 'Dioscorea opposita',
  '甘草': 'Glycyrrhiza uralensis',
  '大棗': 'Ziziphus jujuba',
  '紅棗': 'Ziziphus jujuba Mill.',
  '蜂蜜': 'Mel',
  '龍骨': 'Os Draconis',
  '牡蠣': 'Ostrea gigas',
  '磁石': 'Magnetitum',
  '琥珀': 'Succinum',
  '當歸': 'Angelica sinensis',
  '白芍': 'Paeonia lactiflora',
  '川芎': 'Ligusticum chuanxiong',
  '丹參': 'Salvia miltiorrhiza',
  '紅花': 'Carthamus tinctorius',
  '桃仁': 'Prunus persica',
  '益母草': 'Leonurus japonicus',
  '雞血藤': 'Spatholobus suberectus',
  '三七': 'Panax notoginseng',
  '延胡索': 'Corydalis yanhusuo',
  '鬱金': 'Curcuma aromatica',
  '薑黃': 'Curcuma longa',
  '香附': 'Cyperus rotundus',
  '枸杞': 'Lycium barbarum',
  '薄荷': 'Mentha haplocalyx',
  '菊花': 'Chrysanthemum morifolium',
  '艾草': 'Artemisia argyi',
  '茵陳': 'Artemisia capillaris',
  '金錢草': 'Lysimachia christinae',
  '車前草': 'Plantago asiatica',
  '澤瀉': 'Alisma orientale',
  '滑石': 'Talcum',
  '通草': 'Tetrapanax papyrifer',
  '薏苡仁': 'Coix lacryma-jobi',
  '龍眼肉': 'Dimocarpus longan',
  '酸棗仁': 'Ziziphus spinosa',
  '遠志': 'Polygala tenuifolia',
  '柏子仁': 'Platycladus orientalis',
  '地黃': 'Rehmannia glutinosa',
  '阿膠': 'Colla Corii Asini',
  '何首烏': 'Polygonum multiflorum',
  '桑椹': 'Morus alba',
  '合歡皮': 'Albizia julibrissin',
  '夜交藤': 'Polygonum multiflorum',
  '珍珠母': 'Margarita',
  '陳皮': 'Citrus reticulata',
  '青皮': 'Citrus reticulata (immature)',
  '枳實': 'Citrus aurantium',
  '木香': 'Aucklandia lappa',
  '烏藥': 'Lindera aggregata',
  '沉香': 'Aquilaria sinensis',
  '檀香': 'Santalum album'
};

// 取得藥材功效標籤
const getHerbTags = (effect) => {
  const tags = [];
  if (effect.includes('補氣') || effect.includes('益氣')) tags.push({ label: '補氣', color: 'orange' });
  if (effect.includes('補血') || effect.includes('養血')) tags.push({ label: '補血', color: 'red' });
  if (effect.includes('安神') || effect.includes('寧心')) tags.push({ label: '安神', color: 'purple' });
  if (effect.includes('活血') || effect.includes('化瘀')) tags.push({ label: '活血', color: 'pink' });
  if (effect.includes('清熱') || effect.includes('利濕')) tags.push({ label: '清熱', color: 'blue' });
  if (effect.includes('滋陰') || effect.includes('潤燥')) tags.push({ label: '滋陰', color: 'cyan' });
  if (effect.includes('溫') || effect.includes('散寒')) tags.push({ label: '溫陽', color: 'amber' });
  if (effect.includes('理氣') || effect.includes('行氣')) tags.push({ label: '理氣', color: 'teal' });
  if (effect.includes('健脾')) tags.push({ label: '健脾', color: 'yellow' });
  if (tags.length === 0) tags.push({ label: '養生', color: 'gray' });
  return tags.slice(0, 2); // 最多顯示 2 個標籤
};

// 標籤顏色映射
const tagColorMap = {
  orange: 'bg-orange-100 text-orange-600',
  red: 'bg-red-100 text-red-600',
  pink: 'bg-pink-100 text-pink-600',
  purple: 'bg-purple-100 text-purple-600',
  blue: 'bg-blue-100 text-blue-600',
  cyan: 'bg-cyan-100 text-cyan-600',
  amber: 'bg-amber-100 text-amber-600',
  teal: 'bg-teal-100 text-teal-600',
  yellow: 'bg-yellow-100 text-yellow-700',
  gray: 'bg-gray-100 text-gray-600',
  green: 'bg-green-100 text-green-600',
};

// 季節顏色
const seasonColorMap = {
  '冬': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  '春': { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
  '夏': { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
  '秋': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
  '四季': { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' },
};

export default function HerbsView({ herbsDatabase, onSelectHerb }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [viewMode, setViewMode] = useState('grid'); // grid 或 list
  const [sortBy, setSortBy] = useState('default'); // default, name, season
  const [searchFocused, setSearchFocused] = useState(false);
  const { stats, toggleFavoriteHerb, isFavorite } = useUserStats();

  // 藥材分類定義
  const categoryFilters = {
    '全部': () => true,
    '收藏': (h) => stats.favoriteHerbs?.includes(h.name),
    '補氣': (h) => h.effect.includes('補氣') || h.effect.includes('益氣') || h.effect.includes('補中'),
    '補血': (h) => h.effect.includes('補血') || h.effect.includes('養血'),
    '安神': (h) => h.effect.includes('安神') || h.effect.includes('寧心') || h.effect.includes('定志'),
    '活血': (h) => h.effect.includes('活血') || h.effect.includes('化瘀'),
    '清熱': (h) => h.effect.includes('清熱') || h.effect.includes('利濕') || h.effect.includes('利水'),
    '理氣': (h) => h.effect.includes('理氣') || h.effect.includes('行氣') || h.effect.includes('解鬱'),
  };

  // 計算各分類數量
  const categoryCounts = useMemo(() => {
    const counts = {};
    Object.keys(categoryFilters).forEach(cat => {
      counts[cat] = herbsDatabase.filter(categoryFilters[cat]).length;
    });
    // 收藏數量特殊處理
    counts['收藏'] = stats.favoriteHerbs?.length || 0;
    return counts;
  }, [herbsDatabase, stats.favoriteHerbs]);

  // 篩選和排序後的藥材列表
  const filteredHerbs = useMemo(() => {
    let result = herbsDatabase.filter(herb => {
      const matchesSearch = herb.name.includes(searchTerm) || 
                           herb.effect.includes(searchTerm) ||
                           (herbLatinNames[herb.name] || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilters[selectedCategory](herb);
      return matchesSearch && matchesCategory;
    });

    // 排序
    if (sortBy === 'name') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name, 'zh-TW'));
    } else if (sortBy === 'season') {
      const seasonOrder = { '冬': 1, '春': 2, '夏': 3, '秋': 4 };
      result = [...result].sort((a, b) => (seasonOrder[a.season] || 5) - (seasonOrder[b.season] || 5));
    }

    return result;
  }, [herbsDatabase, searchTerm, selectedCategory, stats.favoriteHerbs, sortBy]);

  // 取得藥材圖片路徑
  const getHerbImagePath = (herbName) => herbImages[herbName] || null;

  // 篩選標籤配置
  const filterChips = [
    { id: '全部', label: '全部', icon: null },
    { id: '收藏', label: '收藏', icon: '❤️' },
    { id: '補氣', label: '補氣', color: 'orange' },
    { id: '補血', label: '補血', color: 'red' },
    { id: '安神', label: '安神', color: 'purple' },
    { id: '活血', label: '活血', color: 'pink' },
    { id: '清熱', label: '清熱', color: 'blue' },
    { id: '理氣', label: '理氣', color: 'teal' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-blue-50">
      {/* 沉浸式標題區域 */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white px-4 pt-6 pb-5 rounded-b-3xl">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-xl font-bold">藥材圖鑑</h1>
            <p className="text-teal-200 text-sm">{herbsDatabase.length} 種傳統中藥材</p>
          </div>
          {/* 視圖切換按鈕 */}
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('grid')}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                viewMode === 'grid' ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <Grid3X3 className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('list')}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                viewMode === 'list' ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <List className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* 搜尋欄 */}
        <motion.div 
          className="mt-3 relative"
          animate={{ scale: searchFocused ? 1.02 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-200" />
          <input
            type="text"
            placeholder="搜尋藥材名稱、功效、拼音..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full bg-white/20 backdrop-blur text-white placeholder-teal-200 rounded-xl px-4 py-2.5 pl-10 text-sm focus:outline-none focus:bg-white/30 transition-colors"
          />
        </motion.div>
      </div>

      {/* 篩選標籤 - 可橫向滑動 */}
      <div className="px-4 py-3 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2">
          {filterChips.map((chip) => (
            <motion.button
              key={chip.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(chip.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                selectedCategory === chip.id
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
              }`}
            >
              {chip.icon && <span className="text-xs">{chip.icon}</span>}
              {chip.label}
              <span className={`text-xs ${
                selectedCategory === chip.id ? 'text-teal-200' : 'text-gray-400'
              }`}>
                {categoryCounts[chip.id]}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* 結果數量 & 排序 */}
      <div className="px-4 flex items-center justify-between mb-3">
        <p className="text-gray-500 text-sm">
          顯示 {filteredHerbs.length} 種藥材
        </p>
        <button 
          onClick={() => {
            const sortOptions = ['default', 'name', 'season'];
            const currentIndex = sortOptions.indexOf(sortBy);
            setSortBy(sortOptions[(currentIndex + 1) % sortOptions.length]);
          }}
          className="text-teal-600 text-sm flex items-center gap-1 hover:text-teal-700"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>
            {sortBy === 'default' ? '預設' : sortBy === 'name' ? '名稱' : '季節'}
          </span>
        </button>
      </div>

      {/* 藥材列表區域 */}
      <div className="px-4 pb-28">
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            /* 網格視圖 */
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 gap-3"
            >
              {filteredHerbs.map((herb, index) => {
                const imagePath = getHerbImagePath(herb.name);
                const herbIsFavorite = isFavorite(herb.name);
                const tags = getHerbTags(herb.effect);
                const seasonStyle = seasonColorMap[herb.season] || seasonColorMap['四季'];

                return (
                  <motion.div
                    key={herb.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onSelectHerb && onSelectHerb(herb)}
                  >
                    {/* 圖片區域 */}
                    <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 p-4 flex items-center justify-center h-24">
                      {imagePath ? (
                        <img
                          src={imagePath}
                          alt={herb.name}
                          className="w-16 h-16 object-contain"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <span className="text-4xl">🌿</span>
                      )}
                      
                      {/* 收藏按鈕 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavoriteHerb(herb.name);
                        }}
                        className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                          herbIsFavorite ? 'bg-red-100 text-red-500' : 'bg-white/80 text-gray-300 hover:bg-white'
                        }`}
                      >
                        {herbIsFavorite ? '❤️' : '🤍'}
                      </button>

                      {/* 季節徽章 */}
                      <div className={`absolute bottom-2 left-2 ${seasonStyle.bg} backdrop-blur px-2 py-0.5 rounded-full text-xs ${seasonStyle.text}`}>
                        {herb.season}
                      </div>
                    </div>

                    {/* 資訊區域 */}
                    <div className="p-3">
                      <h3 className="font-bold text-gray-800">{herb.name}</h3>
                      <p className="text-gray-400 text-xs truncate">{herbLatinNames[herb.name] || ''}</p>
                      <p className="text-gray-600 text-sm mt-1 truncate">{herb.effect}</p>
                      {/* 功效標籤 */}
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {tags.map((tag, tagIdx) => (
                          <span
                            key={tagIdx}
                            className={`text-xs px-2 py-0.5 rounded-full ${tagColorMap[tag.color]}`}
                          >
                            {tag.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            /* 列表視圖 */
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {filteredHerbs.map((herb, index) => {
                const imagePath = getHerbImagePath(herb.name);
                const herbIsFavorite = isFavorite(herb.name);
                const tags = getHerbTags(herb.effect);
                const seasonStyle = seasonColorMap[herb.season] || seasonColorMap['四季'];

                return (
                  <motion.div
                    key={herb.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    whileTap={{ scale: 0.99 }}
                    className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onSelectHerb && onSelectHerb(herb)}
                  >
                    {/* 縮圖 */}
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      {imagePath ? (
                        <img
                          src={imagePath}
                          alt={herb.name}
                          className="w-10 h-10 object-contain"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <span className="text-2xl">🌿</span>
                      )}
                    </div>

                    {/* 資訊 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-800">{herb.name}</h3>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${seasonStyle.bg} ${seasonStyle.text}`}>
                          {herb.season}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs truncate">{herbLatinNames[herb.name] || ''}</p>
                      <p className="text-gray-500 text-sm truncate">{herb.effect}</p>
                      {/* 功效標籤 */}
                      <div className="flex gap-1 mt-1">
                        {tags.map((tag, tagIdx) => (
                          <span
                            key={tagIdx}
                            className={`text-xs px-2 py-0.5 rounded-full ${tagColorMap[tag.color]}`}
                          >
                            {tag.label}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 收藏按鈕 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteHerb(herb.name);
                      }}
                      className="flex-shrink-0 text-xl"
                    >
                      {herbIsFavorite ? '❤️' : '🤍'}
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 空狀態 */}
        {filteredHerbs.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-500 mb-1">找不到符合條件的藥材</p>
            <p className="text-gray-400 text-sm mb-4">試試其他搜尋條件</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedCategory('全部'); }}
              className="text-teal-600 text-sm underline hover:text-teal-700"
            >
              清除所有篩選
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
