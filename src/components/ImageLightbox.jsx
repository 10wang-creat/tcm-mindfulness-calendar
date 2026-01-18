import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';

/**
 * 圖片燈箱組件 - 點擊放大查看圖片
 */
export default function ImageLightbox({ isOpen, onClose, imageSrc, imageAlt, title, subtitle }) {
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
          
          {/* 圖片容器 */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 max-w-[90vw] max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 關閉按鈕 */}
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            
            {/* 圖片 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl p-2">
              <img 
                src={imageSrc}
                alt={imageAlt}
                className="max-w-[85vw] max-h-[70vh] object-contain rounded-xl"
              />
            </div>
            
            {/* 標題資訊 */}
            {(title || subtitle) && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-4 text-center"
              >
                {title && (
                  <h3 className="text-xl font-serif font-bold text-white mb-1">{title}</h3>
                )}
                {subtitle && (
                  <p className="text-white/70 text-sm">{subtitle}</p>
                )}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * 可點擊放大的圖片包裝器
 */
export function ZoomableImage({ src, alt, className, title, subtitle, children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div 
        className="relative cursor-pointer group"
        onClick={() => setIsOpen(true)}
      >
        {children || (
          <img src={src} alt={alt} className={className} />
        )}
        {/* 放大提示圖標 */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-1.5 shadow-lg">
          <ZoomIn className="w-4 h-4 text-gray-600" />
        </div>
      </div>
      
      <ImageLightbox
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        imageSrc={src}
        imageAlt={alt}
        title={title}
        subtitle={subtitle}
      />
    </>
  );
}
