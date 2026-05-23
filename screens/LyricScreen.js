import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { StatusBar } from 'expo-status-bar';

export default function LyricScreen({ navigation, route }) {
    const { colors, theme, fontSize } = useTheme();
    const song = route?.params?.song || {};

    // Default to English
    const [activeLang, setActiveLang] = useState('English');
    
    // Only the core three languages
    const languages = ['English', 'Malayalam', 'Kannada'];

    // Safely extract the data from your Supabase jsonb column
    const getLyricsToDisplay = () => {
        let transData = song.transliterations;

        // If Supabase sends it as a stringified JSON, parse it safely
        if (typeof transData === 'string') {
            try {
                transData = JSON.parse(transData);
            } catch (e) {
                // Ignore parse errors, handle fallback below
            }
        }

        // FIX 1: Helper function to force literal "\n" strings back into real line breaks
        const formatText = (text) => text ? String(text).replace(/\\n/g, '\n') : text;

        // 1. Check if the parsed object exists and has the requested language
        if (transData && typeof transData === 'object') {
            const text = transData[activeLang] || transData[activeLang.toLowerCase()];
            if (text) return formatText(text); // Applied formatting here
        }

        // 2. THE SMART FALLBACK: If they selected English, but there is no specific English JSON,
        // we display the base song.lyrics (assuming it was uploaded in Manglish).
        if (activeLang === 'English' && song.lyrics) {
            return formatText(song.lyrics); // Applied formatting here
        }

        // 3. If it's a completely empty language file
        return `${activeLang} transliteration coming soon...`;
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={theme === 'dark' ? "light" : "dark"} />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Immersive Header */}
                <View style={styles.songInfo}>
                    <Text style={[styles.songTitle, { color: colors.text }]}>{song.title}</Text>
                    <Text style={[styles.songArtist, { color: colors.secondaryText }]}>{song.artist}</Text>
                </View>

                {/* THE 3-WAY SEGMENTED PILL CONTROL */}
                <View style={[styles.segmentedControl, { borderColor: colors.border, backgroundColor: colors.card }]}>
                    {languages.map((lang) => {
                        const isActive = activeLang === lang;
                        return (
                            <TouchableOpacity
                                key={lang}
                                onPress={() => setActiveLang(lang)}
                                style={[
                                    styles.segmentButton,
                                    isActive && { backgroundColor: colors.primary }
                                ]}
                            >
                                <Text style={[
                                    styles.segmentText,
                                    { color: colors.secondaryText },
                                    isActive && { color: theme === 'dark' ? '#000000' : '#FFFFFF', fontWeight: '700' }
                                ]}>
                                    {lang.substring(0, 3).toUpperCase()}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Pure Lyrics Content */}
                <Text style={[styles.lyrics, { color: colors.text, fontSize: fontSize }]}>
                    {getLyricsToDisplay()}
                </Text>

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 30,
        paddingTop: 20,
    },
    songInfo: {
        marginBottom: 20,
        alignItems: 'center',
    },
    songTitle: {
        fontSize: 32,
        fontWeight: '900',
        textAlign: 'center',
    },
    songArtist: {
        fontSize: 18,
        marginTop: 5,
        fontWeight: '500',
    },
    
    // UI Match for the Segmented Control Image
    segmentedControl: {
        flexDirection: 'row',
        alignSelf: 'center',
        borderWidth: 1.5,
        borderRadius: 30,
        padding: 4,
        marginBottom: 30,
        width: '100%',
        maxWidth: 350,
        justifyContent: 'space-between',
    },
    segmentButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    segmentText: {
        fontSize: 14,
        fontWeight: '500',
    },

    lyrics: {
        lineHeight: 45,
        textAlign: 'left',
        fontWeight: '400',
    },
    bottomSpacer: {
        height: 100,
    }
});