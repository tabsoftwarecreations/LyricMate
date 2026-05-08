import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [theme, setTheme] = useState(systemColorScheme || 'light');
    const [fontSize, setFontSize] = useState(18);
    const [readingLanguage, setReadingLanguage] = useState('English');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('theme');
            const savedFontSize = await AsyncStorage.getItem('fontSize');
            const savedLang = await AsyncStorage.getItem('readingLanguage');
            if (savedTheme) setTheme(savedTheme);
            if (savedFontSize) setFontSize(parseInt(savedFontSize));
            if (savedLang) setReadingLanguage(savedLang);
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const toggleTheme = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        await AsyncStorage.setItem('theme', newTheme);
    };

    const updateFontSize = async (size) => {
        setFontSize(size);
        await AsyncStorage.setItem('fontSize', size.toString());
    };

    const updateReadingLanguage = async (lang) => {
        setReadingLanguage(lang);
        await AsyncStorage.setItem('readingLanguage', lang);
    };

    const colors = {
        light: {
            background: '#FFFFFF',
            text: '#000000',
            primary: '#166534',
            card: '#F3F4F6',
            border: '#E5E7EB',
            secondaryText: '#6B7280',
        },
        dark: {
            background: '#111827',
            text: '#F9FAFB',
            primary: '#22C55E',
            card: '#1F2937',
            border: '#374151',
            secondaryText: '#9CA3AF',
        }
    };

    return (
        <ThemeContext.Provider value={{ 
            theme, 
            toggleTheme, 
            fontSize, 
            updateFontSize, 
            readingLanguage,
            updateReadingLanguage,
            colors: colors[theme] 
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
