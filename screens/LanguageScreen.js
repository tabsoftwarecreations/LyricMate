import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { supabase } from './supabase';
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

    useEffect(() => {
        const getUserId = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        };
        getUserId();
    }, []);

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchData();
        }, [categoryName, userId])
    );

    const fetchData = async () => {
        const { data: songsData, error: songsError } = await supabase
            .from('songs')
            .select('*')
            .eq('category', categoryName)
            .eq('status', 'approved')
            .order('title', { ascending: true });

        if (songsError) {
            console.error('Error fetching songs:', songsError);
        } else {
            setSongs(songsData || []);
        }

        if (userId) {
            const { data: favData, error: favError } = await supabase
                .from('favorites')
                .select('song_id')
                .eq('user_id', userId);

            if (favError) {
                console.error('Error fetching favorites:', favError);
            } else {
                setFavorites(favData?.map(f => f.song_id) || []);
            }
        }
        setLoading(false);
    };

    const toggleFavorite = async (songId) => {
        if (!userId) {
            navigation.navigate('Auth');
            return;
        }

        const isFav = favorites.includes(songId);
        if (isFav) {
            const { error } = await supabase
                .from('favorites')
                .delete()
                .eq('user_id', userId)
                .eq('song_id', songId);
            
            if (!error) {
                setFavorites(favorites.filter(id => id !== songId));
            }
        } else {
            const { error } = await supabase
                .from('favorites')
                .insert([{ user_id: userId, song_id: songId }]);
            
            if (!error) {
                setFavorites([...favorites, songId]);
            }
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
                <View style={styles.cardContent}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.songTitle, { color: colors.text }]}>{item.title}</Text>
                        <Text style={[styles.songArtist, { color: colors.secondaryText }]}>{item.artist}</Text>
                    </View>
                    <TouchableOpacity onPress={() => toggleFavorite(item.id)} style={styles.heartButton}>
                        <Ionicons 
                            name={isFavorite ? "heart" : "heart-outline"} 
                            size={24} 
                            color={isFavorite ? "#EF4444" : colors.secondaryText} 
                        />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={theme === 'dark' ? "light" : "dark"} />
            <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <Text style={[styles.headerText, { color: colors.primary }]}>{categoryName}</Text>
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={[styles.searchInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                    placeholder={`Search in ${categoryName}...`}
                    placeholderTextColor={colors.secondaryText}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
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
                    ListEmptyComponent={
                        <Text style={[styles.emptyText, { color: colors.secondaryText }]}>No songs found in this category.</Text>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 20, paddingTop: 50, borderBottomWidth: 1 },
    headerText: { fontSize: 24, fontWeight: 'bold' },
    searchContainer: { paddingHorizontal: 20, paddingTop: 15 },
    searchInput: { padding: 12, borderRadius: 12, fontSize: 16, borderWidth: 1 },
    listContainer: { padding: 20, paddingBottom: 100 },
    songCard: { padding: 16, borderRadius: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    cardContent: { flexDirection: 'row', alignItems: 'center' },
    songTitle: { fontSize: 18, fontWeight: 'bold' },
    songArtist: { fontSize: 14, marginTop: 4 },
    heartButton: { padding: 8 },
    emptyText: { textAlign: 'center', marginTop: 40, fontSize: 16 }
});