import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import { safeFetchSongById } from './supabase';

export default function LyricScreen({ navigation, route }) {
    const { colors, theme, fontSize, readingLanguage } = useTheme();
    const initialSong = route?.params?.song || {};

    const [song, setSong] = useState(initialSong);
    const [loading, setLoading] = useState(!initialSong.lyrics && !initialSong.transliterations);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    const [activeLang, setActiveLang] = useState(readingLanguage || 'English');
    const languages = ['English', 'Malayalam', 'Kannada'];

    useEffect(() => {
        let isMounted = true;
        const fetchLyrics = async () => {
            if (!song.id) return;
            if (song.lyrics || song.transliterations) {
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const { data, error: fetchError } = await safeFetchSongById(song.id);
                if (isMounted) {
                    if (fetchError || !data) {
                        setError('Could not load lyrics. Please check your connection.');
                    } else {
                        setSong(data);
                    }
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    setError('Could not load lyrics. Please check your connection.');
                    setLoading(false);
                }
            }
        };
        fetchLyrics();
        return () => { isMounted = false; };
    }, [song.id, retryCount]);

    // ── original logic untouched ──
    const getLyricsToDisplay = () => {
        let transData = song.transliterations;
        if (typeof transData === 'string') {
            try { transData = JSON.parse(transData); } catch (e) { }
        }
        const formatText = (text) => text ? String(text).replace(/\\n/g, '\n') : text;
        if (transData && typeof transData === 'object') {
            const text = transData[activeLang] || transData[activeLang.toLowerCase()];
            if (text) return formatText(text);
        }
        if (activeLang === 'English' && song.lyrics) return formatText(song.lyrics);
        return `${activeLang} transliteration coming soon...`;
    };
    // ── end logic ──

    const langLabels = { English: 'ENG', Malayalam: 'MAL', Kannada: 'KAN' };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

            {/* Ambient blobs */}
            <View style={[styles.blobTop, { backgroundColor: colors.blobA }]} />
            <View style={[styles.blobBottom, { backgroundColor: colors.blobB }]} />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Song Info Card */}
                <View style={[styles.songInfoCard, {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    shadowColor: colors.shadow,
                }]}>
                    {/* gradient-like overlay */}
                    <View style={[styles.cardGlow, { backgroundColor: colors.primarySoft }]} />

                    <View style={[styles.songIconBadge, { backgroundColor: colors.primarySoft }]}>
                        <Ionicons name="musical-note" size={24} color={colors.primary} />
                    </View>

                    <Text style={[styles.songTitle, { color: colors.text }]}>{song.title}</Text>
                    <Text style={[styles.songArtist, { color: colors.secondaryText }]}>{song.artist}</Text>

                    <View style={[styles.categoryPill, { backgroundColor: colors.badge }]}>
                        <Text style={[styles.categoryPillText, { color: colors.badgeText }]}>
                            {song.category}
                        </Text>
                    </View>
                </View>

                {/* Segmented Language Control */}
                <View style={[styles.segmentedControl, {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                }]}>
                    {languages.map((lang) => {
                        const isActive = activeLang === lang;
                        return (
                            <TouchableOpacity
                                key={lang}
                                onPress={() => setActiveLang(lang)}
                                style={[
                                    styles.segmentButton,
                                    isActive && { backgroundColor: colors.primary, shadowColor: colors.primary },
                                ]}
                                activeOpacity={0.8}
                            >
                                <Text style={[
                                    styles.segmentText,
                                    { color: isActive ? '#FFFFFF' : colors.secondaryText },
                                    isActive && { fontWeight: '800' },
                                ]}>
                                    {langLabels[lang]}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Lyrics Card */}
                <View style={[styles.lyricsCard, {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    shadowColor: colors.shadow,
                }]}>
                    {/* Top accent bar */}
                    <View style={[styles.lyricsAccentBar, { backgroundColor: colors.primary }]} />

                    {loading ? (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={[styles.loadingText, { color: colors.secondaryText }]}>Loading lyrics...</Text>
                        </View>
                    ) : error ? (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle-outline" size={32} color={colors.danger} style={{ marginBottom: 8 }} />
                            <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
                            <TouchableOpacity
                                style={[styles.retryButton, { backgroundColor: colors.primary }]}
                                onPress={() => setRetryCount(prev => prev + 1)}
                            >
                                <Text style={styles.retryButtonText}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <Text style={[styles.lyrics, { color: colors.text, fontSize: fontSize, lineHeight: fontSize * 2.2 }]}>
                            {getLyricsToDisplay()}
                        </Text>
                    )}
                </View>

                {/* Font size hint row */}
                <View style={[styles.fontHint, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Ionicons name="text-outline" size={14} color={colors.secondaryText} />
                    <Text style={[styles.fontHintText, { color: colors.secondaryText }]}>
                        Font size: {fontSize}px — adjust in Settings
                    </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                        <Ionicons name="settings-outline" size={16} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    blobTop: {
        position: 'absolute', width: 260, height: 260, borderRadius: 130,
        top: -80, right: -60, opacity: 0.4,
    },
    blobBottom: {
        position: 'absolute', width: 200, height: 200, borderRadius: 100,
        bottom: 60, left: -60, opacity: 0.3,
    },

    scrollContent: { paddingHorizontal: 16, paddingTop: 16 },

    // Song info card
    songInfoCard: {
        alignItems: 'center',
        padding: 26,
        borderRadius: 26,
        marginBottom: 14,
        borderWidth: 1,
        overflow: 'hidden',
        position: 'relative',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 6,
    },
    cardGlow: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        top: -80,
        right: -60,
        opacity: 0.5,
    },
    songIconBadge: {
        width: 52, height: 52, borderRadius: 17,
        justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    },
    songTitle: {
        fontSize: 26, fontWeight: '900',
        textAlign: 'center', letterSpacing: -0.5, marginBottom: 6,
    },
    songArtist: { fontSize: 15, fontWeight: '500', marginBottom: 16 },
    categoryPill: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
    categoryPillText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.2 },

    // Language switcher
    segmentedControl: {
        flexDirection: 'row',
        borderRadius: 18,
        borderWidth: 1,
        padding: 4,
        marginBottom: 14,
    },
    segmentButton: {
        flex: 1, paddingVertical: 11,
        borderRadius: 14,
        alignItems: 'center', justifyContent: 'center',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0,
        shadowRadius: 8,
        elevation: 0,
    },
    segmentText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },

    // Lyrics card
    lyricsCard: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        marginBottom: 12,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.09,
        shadowRadius: 16,
        elevation: 4,
    },
    lyricsAccentBar: {
        height: 3,
        width: '100%',
        opacity: 0.7,
    },
    lyrics: {
        fontWeight: '400',
        padding: 24,
    },

    // Font hint
    fontHint: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 14,
        borderWidth: 1,
        marginBottom: 8,
    },
    fontHintText: { flex: 1, fontSize: 12, fontWeight: '500' },

    bottomSpacer: { height: 100 },

    loaderContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 50,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        fontWeight: '600',
    },
    errorContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    errorText: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 16,
    },
    retryButton: {
        paddingVertical: 10,
        paddingHorizontal: 22,
        borderRadius: 12,
        elevation: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },
});