import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { StatusBar } from 'expo-status-bar';

const { height } = Dimensions.get('window');

export default function LyricScreen({ navigation, route }) {
    const { colors, theme, fontSize, readingLanguage } = useTheme();
    const song = route?.params?.song || {};

    // Determine which lyrics to show
    const lyricsToDisplay = (readingLanguage === 'Transliteration' && song.transliterations)
        ? song.transliterations
        : song.lyrics;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={theme === 'dark' ? "light" : "dark"} />

            {/* Ultra-minimal back button */}
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={[styles.backButton, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
            >
                <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Immersive Header */}
                <View style={styles.songInfo}>
                    <Text style={[styles.songTitle, { color: colors.text }]}>{song.title}</Text>
                    <Text style={[styles.songArtist, { color: colors.secondaryText }]}>{song.artist}</Text>
                </View>

                {/* Pure Lyrics Content */}
                <Text style={[styles.lyrics, { color: colors.text, fontSize: fontSize }]}>
                    {lyricsToDisplay}
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
    backButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    scrollContent: {
        paddingHorizontal: 30,
        paddingTop: 100,
    },
    songInfo: {
        marginBottom: 40,
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
    lyrics: {
        lineHeight: 45,
        textAlign: 'left',
        fontWeight: '400',
    },
    bottomSpacer: {
        height: 100,
    }
});