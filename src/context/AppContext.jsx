import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const ContextProvider = ({ children }) => {
  // User data
  const [user, setUser] = useState({
    name: 'Sarah',
    goal: 'tracking', // 'tracking' or 'fertility'
    hasPCOS: false,
    cycleLength: 28,
    periodLength: 5,
    lastPeriod: new Date(2023, 3, 15),
  });

  // Period tracking data
  const [cycles, setCycles] = useState([
    {
      id: 1,
      startDate: new Date(2023, 3, 15),
      endDate: new Date(2023, 3, 20),
      symptoms: [
        { day: 1, flow: 'heavy', mood: 'irritable', pain: 'moderate', notes: 'Cramps in the morning' },
        { day: 2, flow: 'heavy', mood: 'tired', pain: 'severe', notes: 'Took pain medication' },
        { day: 3, flow: 'medium', mood: 'normal', pain: 'mild', notes: '' },
        { day: 4, flow: 'light', mood: 'normal', pain: 'none', notes: '' },
        { day: 5, flow: 'spotting', mood: 'energetic', pain: 'none', notes: '' },
      ]
    },
    {
      id: 2,
      startDate: new Date(2023, 4, 12),
      endDate: new Date(2023, 4, 17),
      symptoms: [
        { day: 1, flow: 'medium', mood: 'anxious', pain: 'mild', notes: '' },
        { day: 2, flow: 'heavy', mood: 'tired', pain: 'moderate', notes: 'Headache in the afternoon' },
        { day: 3, flow: 'medium', mood: 'normal', pain: 'mild', notes: '' },
        { day: 4, flow: 'light', mood: 'normal', pain: 'none', notes: '' },
        { day: 5, flow: 'spotting', mood: 'happy', pain: 'none', notes: '' },
      ]
    },
  ]);

  // Chat history
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: 'Hi Sarah! I\'m Luna, your health companion. How can I help you today?' },
  ]);

  // Articles feed
  const [articles, setArticles] = useState([
    {
      id: 1,
      title: 'Understanding Your Menstrual Cycle',
      summary: 'Learn about the four phases of your menstrual cycle and how they affect your body.',
      image: 'https://img-wrapper.vercel.app/image?url=https://placehold.co/600x400.png?text=Menstrual+Cycle',
      category: 'Education',
      readTime: '5 min',
    },
    {
      id: 2,
      title: 'Natural Remedies for Period Pain',
      summary: 'Discover effective natural remedies to manage menstrual cramps and discomfort.',
      image: 'https://img-wrapper.vercel.app/image?url=https://placehold.co/600x400.png?text=Period+Pain',
      category: 'Wellness',
      readTime: '4 min',
    },
    {
      id: 3,
      title: 'PCOS: Symptoms and Management',
      summary: 'An overview of Polycystic Ovary Syndrome, its symptoms, and management strategies.',
      image: 'https://img-wrapper.vercel.app/image?url=https://placehold.co/600x400.png?text=PCOS',
      category: 'Health',
      readTime: '7 min',
    },
    {
      id: 4,
      title: 'Fertility Tracking: Best Practices',
      summary: 'How to effectively track your fertility window to increase chances of conception.',
      image: 'https://img-wrapper.vercel.app/image?url=https://placehold.co/600x400.png?text=Fertility',
      category: 'Fertility',
      readTime: '6 min',
    },
  ]);

  // Calculate current cycle day and predictions
  const [cycleInfo, setCycleInfo] = useState({
    currentDay: 0,
    nextPeriodDate: null,
    fertileWindow: { start: null, end: null },
    ovulationDate: null,
  });

  useEffect(() => {
    // Calculate current cycle day and predictions based on last period
    const today = new Date();
    const lastPeriod = new Date(user.lastPeriod);
    const daysSinceLastPeriod = Math.floor((today - lastPeriod) / (1000 * 60 * 60 * 24));
    const currentDay = (daysSinceLastPeriod % user.cycleLength) + 1;
    
    const nextPeriodDate = new Date(lastPeriod);
    nextPeriodDate.setDate(lastPeriod.getDate() + Math.ceil(daysSinceLastPeriod / user.cycleLength) * user.cycleLength);
    
    const ovulationDate = new Date(lastPeriod);
    ovulationDate.setDate(lastPeriod.getDate() + Math.ceil(daysSinceLastPeriod / user.cycleLength) * user.cycleLength - 14);
    
    const fertileStart = new Date(ovulationDate);
    fertileStart.setDate(ovulationDate.getDate() - 5);
    
    const fertileEnd = new Date(ovulationDate);
    fertileEnd.setDate(ovulationDate.getDate() + 1);
    
    setCycleInfo({
      currentDay,
      nextPeriodDate,
      fertileWindow: { start: fertileStart, end: fertileEnd },
      ovulationDate,
    });
  }, [user.lastPeriod, user.cycleLength]);

  // Send message to AI assistant (placeholder for now)
  const sendMessage = (message) => {
    setChatHistory([...chatHistory, { role: 'user', content: message }]);
    
    // Simulate AI response (to be replaced with actual API call)
    setTimeout(() => {
      setChatHistory(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: `I understand your question about "${message}". This is a placeholder response. The actual AI integration will be added later.` 
        }
      ]);
    }, 1000);
  };

  // Add symptom data
  const logSymptom = (date, symptomData) => {
    // Find if there's an existing cycle for this date
    const cycleIndex = cycles.findIndex(cycle => 
      date >= cycle.startDate && date <= cycle.endDate
    );

    if (cycleIndex >= 0) {
      // Update existing cycle
      const updatedCycles = [...cycles];
      const cycle = updatedCycles[cycleIndex];
      const dayIndex = Math.floor((date - cycle.startDate) / (1000 * 60 * 60 * 24));
      
      if (cycle.symptoms[dayIndex]) {
        cycle.symptoms[dayIndex] = { ...cycle.symptoms[dayIndex], ...symptomData };
      } else {
        cycle.symptoms[dayIndex] = { day: dayIndex + 1, ...symptomData };
      }
      
      setCycles(updatedCycles);
    } else {
      // Create new cycle if this is a period start
      if (symptomData.flow && ['light', 'medium', 'heavy'].includes(symptomData.flow)) {
        const endDate = new Date(date);
        endDate.setDate(date.getDate() + user.periodLength - 1);
        
        const newCycle = {
          id: cycles.length + 1,
          startDate: new Date(date),
          endDate,
          symptoms: [{ day: 1, ...symptomData }]
        };
        
        setCycles([...cycles, newCycle]);
        
        // Update last period date
        setUser({ ...user, lastPeriod: date });
      }
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      cycles,
      setCycles,
      chatHistory,
      setChatHistory,
      articles,
      setArticles,
      cycleInfo,
      sendMessage,
      logSymptom
    }}>
      {children}
    </AppContext.Provider>
  );
};
