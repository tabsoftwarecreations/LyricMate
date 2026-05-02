import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LyricScreen({ navigation, route }) {
    const [isTransliterated, setIsTransliterated] = useState(false);

    // BULLETPROOF DATA EXTRACTION: Prevents the "undefined" crash
    const song = route?.params?.song || {}; 
    const songTitle = song?.title || "Loading Song..."; 
    const nativeLyrics = song?.native_lyrics || "Native script coming soon! Upload it via the app.";
    const englishLyrics = song?.lyrics || "No transliteration available.";

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#166534" />
                </TouchableOpacity>

                <View style={styles.titleContainer}>
                    <Text style={styles.songTitle}>{songTitle}</Text>
                </View>

                <TouchableOpacity 
                    style={[styles.toggleButton, isTransliterated ? styles.toggleActive : styles.toggleInactive]} 
                    onPress={() => setIsTransliterated(!isTransliterated)}
                >
                    <Text style={[styles.toggleText, isTransliterated ? styles.textActive : styles.textInactive]}>
                        {isTransliterated ? 'EN' : 'അ/A'}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.lyricContainer} showsVerticalScrollIndicator={false}>
                <Text style={styles.lyrics}>
                    {isTransliterated ? englishLyrics : nativeLyrics}
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
        paddingTop: 45, // This safely replaces the deprecated SafeAreaView
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#D1D5DB',
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        padding: 5,
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    songTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    toggleButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1.5,
    },
    toggleInactive: {
        backgroundColor: '#FFFFFF',
        borderColor: '#166534',
    },
    toggleActive: {
        backgroundColor: '#166534',
        borderColor: '#166534',
    },
    toggleText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    textInactive: {
        color: '#166534',
    },
    textActive: {
        color: '#FFFFFF',
    },
    lyricContainer: {
        padding: 24,
    },
    lyrics: {
        fontSize: 22,
        lineHeight: 40, 
        color: '#374151',
        textAlign: 'center',
    },
    bottomSpacer: {
        height: 100,
    }
});