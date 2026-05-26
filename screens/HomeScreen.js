import React, { useState, useCallback, useEffect } from 'react';
import {
    StyleSheet, Text, View, FlatList, TouchableOpacity,
    TextInput, ActivityIndicator, Platform, RefreshControl, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase, safeFetchSongs } from './supabase';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../context/ThemeContext';

export default function HomeScreen({ navigation }) {
    const { colors, theme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [songs, setSongs] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);
    const [showAppPopup, setShowAppPopup] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (Platform.OS === 'web') {
            const isAndroid = /android/i.test(navigator.userAgent);
            if (isAndroid) setTimeout(() => setShowAppPopup(true), 2500);
        }
    }, []);

    const handleDownloadApp = () => {
        if (Platform.OS === 'web') {
            const link = document.createElement('a');
            link.href = 'https://github.com/tabsoftwarecreations/LyricMate/releases/download/v1.0.0/lyricmate.apk';
            link.download = 'lyricmate.apk';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        setShowAppPopup(false);
    };

    const fetchAllData = useCallback(async () => {
        try {
            setError(null);
            const { data: { session } } = await supabase.auth.getSession();
            const currentUserId = session?.user ? session.user.id : null;
            setUserId(currentUserId);

            // Fetch songs and favorites in parallel
            const songsPromise = safeFetchSongs(null, 3);
            const favoritesPromise = currentUserId
                ? supabase.from('favorites').select('song_id').eq('user_id', currentUserId)
                : Promise.resolve({ data: [], error: null });

            const [songsResult, favoritesResult] = await Promise.all([songsPromise, favoritesPromise]);

            if (songsResult.error) {
                console.error('Songs fetch error after retries:', songsResult.error);
                setError('Could not load songs. Pull down to retry.');
            } else {
                setSongs(songsResult.data || []);
            }

            if (!favoritesResult.error && favoritesResult.data) {
                setFavorites(favoritesResult.data.map(f => f.song_id));
            } else {
                setFavorites([]);
            }
        } catch (err) {
            console.error('fetchAllData error:', err);
            setError('Network error. Pull down to retry.');
        }
    }, []);

    useFocusEffect(useCallback(() => {
        if (songs.length === 0) {
            setLoading(true);
        }
        fetchAllData().finally(() => setLoading(false));
    }, [fetchAllData, songs]));

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchAllData();
        setRefreshing(false);
    }, [fetchAllData]);

    const toggleFavorite = async (songId) => {
        if (!userId) { navigation.navigate('Auth'); return; }
        const isFav = favorites.includes(songId);
        if (isFav) {
            const { error } = await supabase.from('favorites').delete().eq('user_id', userId).eq('song_id', songId);
            if (!error) setFavorites(prev => prev.filter(id => id !== songId));
        } else {
            const { error } = await supabase.from('favorites').insert([{ user_id: userId, song_id: songId }]);
            if (!error) setFavorites(prev => [...prev, songId]);
        }
    };

    const filteredSongs = songs.filter(song =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSearch = (text) => {
        setSearchQuery(text);
        if (text.toLowerCase() === '/admin') {
            setSearchQuery('');
            navigation.navigate('Admin');
        }
    };

    const renderSong = ({ item, index }) => {
        const isFavorite = favorites.includes(item.id);
        return (
            <TouchableOpacity
                style={[styles.songCard, {
                    backgroundColor: colors.cardSolid,
                    borderColor: colors.innerBorder,
                }]}
                activeOpacity={0.75}
                onPress={() => navigation.navigate('Lyrics', { song: item })}
            >
                <View style={[styles.songNumber, { backgroundColor: colors.primarySoft }]}>
                    <Text style={[styles.songNumberText, { color: colors.primary }]}>
                        {String(index + 1).padStart(2, '0')}
                    </Text>
                </View>

                <View style={styles.songMeta}>
                    <Text style={[styles.songTitle, { color: colors.text }]} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <Text style={[styles.songArtist, { color: colors.secondaryText }]} numberOfLines={1}>
                        {item.artist}
                    </Text>
                </View>

                <View style={styles.cardActions}>
                    <TouchableOpacity
                        onPress={() => toggleFavorite(item.id)}
                        style={styles.heartButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons
                            name={isFavorite ? 'heart' : 'heart-outline'}
                            size={20}
                            color={isFavorite ? colors.danger : colors.secondaryText}
                        />
                    </TouchableOpacity>
                    <View style={[styles.languageBadge, { backgroundColor: colors.badge }]}>
                        <Text style={[styles.badgeText, { color: colors.badgeText }]} numberOfLines={1}>
                            {item.category}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.innerBorder }]}>
                <View style={styles.titleRow}>
                    <Image
                        source={require('../assets/adaptive-icon.png')}
                        style={{ width: 38, height: 38, borderRadius: 10, marginRight: 12 }}
                    />
                    <View>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>LyricMate</Text>
                        <Text style={[styles.headerSubtitle, { color: colors.secondaryText }]}>
                            Collection of Islamic Songs
                        </Text>
                    </View>
                </View>
            </View>

            {/* Search Bar */}
            <View style={[styles.searchContainer, {
                backgroundColor: colors.cardSolid,
                borderColor: colors.innerBorder,
            }]}>
                <Ionicons name="search-outline" size={17} color={colors.secondaryText} style={styles.searchIcon} />
                <TextInput
                    style={[styles.searchInput, { color: colors.text }]}
                    placeholder="Search songs or artists..."
                    placeholderTextColor={colors.secondaryText}
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={17} color={colors.secondaryText} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Song count */}
            {!loading && (
                <View style={styles.countRow}>
                    <Text style={[styles.countText, { color: colors.secondaryText }]}>
                        {filteredSongs.length} {filteredSongs.length === 1 ? 'song' : 'songs'}
                    </Text>
                </View>
            )}

            {/* Error Banner */}
            {error && !loading && (
                <TouchableOpacity
                    style={[styles.errorBanner, { backgroundColor: 'rgba(251,113,133,0.12)', borderColor: 'rgba(251,113,133,0.25)' }]}
                    onPress={onRefresh}
                    activeOpacity={0.7}
                >
                    <Ionicons name="wifi-outline" size={18} color={colors.danger} style={{ marginRight: 8 }} />
                    <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
                </TouchableOpacity>
            )}

            {/* List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
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
                            <Ionicons name="musical-note-outline" size={56} color={colors.secondaryText} />
                            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Songs Found</Text>
                            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                                {searchQuery ? 'Try a different search term.' : 'No approved songs yet.'}
                            </Text>
                        </View>
                    }
                />
            )}

            {/* APK download popup */}
            {showAppPopup && (
                <View style={styles.popupOverlay}>
                    <View style={[styles.popupBox, { backgroundColor: colors.cardSolid, borderColor: colors.innerBorder }]}>
                        <Text style={[styles.popupTitle, { color: colors.text }]}>Sing Offline! 🎤</Text>
                        <Text style={[styles.popupText, { color: colors.secondaryText }]}>
                            Download the native Android app for the best experience.
                        </Text>
                        <TouchableOpacity
                            style={[styles.downloadBtn, { backgroundColor: colors.primary }]}
                            onPress={handleDownloadApp}
                        >
                            <Text style={styles.downloadBtnText}>Download APK</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowAppPopup(false)} style={{ marginTop: 14 }}>
                            <Text style={{ color: colors.secondaryText, textAlign: 'center', fontSize: 14 }}>No thanks</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    header: {
        paddingTop: 12,
        paddingHorizontal: 20,
        paddingBottom: 14,
        borderBottomWidth: 0.5,
    },
    titleRow: { flexDirection: 'row', alignItems: 'center' },
    logoCircle: {
        width: 38, height: 38, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 12,
    },
    headerTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
    headerSubtitle: { fontSize: 12, marginTop: 1, fontWeight: '500' },

    searchContainer: {
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: 16, marginTop: 12, marginBottom: 4,
        paddingHorizontal: 14, paddingVertical: 2,
        borderRadius: 14, borderWidth: 1,
    },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, paddingVertical: 12, fontSize: 15 },

    countRow: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 2 },
    countText: { fontSize: 12, fontWeight: '600' },

    listContainer: { paddingHorizontal: 14, paddingTop: 6, paddingBottom: 110 },

    songCard: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 14, paddingVertical: 14,
        borderRadius: 16, marginBottom: 8, borderWidth: 1,
        elevation: 2,
    },
    songNumber: {
        width: 36, height: 36, borderRadius: 11,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 12,
    },
    songNumberText: { fontSize: 11, fontWeight: '800' },
    songMeta: { flex: 1 },
    songTitle: { fontSize: 15, fontWeight: '700' },
    songArtist: { fontSize: 12, marginTop: 3 },
    cardActions: { flexDirection: 'row', alignItems: 'center', marginLeft: 10 },
    heartButton: { padding: 4, marginRight: 8 },
    languageBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    badgeText: { fontSize: 10, fontWeight: '800' },

    emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 16, marginBottom: 6 },
    emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

    errorBanner: {
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: 16, marginBottom: 8,
        paddingHorizontal: 14, paddingVertical: 12,
        borderRadius: 12, borderWidth: 1,
    },
    errorText: { flex: 1, fontSize: 13, fontWeight: '600' },

    popupOverlay: {
        position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center', alignItems: 'center',
    },
    popupBox: {
        width: '85%', padding: 28, borderRadius: 24, borderWidth: 1,
        alignItems: 'center',
    },
    popupTitle: { fontSize: 22, fontWeight: '700', marginBottom: 10, textAlign: 'center' },
    popupText: { fontSize: 14, textAlign: 'center', marginBottom: 22, lineHeight: 20 },
    downloadBtn: { paddingVertical: 14, paddingHorizontal: 28, borderRadius: 14, alignItems: 'center' },
    downloadBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});