import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';

export default function Header({ season, solarTerm }) {
  const seasonColors = {
    "春": "from-green-600 to-emerald-500",
    "夏": "from-red-500 to-orange-500",
    "秋": "from-orange-500 to-amber-500",
    "冬": "from-blue-600 to-cyan-500"
  };

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`sticky top-0 z-50 bg-gradient-to-r ${seasonColors[season] || seasonColors["春"]} text-white shadow-lg`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm overflow-hidden"
            >
              <img 
                src="./logo/logo_main_transparent.png" 
                alt="中藥正念日曆" 
                className="w-9 h-9 object-contain"
              />
            </motion.div>
            <div>
              <h1 className="text-lg font-serif font-bold tracking-wide">中藥正念日曆</h1>
              <p className="text-xs text-white/80">TCM Mindfulness Calendar</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {solarTerm && (
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="hidden sm:flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 backdrop-blur-sm"
              >
                <span className="text-sm font-medium">{solarTerm.name}</span>
                <span className="text-xs text-white/70">{solarTerm.season}季</span>
              </motion.div>
            )}
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
