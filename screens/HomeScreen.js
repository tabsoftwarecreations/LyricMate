import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from './supabase';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

export default function HomeScreen({ navigation }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Refresh the list every time the user navigates back to this tab
    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchAllSongs();
        }, [])
    );

    const fetchAllSongs = async () => {
        // Fetch all songs and order them alphabetically by title!
        const { data, error } = await supabase
            .from('songs')
            .select('*')
            .order('title', { ascending: true });

        if (error) {
            console.error('Error fetching songs:', error);
        } else {
            setSongs(data);
        }
        setLoading(false);
    };

    // Make the search bar work for both titles and artists
    const filteredSongs = songs.filter((song) => {
        return song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
               song.artist.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const renderSong = ({ item }) => (
        <TouchableOpacity 
            style={styles.songCard}
            // Passing the full "item" suitcase so the LyricScreen gets the AI transliterations!
            onPress={() => navigation.navigate('Lyrics', { song: item })}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
                {/* A tiny badge to show what the original language was */}
                <View style={styles.languageBadge}>
                    <Text style={styles.badgeText}>{item.category}</Text>
                </View>
            </View>
            <Text style={styles.songArtist} numberOfLines={1}>{item.artist}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            
            {/* The Top Brand Header */}
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Ionicons name="book" size={32} color="#166534" />
                    <Text style={styles.headerTitle}>LyricMate</Text>
                </View>
                <Text style={styles.headerSubtitle}>Master Song Collection</Text>
            </View>

            {/* The Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search any song or artist..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* The Master Alphabetical List */}
            {loading ? (
                <ActivityIndicator size="large" color="#166534" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={filteredSongs}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderSong}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    // If the database is empty, show a nice message
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No songs found. Head to the Upload tab to add some!</Text>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0FDF4',
    },
    header: {
        paddingTop: 50, // Space for the status bar
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#166534',
        marginLeft: 10,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#6B7280',
        marginTop: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginTop: 15,
        marginBottom: 5,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1F2937',
    },
    listContainer: {
        padding: 20,
        paddingBottom: 100, // Extra padding so the bottom tab doesn't cover the last song
    },
    songCard: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    songTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        flex: 1, 
        marginRight: 10,
    },
    languageBadge: {
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#166534',
    },
    songArtist: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 6,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
        color: '#6B7280',
    }
});