import { motion } from 'framer-motion';
import { Home, Calendar, Leaf, BarChart3 } from 'lucide-react';

export default function BottomNav({ activeTab, onTabChange, seasonColor }) {
  const tabs = [
    { id: 'today', label: '今日', icon: Home },
    { id: 'calendar', label: '日曆', icon: Calendar },
    { id: 'herbs', label: '藥材', icon: Leaf },
    { id: 'stats', label: '統計', icon: BarChart3 }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-area-bottom">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-colors
                  ${isActive ? 'text-gray-800' : 'text-gray-400 hover:text-gray-600'}
                `}
              >
                <div className="relative">
                  <tab.icon className="w-6 h-6" />
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ backgroundColor: seasonColor?.primary || '#4A5568' }}
                    />
                  )}
                </div>
                <span className={`text-xs font-medium ${isActive ? '' : ''}`}>
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
