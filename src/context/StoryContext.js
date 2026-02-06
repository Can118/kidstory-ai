import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StoryContext = createContext();
const STORAGE_KEY = 'kidstory_stories';

export function StoryProvider({ children }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) setStories(JSON.parse(stored));
    } catch (e) {
      console.error('Failed to load stories:', e);
    }
    setLoading(false);
  };

  const addStory = async (story) => {
    const updated = [story, ...stories];
    setStories(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <StoryContext.Provider value={{ stories, loading, addStory }}>
      {children}
    </StoryContext.Provider>
  );
}

export function useStoryContext() {
  return useContext(StoryContext);
}
