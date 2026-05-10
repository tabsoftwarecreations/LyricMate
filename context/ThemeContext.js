import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create the Context
const ThemeContext = createContext();

// Define our Color Palettes
const lightColors = {
    background: '#F0FDF4', // Light Green background
    card: '#FFFFFF',
    text: '#064E3B', // Dark Green text
    primary: '#166534',
    secondaryText: '#4B5563',
    border: '#E5E7EB',
};

const darkColors = {
    background: '#022C22', // Very Dark Green background
    card: '#064E3B',
    text: '#ECFDF5', // Light text
    primary: '#10B981', // Bright Green accent
    secondaryText: '#A7F3D0',
    border: '#065F46',
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