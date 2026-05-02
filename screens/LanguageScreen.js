import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { supabase } from './supabase';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

export default function LanguageScreen({ route, navigation }) {
    // 1. Grab the correct category from the route
    const { categoryName } = route.params;
    
    // Debugging line (Fixed the text to say Language Screen!)
    console.log("📍 THE DATA ARRIVING AT LANGUAGE SCREEN:", categoryName); 

    const [searchQuery, setSearchQuery] = useState('');
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchSongsFromCloud();
        }, [categoryName])
    );

    const fetchSongsFromCloud = async () => {
        // 2. THE CRITICAL FIX: Asking Supabase for the 'category' column, NOT 'language'
        const { data, error } = await supabase
            .from('songs')
            .select('*')
            .eq('category', categoryName); 
            
        if (error) {
            console.error('🚨 Error fetching from cloud:', error);
        } else {
            setSongs(data);
        }
        setLoading(false);
    };

    const filteredSongs = (songs || []).filter((song) => {
        if (!song) return false;
        const title = (song.title || '').toLowerCase();
        const artist = (song.artist || '').toLowerCase();
        const query = (searchQuery || '').toLowerCase();
        return title.includes(query) || artist.includes(query);
    });

    const renderSong = ({ item }) => (
        <TouchableOpacity 
            style={styles.songCard}
            onPress={() => navigation.navigate('Lyrics', { song: item })}
        >
            <Text style={styles.songTitle}>{item.title}</Text>
            <Text style={styles.songArtist}>{item.artist}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <View style={styles.header}>
                {/* 3. Make sure the header displays the right variable */}
                <Text style={styles.headerText}>{categoryName} Songs</Text>
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder={`Search ${categoryName} songs...`}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#166534" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={filteredSongs}
                    keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
                    renderItem={renderSong}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No songs found in this category yet.</Text>
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
        padding: 20,
        paddingTop: 50,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#166534',
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingTop: 15,
    },
    searchInput: {
        backgroundColor: '#ffffff',
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        color: '#1F2937',
    },
    listContainer: {
        padding: 20,
        paddingBottom: 100, // Keeps the bottom tab from covering the last item
    },
    songCard: {
        backgroundColor: '#ffffff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    songTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    songArtist: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
        color: '#6B7280',
    }
});