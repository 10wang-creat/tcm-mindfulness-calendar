import { motion } from 'framer-motion';

export default function BottomNav({ activeTab, onTabChange, seasonColor }) {
  const tabs = [
    { id: 'today', icon: './logo/icon_today.png' },
    { id: 'calendar', icon: './logo/icon_calendar.png' },
    { id: 'herbs', icon: './logo/icon_meet_herbs.png' },
    { id: 'stats', icon: './logo/icon_my_journey.png' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-area-bottom shadow-lg">
      <div className="container mx-auto px-2">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => onTabChange(tab.id)}
                className="relative p-2 rounded-2xl transition-all"
              >
                {/* 選中背景 */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabBg"
                    className="absolute inset-0 bg-sage-50 rounded-2xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                {/* 圖標 */}
                <div className="relative z-10">
                  <img 
                    src={tab.icon} 
                    alt={tab.id}
                    className={`w-10 h-10 object-contain transition-all duration-300 ${
                      isActive 
                        ? 'opacity-100 scale-110' 
                        : 'opacity-70 hover:opacity-90'
                    }`}
                  />
                </div>
                
                {/* 選中指示點 */}
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-sage-500"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
