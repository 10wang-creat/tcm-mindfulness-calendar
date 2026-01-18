import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';

/**
 * TCM 草藥冥想音頻播放器
 * 提供完整的冥想音頻播放功能：播放/暫停、進度控制、音量調節
 */
const MeditationPlayer = ({ 
  herbName, 
  audioSrc, 
  herbEffect,
  seasonColor = { primary: '#6B8E6B', secondary: '#C4A484' }
}) => {
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  
  // 播放器狀態
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // 格式化時間 (秒 -> mm:ss)
  const formatTime = useCallback((time) => {
    if (isNaN(time) || time === Infinity) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // 播放/暫停
  const togglePlay = useCallback(() => {
    if (!audioRef.current || isLoading || error) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.error('播放失敗:', err);
          setError('無法播放音頻，請重試');
        });
    }
  }, [isPlaying, isLoading, error]);

  // 重新開始
  const restart = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    if (!isPlaying) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(console.error);
    }
  }, [isPlaying]);

  // 快退15秒
  const skipBack = useCallback(() => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, audioRef.current.currentTime - 15);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, []);

  // 快進15秒
  const skipForward = useCallback(() => {
    if (!audioRef.current || !duration) return;
    const newTime = Math.min(duration, audioRef.current.currentTime + 15);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  // 靜音切換
  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    const newMuted = !isMuted;
    audioRef.current.muted = newMuted;
    setIsMuted(newMuted);
  }, [isMuted]);

  // 音量調節
  const handleVolumeChange = useCallback((e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      if (newVolume === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
        audioRef.current.muted = false;
      }
    }
  }, [isMuted]);

  // 進度條點擊/拖動
  const handleProgressClick = useCallback((e) => {
    if (!audioRef.current || !duration || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  // 監聽音頻事件
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
      setError(null);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = (e) => {
      console.error('音頻錯誤:', e);
      setError('音頻載入失敗，請檢查網路連接');
      setIsLoading(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);

    // 設置初始音量
    audio.volume = volume;

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
    };
  }, [audioSrc, volume]);

  // 當音頻源改變時重置狀態
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setIsLoading(true);
    setError(null);
  }, [audioSrc]);

  // 鍵盤快捷鍵
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT') return;
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          skipBack();
          break;
        case 'ArrowRight':
          skipForward();
          break;
        case 'KeyM':
          toggleMute();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [togglePlay, skipBack, skipForward, toggleMute]);

  // 計算進度百分比
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // 無音頻源時的提示
  if (!audioSrc) {
    return (
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-200 flex items-center justify-center">
          <Volume2 className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 text-sm">此草藥的冥想音頻尚未提供</p>
      </div>
    );
  }

  return (
    <div 
      className="rounded-2xl p-5 shadow-lg border border-white/20"
      style={{
        background: `linear-gradient(135deg, ${seasonColor.primary}15, ${seasonColor.secondary}15)`
      }}
    >
      {/* 標題區 */}
      <div className="text-center mb-5">
        <h3 className="text-xl font-serif font-bold text-gray-800 mb-1">
          {herbName}・觀想冥想
        </h3>
        <p className="text-sm text-gray-600">{herbEffect}</p>
      </div>

      {/* 隱藏的音頻元素 */}
      <audio 
        ref={audioRef} 
        src={audioSrc} 
        preload="metadata"
      />

      {/* 視覺化波形區域 */}
      <div className="relative h-20 mb-4 rounded-xl overflow-hidden bg-white/30 backdrop-blur-sm">
        {/* 波形動畫背景 */}
        <div className="absolute inset-0 flex items-center justify-center gap-1">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="w-1 rounded-full transition-all duration-300"
              style={{
                height: isPlaying 
                  ? `${20 + Math.sin((currentTime * 2 + i) * 0.5) * 30 + Math.random() * 10}%`
                  : '20%',
                backgroundColor: i < (progress * 0.3) 
                  ? seasonColor.primary 
                  : `${seasonColor.secondary}40`,
                transition: isPlaying ? 'height 0.1s ease' : 'height 0.5s ease'
              }}
            />
          ))}
        </div>
        
        {/* 播放狀態指示 */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* 進度條 */}
      <div 
        ref={progressRef}
        className="h-2 bg-gray-200/50 rounded-full mb-2 cursor-pointer overflow-hidden group"
        onClick={handleProgressClick}
      >
        <div 
          className="h-full rounded-full transition-all duration-100 relative"
          style={{ 
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${seasonColor.primary}, ${seasonColor.secondary})`
          }}
        >
          {/* 進度條手柄 */}
          <div 
            className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ transform: 'translate(50%, -50%)' }}
          />
        </div>
      </div>

      {/* 時間顯示 */}
      <div className="flex justify-between text-xs text-gray-500 mb-5 px-1">
        <span className="font-mono">{formatTime(currentTime)}</span>
        <span className="font-mono">{formatTime(duration)}</span>
      </div>

      {/* 錯誤提示 */}
      {error && (
        <div className="text-center text-red-500 text-sm mb-4 p-2 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      {/* 控制按鈕 */}
      <div className="flex items-center justify-center gap-3">
        {/* 快退15秒 */}
        <button
          onClick={skipBack}
          className="p-2.5 rounded-full hover:bg-white/50 transition-all active:scale-95"
          title="快退15秒"
          disabled={isLoading}
        >
          <SkipBack className="w-5 h-5 text-gray-600" />
        </button>

        {/* 重新開始 */}
        <button
          onClick={restart}
          className="p-2.5 rounded-full hover:bg-white/50 transition-all active:scale-95"
          title="重新開始"
          disabled={isLoading}
        >
          <RotateCcw className="w-5 h-5 text-gray-600" />
        </button>

        {/* 播放/暫停 - 主按鈕 */}
        <button
          onClick={togglePlay}
          className="w-16 h-16 rounded-full shadow-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
          style={{
            background: `linear-gradient(135deg, ${seasonColor.primary}, ${seasonColor.secondary})`
          }}
          disabled={isLoading && !audioRef.current?.readyState}
          title={isPlaying ? '暫停 (空白鍵)' : '播放 (空白鍵)'}
        >
          {isPlaying ? (
            <Pause className="w-7 h-7 text-white" />
          ) : (
            <Play className="w-7 h-7 text-white ml-1" />
          )}
        </button>

        {/* 快進15秒 */}
        <button
          onClick={skipForward}
          className="p-2.5 rounded-full hover:bg-white/50 transition-all active:scale-95"
          title="快進15秒"
          disabled={isLoading}
        >
          <SkipForward className="w-5 h-5 text-gray-600" />
        </button>

        {/* 音量控制 */}
        <div className="relative">
          <button
            onClick={toggleMute}
            onMouseEnter={() => setShowVolumeSlider(true)}
            className="p-2.5 rounded-full hover:bg-white/50 transition-all active:scale-95"
            title={isMuted ? '取消靜音 (M)' : '靜音 (M)'}
            disabled={isLoading}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-5 h-5 text-gray-600" />
            ) : (
              <Volume2 className="w-5 h-5 text-gray-600" />
            )}
          </button>
          
          {/* 音量滑桿 */}
          {showVolumeSlider && (
            <div 
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-white rounded-xl shadow-lg"
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-24 h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${seasonColor.primary} ${volume * 100}%, #e5e7eb ${volume * 100}%)`
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* 提示文字 */}
      <div className="text-center mt-5 space-y-1">
        <p className="text-xs text-gray-400">
          找一個安靜的地方，開始您的冥想之旅
        </p>
        <p className="text-xs text-gray-300">
          快捷鍵：空白鍵 播放/暫停 | ← → 快退/快進 | M 靜音
        </p>
      </div>
    </div>
  );
};

export default MeditationPlayer;
