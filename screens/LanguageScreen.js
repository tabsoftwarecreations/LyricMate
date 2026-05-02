import React, { useState, useCallback } from 'react';
import {StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, ActivityIndicator} from 'react-native';
import { supabase } from './supabase';
import { useFocusEffect } from '@react-navigation/native';

export default function LanguageScreen({route, navigation}) {
    console.log("THE DATA ARRIVING AT LYRICS SCREEN:", route.params); // Debugging line to check incoming params
    const [isTransliterated, setIsTransliterated] = useState(false);
    const {langName} = route.params;
    const [searchQuery, setSearchQuery] = React.useState('');
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchSongsFromCloud();
        }, [])
    );

    const fetchSongsFromCloud = async () => {
        const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('language', langName);
        if (error) {
            console.error('Error fetching from cloud:', error);
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

    const renderSong=({item}) => (
    <TouchableOpacity style={styles.songCard}
    // THIS LINE IS THE CRITICAL ONE:
    onPress={() => navigation.navigate('Lyrics', { song: item })}>
        <Text style={styles.songTitle}>{item.title}</Text>
        <Text style={styles.songArtist}>{item.artist}</Text>
    </TouchableOpacity>
);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>{langName} Songs</Text>
                </View>

                <View style={styles.searchContainer}>
                    <TextInput
                    style={styles.searchInput}
                    placeholder="Search songs or artists..."
                        value={searchQuery}
                        onChangeText={(text) => setSearchQuery(text)}
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
        paddingTop: 40,
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
});