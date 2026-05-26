import React, { useState, useCallback } from 'react';
import {
    StyleSheet, Text, View, FlatList, TouchableOpacity,
    TextInput, ActivityIndicator, RefreshControl
} from 'react-native';
import { supabase, safeFetchSongs } from './supabase';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function LanguageScreen({ route, navigation }) {
    const { categoryName } = route.params;
    const { colors, theme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [songs, setSongs] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    // ── all original logic untouched ──
    useFocusEffect(useCallback(() => {
        const fetchData = async () => {
            if (songs.length === 0) {
                setLoading(true);
            }
            const { data: { session } } = await supabase.auth.getSession();
            const currentUserId = session?.user ? session.user.id : null;
            setUserId(currentUserId);

            // Fetch songs and favorites in parallel
            const songsPromise = safeFetchSongs(categoryName, 3);
            const favoritesPromise = currentUserId
                ? supabase.from('favorites').select('song_id').eq('user_id', currentUserId)
                : Promise.resolve({ data: [], error: null });

            const [songsResult, favoritesResult] = await Promise.all([songsPromise, favoritesPromise]);

            if (!songsResult.error) setSongs(songsResult.data || []);
            if (!favoritesResult.error && favoritesResult.data) {
                setFavorites(favoritesResult.data.map(f => f.song_id));
            } else {
                setFavorites([]);
            }
            setLoading(false);
        };
        fetchData();
    }, [categoryName, songs]));

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        const { data: songsData, error: songsError } = await safeFetchSongs(categoryName, 3);
        if (!songsError) setSongs(songsData || []);
        setRefreshing(false);
    }, [categoryName]);

    const toggleFavorite = async (songId) => {
        if (!userId) { navigation.navigate('Auth'); return; }
        const isFav = favorites.includes(songId);
        if (isFav) {
            const { error } = await supabase.from('favorites').delete().eq('user_id', userId).eq('song_id', songId);
            if (!error) setFavorites(favorites.filter(id => id !== songId));
        } else {
            const { error } = await supabase.from('favorites').insert([{ user_id: userId, song_id: songId }]);
            if (!error) setFavorites([...favorites, songId]);
        }
    };

    const filteredSongs = songs.filter(song =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase())
    );
    // ── end logic ──

    const renderSong = ({ item, index }) => {
        const isFavorite = favorites.includes(item.id);
        return (
            <TouchableOpacity
                style={[styles.songCard, {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    shadowColor: colors.shadow,
                }]}
                activeOpacity={0.78}
                onPress={() => navigation.navigate('Lyrics', { song: item })}
            >
                <View style={[styles.songIndex, { backgroundColor: colors.primarySoft }]}>
                    <Text style={[styles.songIndexText, { color: colors.primary }]}>
                        {String(index + 1).padStart(2, '0')}
                    </Text>
                </View>
                <View style={styles.cardContent}>
                    <Text style={[styles.songTitle, { color: colors.text }]} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <Text style={[styles.songArtist, { color: colors.secondaryText }]} numberOfLines={1}>
                        {item.artist}
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => toggleFavorite(item.id)}
                    style={styles.heartButton}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <Ionicons
                        name={isFavorite ? 'heart' : 'heart-outline'}
                        size={20}
                        color={isFavorite ? colors.danger : colors.secondaryText}
                    />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

            {/* Ambient blobs */}
            <View style={[styles.blobTop, { backgroundColor: colors.blobA }]} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.border }]}>
                <Text style={[styles.headerLabel, { color: colors.secondaryText }]}>Category</Text>
                <Text style={[styles.headerText, { color: colors.text }]}>{categoryName}</Text>
            </View>

            {/* Search */}
            <View style={[styles.searchContainer, {
                backgroundColor: colors.card,
                borderColor: colors.border,
                shadowColor: colors.shadow,
            }]}>
                <Ionicons name="search-outline" size={17} color={colors.secondaryText} style={{ marginRight: 8 }} />
                <TextInput
                    style={[styles.searchInput, { color: colors.text }]}
                    placeholder={`Search in ${categoryName}...`}
                    placeholderTextColor={colors.secondaryText}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Ionicons name="close-circle" size={17} color={colors.secondaryText} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Count label */}
            {!loading && (
                <View style={styles.countRow}>
                    <Text style={[styles.countText, { color: colors.secondaryText }]}>
                        {filteredSongs.length} {filteredSongs.length === 1 ? 'song' : 'songs'}
                    </Text>
                </View>
            )}

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />
            ) : (
                <FlatList
                    data={filteredSongs}
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
                                <Ionicons name="musical-note-outline" size={40} color={colors.secondaryText} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Songs Here</Text>
                            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                                No songs found in this category yet.
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

    blobTop: {
        position: 'absolute', width: 240, height: 240, borderRadius: 120,
        top: -60, right: -50, opacity: 0.4,
    },

    header: {
        paddingTop: 54,
        paddingHorizontal: 22,
        paddingBottom: 16,
        borderBottomWidth: 0.5,
    },
    headerLabel: { fontSize: 13, fontWeight: '600', marginBottom: 3 },
    headerText: { fontSize: 30, fontWeight: '900', letterSpacing: -0.6 },

    searchContainer: {
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: 16, marginTop: 12, marginBottom: 4,
        paddingHorizontal: 14, paddingVertical: 2,
        borderRadius: 16, borderWidth: 1,
        shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.09, shadowRadius: 10, elevation: 4,
    },
    searchInput: { flex: 1, paddingVertical: 12, fontSize: 15 },

    countRow: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 2 },
    countText: { fontSize: 12, fontWeight: '600' },

    listContainer: { paddingHorizontal: 14, paddingTop: 6, paddingBottom: 110 },

    songCard: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 14, paddingVertical: 14,
        borderRadius: 18, marginBottom: 8, borderWidth: 1,
        shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4,
    },
    songIndex: {
        width: 36, height: 36, borderRadius: 11,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 12,
    },
    songIndexText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },
    cardContent: { flex: 1 },
    songTitle: { fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
    songArtist: { fontSize: 12, marginTop: 3, fontWeight: '500' },
    heartButton: { padding: 8, marginLeft: 6 },

    emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
    emptyIconWrap: {
        width: 80, height: 80, borderRadius: 24,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 18, borderWidth: 1,
    },
    emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
    emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 21 },
});