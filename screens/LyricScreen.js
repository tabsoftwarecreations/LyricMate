import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LyricScreen({ navigation, route }) {
    // 1. State for our 3-way toggle
    const [displayLanguage, setDisplayLanguage] = useState('English');

    const song = route?.params?.song || {}; 
    const songTitle = song?.title || "Loading Song..."; 
    
    // 2. Safely grab our JSON bucket
    const transliterations = song?.transliterations || {};

    // 3. Extract the scripts with improved safety
    const englishLyrics = transliterations?.english || song?.lyrics || "No lyrics found.";
    
    // Check if transliterations exists but keys are missing
    const hasTrans = song?.transliterations && Object.keys(song.transliterations).length > 0;
    
    const malayalamLyrics = transliterations?.malayalam || (hasTrans ? "Malayalam transliteration not available for this song." : "Transliteration data missing. Try re-uploading.");
    const kannadaLyrics = transliterations?.kannada || (hasTrans ? "Kannada transliteration not available for this song." : "Transliteration data missing. Try re-uploading.");
    const urduLyrics = transliterations?.urdu || (hasTrans ? "Urdu transliteration not available for this song." : "Transliteration data missing. Try re-uploading.");

    // 4. Figure out which text to show based on the toggle switch
    let currentLyricsToDisplay = englishLyrics;
    if (displayLanguage === 'Malayalam') currentLyricsToDisplay = malayalamLyrics;
    if (displayLanguage === 'Kannada') currentLyricsToDisplay = kannadaLyrics;
    if (displayLanguage === 'Urdu') currentLyricsToDisplay = urduLyrics;

    return (
        <View style={styles.container}>
            {/* --- TOP NAVIGATION BAR --- */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#166534" />
                </TouchableOpacity>

                <View style={styles.titleContainer}>
                    <Text style={styles.songTitle} numberOfLines={1}>{songTitle}</Text>
                </View>

                {/* THE NEW 3-WAY PILL TOGGLE */}
                <View style={styles.pillContainer}>
                    {['English', 'Malayalam', 'Kannada', 'Urdu'].map((lang) => {
                        const isActive = displayLanguage === lang;
                        const label = lang === 'English' ? 'EN' : lang === 'Malayalam' ? 'മല' : lang === 'Kannada' ? 'ಕ' : 'اردو';
                        
                        return (
                            <TouchableOpacity 
                                key={lang}
                                style={[styles.pillSegment, isActive && styles.pillSegmentActive]}
                                onPress={() => setDisplayLanguage(lang)}
                            >
                                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                                    {label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* --- THE LYRIC READER --- */}
            <ScrollView style={styles.lyricContainer} showsVerticalScrollIndicator={false}>
                <Text style={[styles.lyrics, displayLanguage === 'Urdu' && { textAlign: 'right' }]}>
                    {currentLyricsToDisplay}
                </Text>
                <View style={styles.bottomSpacer} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0FDF4',
        paddingTop: 45, 
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingBottom: 10,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#D1D5DB',
    },
    backButton: {
        padding: 5,
    },
    titleContainer: {
        flex: 1,
        paddingHorizontal: 10,
    },
    songTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    
    /* --- NEW 3-WAY PILL STYLES --- */
    pillContainer: {
        flexDirection: 'row',
        backgroundColor: '#E5E7EB', // Soft gray background for the whole switch
        borderRadius: 20,
        padding: 3, // Creates a nice border effect around the active bubble
    },
    pillSegment: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 18,
    },
    pillSegmentActive: {
        backgroundColor: '#166534', // Drops a green bubble on the active language
    },
    pillText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#4B5563', // Dark gray for unselected
    },
    pillTextActive: {
        color: '#FFFFFF', // White text for the active selection
    },
    /* ------------------------------ */

    lyricContainer: {
        padding: 24,
    },
    lyrics: {
        fontSize: 22,
        lineHeight: 40, 
        color: '#374151',
        textAlign: 'left',
    },
    bottomSpacer: {
        height: 100,
    }
});