import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useState } from 'react';

export default function FavoriteButton({ 
  herbName,
  isFavorite,
  onToggle,
  size = 'normal', // 'small' | 'normal'
  showLabel = true,
  className = ''
}) {
  const [showAnimation, setShowAnimation] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    
    if (!isFavorite) {
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 600);
    }
    
    onToggle(herbName);
  };

  const sizeClasses = size === 'small' 
    ? 'w-8 h-8' 
    : 'px-3 py-2';

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      className={`
        relative flex items-center gap-1.5 rounded-full transition-colors
        ${sizeClasses}
        ${isFavorite 
          ? 'bg-red-50 hover:bg-red-100' 
          : 'bg-gray-100 hover:bg-gray-200'
        }
        ${className}
      `}
    >
      <motion.div
        animate={isFavorite ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Heart 
          className={`w-4 h-4 transition-colors ${
            isFavorite 
              ? 'text-red-500 fill-red-500' 
              : 'text-gray-500'
          }`}
        />
      </motion.div>
      
      {showLabel && size !== 'small' && (
        <span className={`text-sm ${
          isFavorite ? 'text-red-600' : 'text-gray-600'
        }`}>
          {isFavorite ? '已收藏' : '收藏'}
        </span>
      )}

      {/* 愛心動畫效果 */}
      <AnimatePresence>
        {showAnimation && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 1, 
                  scale: 0,
                  x: 0,
                  y: 0
                }}
                animate={{ 
                  opacity: 0, 
                  scale: 1,
                  x: Math.cos(i * 60 * Math.PI / 180) * 30,
                  y: Math.sin(i * 60 * Math.PI / 180) * 30 - 10
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute pointer-events-none"
              >
                <Heart className="w-3 h-3 text-red-400 fill-red-400" />
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
