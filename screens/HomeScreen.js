import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Platform, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from './supabase';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../context/ThemeContext';

export default function HomeScreen({ navigation }) {
    const { colors, theme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [songs, setSongs] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    const [showAppPopup, setShowAppPopup] = useState(false);

    useEffect(() => {
        if (Platform.OS === 'web') {
            const isAndroid = /android/i.test(navigator.userAgent);
            if (isAndroid) {
                setTimeout(() => setShowAppPopup(true), 2500);
            }
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

    const [refreshing, setRefreshing] = useState(false);

    const fetchAllData = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        const currentUserId = user ? user.id : null;
        setUserId(currentUserId);

        const { data: songsData, error: songsError } = await supabase
            .from('songs')
            .select('*')
            .eq('status', 'approved')
            .order('title', { ascending: true });

        if (!songsError) setSongs(songsData || []);

        if (currentUserId) {
            const { data: favData, error: favError } = await supabase
                .from('favorites')
                .select('song_id')
                .eq('user_id', currentUserId);

            if (!favError) setFavorites(favData.map(f => f.song_id));
        } else {
            setFavorites([]);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            const loadInitialData = async () => {
                setLoading(true);
                await fetchAllData();
                setLoading(false);
            };
            loadInitialData();
        }, [fetchAllData])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchAllData();
        setRefreshing(false);
    }, [fetchAllData]);

    const toggleFavorite = async (songId) => {
        if (!userId) {
            navigation.navigate('Auth');
            return;
        }

        const isFav = favorites.includes(songId);
        if (isFav) {
            const { error } = await supabase.from('favorites').delete().eq('user_id', userId).eq('song_id', songId);
            if (!error) setFavorites(favorites.filter(id => id !== songId));
        } else {
            const { error } = await supabase.from('favorites').insert([{ user_id: userId, song_id: songId }]);
            if (!error) setFavorites([...favorites, songId]);
        }
    };

    const filteredSongs = songs.filter((song) => {
        return song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            song.artist.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const renderSong = ({ item }) => {
        const isFavorite = favorites.includes(item.id);
        return (
            <TouchableOpacity
                style={[styles.songCard, { backgroundColor: colors.card }]}
                onPress={() => navigation.navigate('Lyrics', { song: item })}
            >
                <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.songTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                        <Text style={[styles.songArtist, { color: colors.secondaryText }]} numberOfLines={1}>{item.artist}</Text>
                    </View>
                    <View style={styles.cardActions}>
                        <TouchableOpacity onPress={() => toggleFavorite(item.id)} style={styles.heartButton}>
                            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={24} color={isFavorite ? "#EF4444" : colors.secondaryText} />
                        </TouchableOpacity>
                        <View style={[styles.languageBadge, { backgroundColor: theme === 'dark' ? '#065F46' : '#DCFCE7' }]}>
                            <Text style={[styles.badgeText, { color: theme === 'dark' ? '#A7F3D0' : '#166534' }]}>{item.category}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const handleSearch = (text) => {
        setSearchQuery(text);
        if (text.toLowerCase() === '/admin') {
            setSearchQuery('');
            navigation.navigate('Admin');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={theme === 'dark' ? "light" : "dark"} />

            <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <View style={styles.titleRow}>
                    <Ionicons name="musical-notes" size={32} color={colors.primary} />
                    <Text style={[styles.headerTitle, { color: colors.primary }]}>LyricMate</Text>
                </View>
                <Text style={[styles.headerSubtitle, { color: colors.secondaryText }]}>Collection of Islamic Songs</Text>
            </View>

            <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name="search" size={20} color={colors.secondaryText} style={styles.searchIcon} />
                <TextInput
                    style={[styles.searchInput, { color: colors.text }]}
                    placeholder="Search any song or artist..."
                    placeholderTextColor={colors.secondaryText}
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
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
                            colors={[colors.primary]} // Android
                            tintColor={colors.primary} // iOS
                        />
                    }
                    ListEmptyComponent={<Text style={[styles.emptyText, { color: colors.secondaryText }]}>No songs found.</Text>}
                />
            )}

            {showAppPopup && (
                <View style={styles.popupOverlay}>
                    <View style={[styles.popupBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.popupTitle, { color: colors.text }]}>Sing Offline! 🎤</Text>
                        <Text style={[styles.popupText, { color: colors.secondaryText }]}>Download the native Android app for the best experience.</Text>
                        <TouchableOpacity style={[styles.downloadBtn, { backgroundColor: colors.primary }]} onPress={handleDownloadApp}>
                            <Text style={styles.downloadBtnText}>Download APK</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowAppPopup(false)} style={{ marginTop: 15 }}>
                            <Text style={{ color: colors.secondaryText, textAlign: 'center' }}>No thanks, I'll use the web</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1 },
    titleRow: { flexDirection: 'row', alignItems: 'center' },
    headerTitle: { fontSize: 28, fontWeight: 'bold', marginLeft: 10 },
    headerSubtitle: { fontSize: 16, marginTop: 4 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 15, marginBottom: 5, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1 },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, paddingVertical: 12, fontSize: 16 },
    listContainer: { padding: 20, paddingBottom: 100 },
    songCard: { padding: 16, borderRadius: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    songTitle: { fontSize: 18, fontWeight: 'bold' },
    songArtist: { fontSize: 14, marginTop: 4 },
    cardActions: { flexDirection: 'row', alignItems: 'center' },
    heartButton: { padding: 8, marginRight: 8 },
    languageBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgeText: { fontSize: 12, fontWeight: '700' },
    emptyText: { textAlign: 'center', marginTop: 40, fontSize: 16 },
    popupOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    popupBox: { width: '85%', padding: 25, borderRadius: 16, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
    popupTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
    popupText: { fontSize: 14, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
    downloadBtn: { paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
    downloadBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});