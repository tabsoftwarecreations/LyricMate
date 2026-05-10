import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from './supabase';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

export default function AdminScreen({ navigation }) {
    const { colors, theme } = useTheme();
    const [pendingSongs, setPendingSongs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch pending songs every time the admin opens the screen
    useFocusEffect(
        useCallback(() => {
            fetchPendingSongs();
        }, [])
    );

    const fetchPendingSongs = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('songs')
            .select('*')
            .eq('status', 'pending')

        if (error) {
            console.error('Error fetching pending songs:', error);
            Alert.alert('Error', 'Could not load pending songs.');
        } else {
            setPendingSongs(data || []);
        }
        setLoading(false);
    };

    const handleApprove = async (songId, title) => {
        Alert.alert(
            "Approve Song",
            `Are you sure you want to approve "${title}"? It will go live immediately.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Approve",
                    style: "default",
                    onPress: async () => {
                        const { error } = await supabase
                            .from('songs')
                            .update({ status: 'approved' })
                            .eq('id', songId);

                        if (error) {
                            Alert.alert('Error', 'Failed to approve song.');
                        } else {
                            // Remove it from the local list instantly
                            setPendingSongs(pendingSongs.filter(song => song.id !== songId));
                        }
                    }
                }
            ]
        );
    };

    const handleReject = async (songId, title) => {
        Alert.alert(
            "Reject Song",
            `Are you sure you want to delete "${title}" permanently?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reject & Delete",
                    style: "destructive",
                    onPress: async () => {
                        const { error } = await supabase
                            .from('songs')
                            .delete()
                            .eq('id', songId);

                        if (error) {
                            Alert.alert('Error', 'Failed to delete song.');
                        } else {
                            setPendingSongs(pendingSongs.filter(song => song.id !== songId));
                        }
                    }
                }
            ]
        );
    };

    const renderPendingSong = ({ item }) => (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
                    <Text style={[styles.artist, { color: colors.secondaryText }]}>{item.artist}</Text>
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{item.category}</Text>
                    </View>
                </View>
            </View>

            <Text style={[styles.lyricsPreview, { color: colors.secondaryText }]} numberOfLines={3}>
                {item.lyrics}
            </Text>

            <View style={styles.buttonRow}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleReject(item.id, item.title)}
                >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    <Text style={[styles.buttonText, { color: '#EF4444' }]}>Reject</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => handleApprove(item.id, item.title)}
                >
                    <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
                    <Text style={[styles.buttonText, { color: '#10B981' }]}>Approve</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <Text style={[styles.headerTitle, { color: colors.primary }]}>Admin Dashboard</Text>
                <Text style={[styles.headerSubtitle, { color: colors.secondaryText }]}>
                    Review user submissions
                </Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={pendingSongs}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderPendingSong}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="checkmark-done-circle-outline" size={64} color={colors.border} />
                            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                                You are all caught up! No pending songs to review.
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
    header: { padding: 20, paddingTop: 20, borderBottomWidth: 1 },
    headerTitle: { fontSize: 24, fontWeight: 'bold' },
    headerSubtitle: { fontSize: 16, marginTop: 4 },
    listContainer: { padding: 20, paddingBottom: 50 },
    card: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 15 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    title: { fontSize: 18, fontWeight: 'bold' },
    artist: { fontSize: 14, marginTop: 2, marginBottom: 8 },
    categoryBadge: { alignSelf: 'flex-start', backgroundColor: '#E0E7FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    categoryText: { fontSize: 12, color: '#4338CA', fontWeight: 'bold' },
    lyricsPreview: { fontSize: 14, fontStyle: 'italic', marginBottom: 15, lineHeight: 20 },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8, borderWidth: 1, marginHorizontal: 5 },
    rejectButton: { borderColor: '#FECACA', backgroundColor: '#FEF2F2' },
    approveButton: { borderColor: '#A7F3D0', backgroundColor: '#ECFDF5' },
    buttonText: { fontWeight: 'bold', marginLeft: 8 },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { textAlign: 'center', marginTop: 20, fontSize: 16, paddingHorizontal: 40 }
});