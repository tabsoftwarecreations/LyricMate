import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    TouchableOpacity, 
    Alert, 
    TextInput, 
    ScrollView, 
    Platform,
    ActivityIndicator 
} from 'react-native';
import { supabase } from './supabase';
import { Ionicons } from '@expo/vector-icons';

export default function AdminScreen({ navigation }) {
    const [pendingSongs, setPendingSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [editingSong, setEditingSong] = useState(null);

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                // Admin check: specific email or guru
                if (user && (user.email === 'admin@lyricmate.com' || user.email.includes('guru'))) {
                    setIsAdmin(true);
                    fetchPendingSongs();
                } else {
                    setIsAdmin(false);
                }
            } catch (error) {
                console.error("Admin check failed:", error);
            } finally {
                setLoading(false);
            }
        };
        checkAdmin();
    }, []);

    const fetchPendingSongs = async () => {
        setLoading(true);
        // Use 'id' for sorting as 'created_at' might be missing in some schemas
        const { data, error } = await supabase
            .from('songs')
            .select('*')
            .eq('status', 'pending')
            .order('id', { ascending: false });
        
        if (error) {
            console.error("Error fetching songs:", error);
            // Fallback: try without order
            const { data: dataNoOrder } = await supabase
                .from('songs')
                .select('*')
                .eq('status', 'pending');
            setPendingSongs(dataNoOrder || []);
        } else {
            setPendingSongs(data || []);
        }
        setLoading(false);
    };

    const handleAction = async (id, status) => {
        const { error } = await supabase
            .from('songs')
            .update({ status: status })
            .eq('id', id);

        if (error) {
            Alert.alert("Error", error.message);
        } else {
            setPendingSongs(prev => prev.filter(s => s.id !== id));
            Alert.alert("Success", `Song ${status === 'approved' ? 'Approved' : 'Rejected'}`);
        }
    };

    const handleSaveEdit = async () => {
        if (!editingSong) return;
        const { error } = await supabase
            .from('songs')
            .update({ 
                title: editingSong.title,
                artist: editingSong.artist,
                lyrics: editingSong.lyrics,
                transliterations: editingSong.transliterations 
            })
            .eq('id', editingSong.id);

        if (error) {
            Alert.alert("Error", error.message);
        } else {
            setEditingSong(null);
            fetchPendingSongs();
            Alert.alert("Success", "Changes saved.");
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#166534" />
                <Text style={{ marginTop: 10 }}>Verifying Credentials...</Text>
            </View>
        );
    }

    if (!isAdmin) {
        return (
            <View style={styles.centered}>
                <Ionicons name="lock-closed" size={64} color="#DC2626" />
                <Text style={styles.errorText}>Access Denied</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('MainApp')}>
                    <Text style={styles.backButtonText}>Return to App</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Admin Dashboard</Text>
                <TouchableOpacity onPress={() => navigation.navigate('MainApp')}>
                    <Ionicons name="exit-outline" size={24} color="#FFF" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {editingSong ? (
                    <ScrollView style={styles.editorContainer}>
                        <Text style={styles.sectionTitle}>Edit Submission</Text>
                        
                        <Text style={styles.label}>Title</Text>
                        <TextInput 
                            style={styles.input} 
                            value={editingSong.title}
                            onChangeText={t => setEditingSong({...editingSong, title: t})}
                        />

                        <Text style={styles.label}>Artist</Text>
                        <TextInput 
                            style={styles.input} 
                            value={editingSong.artist}
                            onChangeText={t => setEditingSong({...editingSong, artist: t})}
                        />

                        <Text style={styles.label}>Lyrics</Text>
                        <TextInput 
                            style={[styles.input, styles.textArea]} 
                            multiline 
                            value={editingSong.lyrics}
                            onChangeText={t => setEditingSong({...editingSong, lyrics: t})}
                        />

                        <Text style={styles.label}>Transliteration</Text>
                        <TextInput 
                            style={[styles.input, styles.textArea]} 
                            multiline 
                            value={editingSong.transliterations || ''}
                            onChangeText={t => setEditingSong({...editingSong, transliterations: t})}
                        />

                        <View style={styles.editorActions}>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveEdit}>
                                <Text style={styles.btnText}>Save & Update</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingSong(null)}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                ) : (
                    <FlatList
                        data={pendingSongs}
                        keyExtractor={item => item.id.toString()}
                        ListHeaderComponent={<Text style={styles.sectionTitle}>Pending Approvals ({pendingSongs.length})</Text>}
                        renderItem={({ item }) => (
                            <View style={styles.songRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.songTitle}>{item.title}</Text>
                                    <Text style={styles.songArtist}>{item.artist} | {item.category}</Text>
                                </View>
                                <View style={styles.rowActions}>
                                    <TouchableOpacity style={styles.actionIcon} onPress={() => setEditingSong(item)}>
                                        <Ionicons name="pencil" size={22} color="#2563EB" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.actionIcon} onPress={() => handleAction(item.id, 'approved')}>
                                        <Ionicons name="checkmark-circle" size={24} color="#059669" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.actionIcon} onPress={() => handleAction(item.id, 'rejected')}>
                                        <Ionicons name="trash" size={24} color="#DC2626" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Ionicons name="happy-outline" size={48} color="#9CA3AF" />
                                <Text style={styles.emptyText}>All caught up! No pending songs.</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    header: { 
        height: 70, 
        backgroundColor: '#166534', 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: 20,
    },
    headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
    content: { flex: 1, padding: 20 },
    sectionTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#111827' },
    songRow: { 
        backgroundColor: '#FFF', 
        padding: 20, 
        borderRadius: 12, 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
            web: {
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }
        })
    },
    songTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
    songArtist: { fontSize: 14, color: '#6B7280', marginTop: 4 },
    rowActions: { flexDirection: 'row', alignItems: 'center' },
    actionIcon: { marginLeft: 15 },
    errorText: { fontSize: 24, fontWeight: 'bold', color: '#DC2626', marginTop: 20 },
    backButton: { marginTop: 30, backgroundColor: '#166534', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
    backButtonText: { color: '#FFF', fontWeight: 'bold' },
    editorContainer: { backgroundColor: '#FFF', padding: 20, borderRadius: 12 },
    label: { fontSize: 14, fontWeight: 'bold', color: '#374151', marginBottom: 5, marginTop: 15 },
    input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, fontSize: 16, color: '#111827' },
    textArea: { minHeight: 150, textAlignVertical: 'top' },
    editorActions: { flexDirection: 'row', marginTop: 30, marginBottom: 50 },
    saveBtn: { backgroundColor: '#166534', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 8, flex: 2, alignItems: 'center' },
    cancelBtn: { paddingVertical: 14, paddingHorizontal: 24, flex: 1, alignItems: 'center' },
    btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    cancelBtnText: { color: '#DC2626', fontWeight: 'bold' },
    emptyState: { alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 15, fontSize: 16, color: '#9CA3AF' }
});
