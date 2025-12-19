import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useCalendar from './hooks/useCalendar';
import Header from './components/Header';
import TodayView from './components/TodayView';
import CalendarView from './components/CalendarView';
import HerbsView from './components/HerbsView';
import StatsView from './components/StatsView';
import BottomNav from './components/BottomNav';

function App() {
  const [activeTab, setActiveTab] = useState('today');
  
  // 使用 2026/1/1 作為預設日期（日曆年份）
  const defaultDate = new Date(2026, 0, 1);
  const calendar = useCalendar(defaultDate);
  
  const { todayInfo, calendarDays, monthSolarTerms, herbsDatabase, solarTerms } = calendar;

  // 頁面切換動畫
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'today':
        return (
          <TodayView 
            todayInfo={todayInfo} 
            onOpenCalendar={() => setActiveTab('calendar')}
          />
        );
      case 'calendar':
        return (
          <CalendarView
            calendarDays={calendarDays}
            selectedDate={calendar.selectedDate}
            monthSolarTerms={monthSolarTerms}
            onSelectDate={(date) => {
              calendar.selectDate(date);
              setActiveTab('today');
            }}
            onPrevMonth={calendar.goToPrevMonth}
            onNextMonth={calendar.goToNextMonth}
            onGoToToday={calendar.goToToday}
          />
        );
      case 'herbs':
        return (
          <HerbsView 
            herbsDatabase={herbsDatabase}
            onSelectHerb={(herb) => {
              // 找到該藥材對應的日期並跳轉
              const herbIndex = herbsDatabase.findIndex(h => h.id === herb.id);
              const targetDate = new Date(2026, 0, herbIndex + 1);
              calendar.selectDate(targetDate);
              setActiveTab('today');
            }}
          />
        );
      case 'stats':
        return (
          <StatsView 
            solarTerms={solarTerms}
            herbsDatabase={herbsDatabase}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${todayInfo.seasonColor.bg}`}>
      <Header 
        season={todayInfo.solarTerm.season} 
        solarTerm={todayInfo.solarTerm}
      />
      
      <main className="pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
      
      <BottomNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        seasonColor={todayInfo.seasonColor}
      />
    </div>
  );
}

export default App;
