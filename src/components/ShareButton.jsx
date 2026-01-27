import { motion, AnimatePresence } from 'framer-motion';
import { Share2, X, Copy, Check, MessageCircle, Send } from 'lucide-react';
import { useState } from 'react';

// 分享類型
const SHARE_TYPES = {
  HERB: 'herb',           // 分享藥材圖片
  MEDITATION: 'meditation' // 分享完成正念
};

export default function ShareButton({ 
  type = SHARE_TYPES.HERB,
  herbName,
  herbEffect,
  herbImage,
  solarTermName,
  streakDays,
  className = ''
}) {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // 生成分享文字
  const getShareText = () => {
    const appUrl = 'https://10wang-creat.github.io/tcm-mindfulness-calendar/';
    
    if (type === SHARE_TYPES.MEDITATION) {
      return `🧘 我剛完成了今日正念冥想！

🌿 今日藥材：${herbName}
✨ 功效：${herbEffect}
🔥 連續 ${streakDays || 1} 天練習中

一起來體驗中藥正念日曆吧！
${appUrl}

#中藥正念 #冥想 #養生`;
    }
    
    // 分享藥材
    return `🌿 ${herbName}

✨ 功效：${herbEffect}
📅 節氣：${solarTermName}

探索更多傳統中藥智慧 👇
${appUrl}

#中藥 #養生 #傳統醫學`;
  };

  // 複製到剪貼簿
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('複製失敗:', err);
    }
  };

  // 使用 Web Share API
  const handleNativeShare = async () => {
    const shareData = {
      title: type === SHARE_TYPES.MEDITATION 
        ? '我完成了今日正念冥想！' 
        : `中藥圖鑑：${herbName}`,
      text: getShareText(),
      url: 'https://10wang-creat.github.io/tcm-mindfulness-calendar/'
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        setShowModal(true);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setShowModal(true);
      }
    }
  };

  // 分享到 Line
  const shareToLine = () => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://social-plugins.line.me/lineit/share?text=${text}`, '_blank');
  };

  // 分享到 Facebook
  const shareToFacebook = () => {
    const url = encodeURIComponent('https://10wang-creat.github.io/tcm-mindfulness-calendar/');
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleNativeShare}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors ${className}`}
      >
        <Share2 className="w-4 h-4 text-gray-600" />
        <span className="text-sm text-gray-600">分享</span>
      </motion.button>

      {/* 分享選項彈窗 */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-t-3xl p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">分享給朋友</h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* 預覽卡片 */}
              <div className="bg-gradient-to-br from-sage-50 to-terracotta-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  {herbImage && (
                    <img 
                      src={herbImage} 
                      alt={herbName}
                      className="w-16 h-16 rounded-lg object-contain bg-white/50"
                    />
                  )}
                  <div>
                    <p className="font-bold text-gray-800">{herbName}</p>
                    <p className="text-sm text-gray-600">{herbEffect}</p>
                    {type === SHARE_TYPES.MEDITATION && (
                      <p className="text-xs text-green-600 mt-1">
                        ✅ 今日正念已完成
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 分享選項 */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <button
                  onClick={shareToLine}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm text-gray-600">Line</span>
                </button>

                <button
                  onClick={shareToFacebook}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <Send className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm text-gray-600">Facebook</span>
                </button>

                <button
                  onClick={handleCopy}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    copied ? 'bg-green-500' : 'bg-gray-400'
                  }`}>
                    {copied ? (
                      <Check className="w-6 h-6 text-white" />
                    ) : (
                      <Copy className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <span className="text-sm text-gray-600">
                    {copied ? '已複製' : '複製'}
                  </span>
                </button>
              </div>

              {/* 取消按鈕 */}
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3 text-gray-500 font-medium"
              >
                取消
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export { SHARE_TYPES };
