import React, { useState, useCallback } from 'react';
import {
    StyleSheet, Text, View, FlatList, TouchableOpacity,
    ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase, safeFetchPendingSongs, safeUpdateSongStatus, safeDeleteSong } from './supabase';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { StatusBar } from 'expo-status-bar';

export default function AdminScreen({ navigation }) {
    const { colors, theme } = useTheme();
    const [pendingSongs, setPendingSongs] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => { fetchPendingSongs(); }, [])
    );

    const fetchPendingSongs = async () => {
        setLoading(true);
        const { data, error } = await safeFetchPendingSongs(3);
        if (error) { 
            console.error('Error fetching pending songs:', error); 
            Alert.alert('Error', 'Could not load pending songs.'); 
        } else { 
            setPendingSongs(data || []); 
        }
        setLoading(false);
    };

    const handleApprove = async (songId, title) => {
        Alert.alert("Approve Song", `Are you sure you want to approve "${title}"? It will go live immediately.`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Approve", style: "default",
                onPress: async () => {
                    const { error } = await safeUpdateSongStatus(songId, 'approved');
                    if (error) Alert.alert('Error', 'Failed to approve song.');
                    else setPendingSongs(pendingSongs.filter(s => s.id !== songId));
                }
            }
        ]);
    };

    const handleReject = async (songId, title) => {
        Alert.alert("Reject Song", `Are you sure you want to delete "${title}" permanently?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Reject & Delete", style: "destructive",
                onPress: async () => {
                    const { error } = await safeDeleteSong(songId);
                    if (error) Alert.alert('Error', 'Failed to delete song.');
                    else setPendingSongs(pendingSongs.filter(s => s.id !== songId));
                }
            }
        ]);
    };

    const renderPendingSong = ({ item }) => (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}>
            {/* Card header */}
            <View style={styles.cardHeader}>
                <View style={[styles.cardIconWrap, { backgroundColor: colors.primarySoft }]}>
                    <Ionicons name="musical-notes-outline" size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                    <Text style={[styles.artist, { color: colors.secondaryText }]} numberOfLines={1}>{item.artist}</Text>
                </View>
                <View style={[styles.categoryBadge, { backgroundColor: colors.badge, borderColor: colors.borderSubtle }]}>
                    <Text style={[styles.categoryText, { color: colors.primary }]}>{item.category}</Text>
                </View>
            </View>

            {/* Lyrics preview */}
            <View style={[styles.lyricsBox, { backgroundColor: colors.innerBorder, borderColor: colors.innerBorder }]}>
                <Text style={[styles.lyricsPreview, { color: colors.secondaryText }]} numberOfLines={3}>
                    {item.lyrics}
                </Text>
            </View>

            {/* Action buttons */}
            <View style={styles.buttonRow}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton, { borderColor: 'rgba(251,113,133,0.30)', backgroundColor: 'rgba(251,113,133,0.07)' }]}
                    onPress={() => handleReject(item.id, item.title)}
                    activeOpacity={0.7}
                >
                    <Ionicons name="trash-outline" size={17} color={colors.danger} />
                    <Text style={[styles.buttonText, { color: colors.danger }]}>Reject</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, { borderColor: 'rgba(52,211,153,0.30)', backgroundColor: 'rgba(52,211,153,0.07)' }]}
                    onPress={() => handleApprove(item.id, item.title)}
                    activeOpacity={0.7}
                >
                    <Ionicons name="checkmark-circle-outline" size={17} color={colors.success} />
                    <Text style={[styles.buttonText, { color: colors.success }]}>Approve</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={theme === 'dark' ? "light" : "dark"} />

            {/* Ambient blob */}
            <View style={[styles.blob, { backgroundColor: colors.blobA }]} />

            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.innerBorder }]}>
                <Text style={[styles.headerEyebrow, { color: colors.secondaryText }]}>ADMIN</Text>
                <View style={styles.headerRow}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Review Queue</Text>
                    {pendingSongs.length > 0 && (
                        <View style={[styles.pendingBadge, { backgroundColor: colors.warning + '22', borderColor: colors.warning + '44' }]}>
                            <Text style={[styles.pendingBadgeText, { color: colors.warning }]}>{pendingSongs.length} pending</Text>
                        </View>
                    )}
                </View>
                <Text style={[styles.headerSub, { color: colors.secondaryText }]}>Review and approve user submissions</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />
            ) : (
                <FlatList
                    data={pendingSongs}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderPendingSong}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={[styles.emptyIconWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <Ionicons name="checkmark-done-circle-outline" size={40} color={colors.success} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: colors.text }]}>All Clear!</Text>
                            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                                No pending songs to review. You're all caught up.
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

    blob: {
        position: 'absolute', width: 260, height: 260, borderRadius: 130,
        top: -60, right: -80, opacity: 0.40,
    },

    header: { paddingTop: 22, paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 0.5 },
    headerEyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 4 },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
    headerTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
    pendingBadge: {
        paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 12, borderWidth: 1,
    },
    pendingBadgeText: { fontSize: 12, fontWeight: '700' },
    headerSub: { fontSize: 13 },

    listContainer: { padding: 18, paddingBottom: 60 },

    // Card
    card: {
        borderRadius: 22, borderWidth: 1, padding: 16, marginBottom: 14,
        shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.10, shadowRadius: 18, elevation: 6,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    cardIconWrap: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
    artist: { fontSize: 13, marginTop: 2 },
    categoryBadge: {
        paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 10, borderWidth: 1,
    },
    categoryText: { fontSize: 11, fontWeight: '700' },

    lyricsBox: {
        borderRadius: 12, padding: 12, marginBottom: 14,
    },
    lyricsPreview: { fontSize: 13, fontStyle: 'italic', lineHeight: 19 },

    buttonRow: { flexDirection: 'row', gap: 10 },
    actionButton: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 12, borderRadius: 13, borderWidth: 1, gap: 7,
    },
    rejectButton: {},
    buttonText: { fontWeight: '700', fontSize: 14 },

    // Empty
    emptyContainer: { alignItems: 'center', marginTop: 90, paddingHorizontal: 40 },
    emptyIconWrap: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 18, borderWidth: 1 },
    emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
    emptyText: { textAlign: 'center', fontSize: 15, lineHeight: 22 },
});