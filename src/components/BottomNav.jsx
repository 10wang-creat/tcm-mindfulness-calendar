import { motion } from 'framer-motion';
import { Sun, Calendar, Leaf, TrendingUp } from 'lucide-react';

export default function BottomNav({ activeTab, onTabChange, seasonColor }) {
  const tabs = [
    { id: 'today', icon: Sun, label: '今日' },
    { id: 'calendar', icon: Calendar, label: '日曆' },
    { id: 'herbs', icon: Leaf, label: '藥材' },
    { id: 'stats', icon: TrendingUp, label: '旅程' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-area-bottom shadow-lg">
      <div className="container mx-auto px-2">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            
            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => onTabChange(tab.id)}
                className="relative flex flex-col items-center min-w-[60px] py-1 px-3 rounded-xl transition-all"
              >
                {/* 選中背景 */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabBg"
                    className="absolute inset-0 bg-sage-50 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                {/* 圖標 */}
                <div className="relative z-10">
                  <Icon 
                    size={24}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`transition-all duration-300 ${
                      isActive 
                        ? 'text-sage-600' 
                        : 'text-gray-400'
                    }`}
                  />
                </div>
                
                {/* 文字標籤 */}
                <span 
                  className={`relative z-10 text-xs mt-1 font-medium transition-all duration-300 ${
                    isActive 
                      ? 'text-sage-600' 
                      : 'text-gray-400'
                  }`}
                >
                  {tab.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
