import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';

/**
 * 圖片放大 Modal 組件
 * 點擊圖片可全屏查看，支持觸控縮放
 */
export default function ImageModal({ isOpen, onClose, imageSrc, imageAlt, title, subtitle }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          onClick={onClose}
        >
          {/* 背景遮罩 */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          {/* 關閉按鈕 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* 圖片內容 */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 max-w-[90vw] max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 圖片 */}
            <div className="bg-white rounded-2xl p-3 shadow-2xl overflow-hidden">
              <img
                src={imageSrc}
                alt={imageAlt}
                className="max-w-[85vw] max-h-[70vh] object-contain rounded-xl"
                style={{ minWidth: '280px', minHeight: '280px' }}
              />
            </div>
            
            {/* 標題說明 */}
            {(title || subtitle) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-4 text-center"
              >
                {title && (
                  <h3 className="text-xl font-serif font-bold text-white mb-1">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-sm text-white/70">{subtitle}</p>
                )}
              </motion.div>
            )}
            
            {/* 提示文字 */}
            <p className="mt-4 text-xs text-white/50">點擊任意處關閉</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
