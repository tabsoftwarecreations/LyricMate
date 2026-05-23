import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create the Context
const ThemeContext = createContext();

// ==========================================
// NEW BRANDING: THE BLUE HARMONY PALETTE
// ==========================================
const lightColors = {
    background: '#FFFFFF',     // Clean White
    card: '#F8FAFC',           // Subtle off-white for cards
    text: '#0F172A',           // Deep Navy
    primary: '#007AFF',        // Classic vibrant tech blue
    secondaryText: '#64748B',  // Muted grey-blue
    border: '#E2E8F0',         // Light grey
};

const darkColors = {
    background: '#040814',     // Deep Midnight Navy
    card: '#0B1120',           // Slightly lighter navy for cards
    text: '#F8FAFC',           // Crisp White
    primary: '#00D4FF',        // Electric Cyan
    secondaryText: '#94A3B8',  // Soft slate grey
    border: '#1E293B',         // Darker navy border
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('light');
    const [fontSize, setFontSize] = useState(18); // Default lyrics font size
    const [isLoaded, setIsLoaded] = useState(false); // Prevents flickering on load

    // 1. Load saved settings when the app opens
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem('@lyricmate_theme');
                const savedFontSize = await AsyncStorage.getItem('@lyricmate_fontsize');

                if (savedTheme) setTheme(savedTheme);
                if (savedFontSize) setFontSize(parseInt(savedFontSize, 10));
            } catch (error) {
                console.error('Failed to load settings', error);
            } finally {
                setIsLoaded(true);
            }
        };
        loadSettings();
    }, []);

    // 2. Toggle Theme and Save to Memory
    const toggleTheme = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        try {
            await AsyncStorage.setItem('@lyricmate_theme', newTheme);
        } catch (error) {
            console.error('Failed to save theme', error);
        }
    };

    // 3. Change Font Size and Save to Memory
    const changeFontSize = async (newSize) => {
        setFontSize(newSize);
        try {
            await AsyncStorage.setItem('@lyricmate_fontsize', newSize.toString());
        } catch (error) {
            console.error('Failed to save font size', error);
        }
    };

    const colors = theme === 'light' ? lightColors : darkColors;

    // Don't render the app until we know the user's preferences to prevent flashes
    if (!isLoaded) return null;

    return (
        <ThemeContext.Provider value={{ theme, colors, toggleTheme, fontSize, changeFontSize }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);