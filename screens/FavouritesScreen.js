import React, { useState, useCallback } from 'react';
import {
    StyleSheet, Text, View, FlatList, TouchableOpacity,
    ActivityIndicator, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase, safeFetchSongsByIds } from './supabase';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { StatusBar } from 'expo-status-bar';

export default function FavouritesScreen({ navigation }) {
    const { colors, theme } = useTheme();
    const [favoriteSongs, setFavoriteSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userId, setUserId] = useState(null);

    const fetchFavorites = useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user || null;
        if (!user) { setUserId(null); setFavoriteSongs([]); setLoading(false); return; }
        setUserId(user.id);
        const { data: favData, error: favError } = await supabase
            .from('favorites').select('song_id').eq('user_id', user.id);
        if (favError || !favData || favData.length === 0) { setFavoriteSongs([]); setLoading(false); return; }
        const songIds = favData.map(f => f.song_id);
        const { data: songsData, error: songsError } = await safeFetchSongsByIds(songIds, 3);
        if (!songsError) setFavoriteSongs(songsData || []);
        setLoading(false);
    }, []);

    useFocusEffect(useCallback(() => {
        setLoading(true); fetchFavorites();
    }, [fetchFavorites]));

    const onRefresh = useCallback(async () => {
        setRefreshing(true); await fetchFavorites(); setRefreshing(false);
    }, [fetchFavorites]);

    const removeFavorite = async (songId) => {
        const { error } = await supabase.from('favorites').delete().eq('user_id', userId).eq('song_id', songId);
        if (!error) setFavoriteSongs(favoriteSongs.filter(s => s.id !== songId));
    };

    // Category accent colours — matches the design palette
    const categoryAccent = (cat) => {
        const map = {
            'Malayalam': '#4F8EF7',
            'Arabic': '#8B5CF6',
            'Kannada': '#10B981',
            'Urdu': '#F59E0B',
            'Mappila Patt': '#EC4899',
            'English': '#06B6D4',
            'Mashup': '#F97316',
        };
        return map[cat] || '#4F8EF7';
    };

    const renderSong = ({ item, index }) => {
        const accent = categoryAccent(item.category);
        return (
            <TouchableOpacity
                style={[styles.songCard, {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    shadowColor: colors.shadow,
                }]}
                activeOpacity={0.70}
                onPress={() => navigation.navigate('Lyrics', { song: item })}
            >
                {/* Left accent bar */}
                <View style={[styles.accentBar, { backgroundColor: accent }]} />

                <View style={styles.cardContent}>
                    {/* Icon */}
                    <View style={[styles.iconWrap, { backgroundColor: `${accent}18` }]}>
                        <Ionicons name="musical-note" size={18} color={accent} />
                    </View>

                    {/* Text */}
                    <View style={styles.textBlock}>
                        <Text style={[styles.songTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                        <Text style={[styles.songArtist, { color: colors.secondaryText }]} numberOfLines={1}>{item.artist}</Text>
                    </View>

                    {/* Category pill */}
                    <View style={[styles.catPill, { backgroundColor: `${accent}16`, borderColor: `${accent}30` }]}>
                        <Text style={[styles.catPillText, { color: accent }]}>{item.category}</Text>
                    </View>

                    {/* Remove button */}
                    <TouchableOpacity onPress={() => removeFavorite(item.id)} style={styles.removeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Ionicons name="heart-dislike-outline" size={19} color={colors.danger} />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={theme === 'dark' ? "light" : "dark"} />

            {/* Ambient blobs */}
            <View style={[styles.blobA, { backgroundColor: colors.blobA }]} />
            <View style={[styles.blobB, { backgroundColor: colors.blobB }]} />

            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.innerBorder }]}>
                <Text style={[styles.headerLabel, { color: colors.secondaryText }]}>YOUR SAVED SONGS</Text>
                <View style={styles.headerRow}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Favourites</Text>
                    {favoriteSongs.length > 0 && (
                        <View style={[styles.countBadge, { backgroundColor: colors.badge }]}>
                            <Text style={[styles.countBadgeText, { color: colors.primary }]}>{favoriteSongs.length}</Text>
                        </View>
                    )}
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 80 }} />
            ) : (
                <FlatList
                    data={favoriteSongs}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderSong}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.primary]}
                            tintColor={colors.primary}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={[styles.emptyIconWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <Ionicons name="heart-outline" size={38} color={colors.secondaryText} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Favourites Yet</Text>
                            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                                Tap the heart icon on any song to save it here.
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    // Ambient blobs
    blobA: {
        position: 'absolute', width: 300, height: 300, borderRadius: 150,
        top: -80, right: -100, opacity: 0.45,
    },
    blobB: {
        position: 'absolute', width: 200, height: 200, borderRadius: 100,
        top: 250, left: -80, opacity: 0.35,
    },

    // Header
    header: {
        paddingTop: 56, paddingHorizontal: 22, paddingBottom: 16,
        borderBottomWidth: 0.5,
    },
    headerLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 4 },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    headerTitle: { fontSize: 30, fontWeight: '800', letterSpacing: -0.6 },
    countBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    countBadgeText: { fontSize: 13, fontWeight: '800' },

    // List
    listContainer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 120 },

    // Song Card
    songCard: {
        flexDirection: 'row',
        borderRadius: 18, marginBottom: 10, borderWidth: 1,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 12, elevation: 4,
    },
    accentBar: { width: 3.5, borderRadius: 2 },
    cardContent: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 14, paddingVertical: 14, gap: 12,
    },
    iconWrap: { width: 38, height: 38, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
    textBlock: { flex: 1 },
    songTitle: { fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
    songArtist: { fontSize: 12, marginTop: 2 },
    catPill: {
        paddingHorizontal: 9, paddingVertical: 4,
        borderRadius: 10, borderWidth: 1,
    },
    catPillText: { fontSize: 11, fontWeight: '700' },
    removeBtn: { padding: 4 },

    // Empty state
    emptyContainer: { alignItems: 'center', marginTop: 90, paddingHorizontal: 40 },
    emptyIconWrap: {
        width: 80, height: 80, borderRadius: 24,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 18, borderWidth: 1,
    },
    emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
    emptyText: { textAlign: 'center', fontSize: 15, lineHeight: 22 },
});