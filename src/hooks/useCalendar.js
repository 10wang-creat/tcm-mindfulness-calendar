import { useState, useEffect, useMemo } from 'react';
import {
  getHerbForDate,
  getSolarTermForDate,
  getSolarTermTheme,
  getSeasonColor,
  generateMeditationText,
  herbsDatabase,
  solarTerms
} from '../data/calendarData';

export function useCalendar(initialDate = new Date()) {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState(initialDate);

  // 今日資訊
  const todayInfo = useMemo(() => {
    const herb = getHerbForDate(selectedDate);
    const solarTerm = getSolarTermForDate(selectedDate);
    const theme = getSolarTermTheme(solarTerm.name);
    const seasonColor = getSeasonColor(solarTerm.season);
    const meditation = generateMeditationText(herb, solarTerm);

    return {
      date: selectedDate,
      herb,
      solarTerm,
      theme,
      seasonColor,
      meditation,
      dayOfYear: Math.floor((selectedDate - new Date(2026, 0, 1)) / (1000 * 60 * 60 * 24)) + 1
    };
  }, [selectedDate]);

  // 月曆資料
  const calendarDays = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    
    const days = [];
    
    // 前月填充
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        date,
        isCurrentMonth: false,
        herb: getHerbForDate(date),
        solarTerm: getSolarTermForDate(date)
      });
    }
    
    // 當月日期
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        herb: getHerbForDate(date),
        solarTerm: getSolarTermForDate(date),
        isToday: isSameDay(date, new Date()),
        isSelected: isSameDay(date, selectedDate)
      });
    }
    
    // 後月填充
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        herb: getHerbForDate(date),
        solarTerm: getSolarTermForDate(date)
      });
    }
    
    return days;
  }, [selectedDate]);

  // 導航函式
  const goToToday = () => setSelectedDate(new Date());
  const goToPrevMonth = () => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  const goToNextMonth = () => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  const selectDate = (date) => setSelectedDate(date);

  // 找出本月的節氣
  const monthSolarTerms = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    return solarTerms.filter(term => {
      const termDate = new Date(term.date);
      return termDate.getFullYear() === year && termDate.getMonth() === month;
    });
  }, [selectedDate]);

  return {
    currentDate,
    selectedDate,
    todayInfo,
    calendarDays,
    monthSolarTerms,
    goToToday,
    goToPrevMonth,
    goToNextMonth,
    selectDate,
    herbsDatabase,
    solarTerms
  };
}

// 輔助函式
function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

export default useCalendar;
