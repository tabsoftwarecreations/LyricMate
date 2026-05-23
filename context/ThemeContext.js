import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

// =============================================
// LIQUID GLASS DESIGN SYSTEM — LYRICMATE v2
// Deep navy frosted glass meets warm amber glow
// =============================================

const lightColors = {
    // Backgrounds
    background: '#F0F4FF',
    backgroundGradient: ['#F0F4FF', '#E6EDFA'],
    card: 'rgba(255, 255, 255, 0.75)',
    cardSolid: '#FFFFFF',
    header: 'rgba(240, 244, 255, 0.94)',

    // Text
    text: '#0D1530',
    secondaryText: '#5A6A8A',
    invertedText: '#FFFFFF',

    // Brand — warmer, more premium blue
    primary: '#2563EB',
    primarySoft: 'rgba(37, 99, 235, 0.10)',
    primaryGlow: 'rgba(37, 99, 235, 0.22)',
    accent: '#7C3AED',

    // Glass aesthetics
    border: 'rgba(255, 255, 255, 0.90)',
    borderSubtle: 'rgba(37, 99, 235, 0.14)',
    innerBorder: 'rgba(0, 0, 0, 0.06)',
    shadow: 'rgba(79, 101, 163, 0.20)',

    // Ambient glow blobs
    blobA: 'rgba(37, 99, 235, 0.15)',
    blobB: 'rgba(124, 58, 237, 0.12)',

    // Semantic
    danger: '#E11D48',
    success: '#059669',
    warning: '#D97706',
    badge: 'rgba(37, 99, 235, 0.09)',
    badgeText: '#2563EB',

    // Tab bar
    tabBar: 'rgba(255, 255, 255, 0.95)',
    tabBarBorder: 'rgba(37, 99, 235, 0.09)',
};

const darkColors = {
    // Backgrounds — deep navy, not pure black
    background: '#0C1224',
    backgroundGradient: ['#0C1224', '#060C1A'],
    card: 'rgba(255, 255, 255, 0.07)',
    cardSolid: '#151E35',
    header: 'rgba(12, 18, 36, 0.97)',

    // Text
    text: '#E8EEFF',
    secondaryText: 'rgba(180, 198, 255, 0.55)',
    invertedText: '#FFFFFF',

    // Brand — soft electric blue
    primary: '#4F8EF7',
    primarySoft: 'rgba(79, 142, 247, 0.15)',
    primaryGlow: 'rgba(79, 142, 247, 0.32)',
    accent: '#8B5CF6',

    // Glass aesthetics
    border: 'rgba(255, 255, 255, 0.14)',
    borderSubtle: 'rgba(79, 142, 247, 0.25)',
    innerBorder: 'rgba(255, 255, 255, 0.08)',
    shadow: 'rgba(0, 0, 0, 0.55)',

    // Glow blobs
    blobA: 'rgba(79, 142, 247, 0.18)',
    blobB: 'rgba(139, 92, 246, 0.14)',

    // Semantic
    danger: '#FB7185',
    success: '#34D399',
    warning: '#FBBF24',
    badge: 'rgba(79, 142, 247, 0.18)',
    badgeText: '#4F8EF7',

    // Tab bar
    tabBar: '#0F1628',
    tabBarBorder: 'rgba(255, 255, 255, 0.08)',
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('dark');
    const [fontSize, setFontSize] = useState(18);
    const [readingLanguage, setReadingLanguage] = useState('English');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem('@lyricmate_theme');
                const savedFontSize = await AsyncStorage.getItem('@lyricmate_fontsize');
                const savedLanguage = await AsyncStorage.getItem('@lyricmate_language');
                if (savedTheme) setTheme(savedTheme);
                if (savedFontSize) setFontSize(parseInt(savedFontSize, 10));
                if (savedLanguage) setReadingLanguage(savedLanguage);
            } catch (error) {
                console.error('Failed to load settings', error);
            } finally {
                setIsLoaded(true);
            }
        };
        loadSettings();
    }, []);

    const toggleTheme = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        try { await AsyncStorage.setItem('@lyricmate_theme', newTheme); }
        catch (error) { console.error('Failed to save theme', error); }
    };

    const changeFontSize = async (newSize) => {
        setFontSize(newSize);
        try { await AsyncStorage.setItem('@lyricmate_fontsize', newSize.toString()); }
        catch (error) { console.error('Failed to save font size', error); }
    };

    const updateReadingLanguage = async (newLang) => {
        setReadingLanguage(newLang);
        try { await AsyncStorage.setItem('@lyricmate_language', newLang); }
        catch (error) { console.error('Failed to save reading language', error); }
    };

    const colors = theme === 'light' ? lightColors : darkColors;
    if (!isLoaded) return null;

    return (
        <ThemeContext.Provider value={{
            theme, colors, toggleTheme,
            fontSize, changeFontSize, updateFontSize: changeFontSize,
            readingLanguage, updateReadingLanguage,
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);