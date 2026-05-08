import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from './supabase';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

export default function FavouritesScreen({ navigation }) {
    const { colors, theme } = useTheme();
    const [favoriteSongs, setFavoriteSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const getUserId = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
            else navigation.navigate('Auth');
        };
        getUserId();
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (userId) {
                fetchFavorites();
            }
        }, [userId])
    );

    const fetchFavorites = async () => {
        setLoading(true);
        // Get favorite IDs for this user
        const { data: favData, error: favError } = await supabase
            .from('favorites')
            .select('song_id')
            .eq('user_id', userId);

        if (favError) {
            console.error('Error fetching favorite IDs:', favError);
            setLoading(false);
            return;
        }

        const songIds = favData.map(f => f.song_id);

        if (songIds.length === 0) {
            setFavoriteSongs([]);
            setLoading(false);
            return;
        }

        // Fetch song details for those IDs
        const { data: songsData, error: songsError } = await supabase
            .from('songs')
            .select('*')
            .in('id', songIds)
            .order('title', { ascending: true });

        if (songsError) {
            console.error('Error fetching favorite songs:', songsError);
        } else {
            setFavoriteSongs(songsData);
        }
        setLoading(false);
    };

    const removeFavorite = async (songId) => {
        const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('user_id', userId)
            .eq('song_id', songId);
        
        if (!error) {
            setFavoriteSongs(favoriteSongs.filter(s => s.id !== songId));
        }
    };

    const renderSong = ({ item }) => (
        <TouchableOpacity 
            style={[styles.songCard, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate('Lyrics', { song: item })}
        >
            <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.songTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                    <Text style={[styles.songArtist, { color: colors.secondaryText }]} numberOfLines={1}>{item.artist}</Text>
                </View>
                <TouchableOpacity onPress={() => removeFavorite(item.id)} style={styles.heartButton}>
                    <Ionicons name="heart" size={24} color="#EF4444" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={favoriteSongs}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderSong}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="heart-outline" size={64} color={colors.border} />
                            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>No favorites yet. Tap the heart on any song to save it!</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContainer: {
        padding: 20,
    },
    songCard: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    songTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    songArtist: {
        fontSize: 14,
        marginTop: 4,
    },
    heartButton: {
        padding: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        paddingHorizontal: 40,
    }
});