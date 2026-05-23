import React, { useState, useCallback, useEffect } from 'react';
import {
    StyleSheet, Text, View, TouchableOpacity, ActivityIndicator,
    Alert, ScrollView, RefreshControl, Modal, TextInput, Image, Linking, Share
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from './supabase';
import { useTheme } from '../context/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';

export default function ProfileScreen({ navigation }) {
    const { colors, theme } = useTheme();
    const [user, setUser] = useState(null);
    const [contributionCount, setContributionCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [isAboutModalVisible, setAboutModalVisible] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [avatarBase64, setAvatarBase64] = useState(null);
    const [savingProfile, setSavingProfile] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const getUser = async () => {
                const { data: { session } } = await supabase.auth.getSession();
                const currentUser = session?.user || null;
                if (currentUser) {
                    setUser(currentUser);
                    setDisplayName(currentUser.user_metadata?.display_name || '');
                    setAvatarBase64(currentUser.user_metadata?.avatar_base64 || null);
                    fetchContributions(currentUser.id);
                } else {
                    navigation.reset({ index: 1, routes: [{ name: 'MainApp' }, { name: 'Auth' }] });
                }
            };
            getUser();
        }, [])
    );

    const fetchContributions = async (userId) => {
        const { count, error } = await supabase.from('songs').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'approved');
        if (!error) setContributionCount(count || 0);
        setLoading(false);
    };

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.2, base64: true });
        if (!result.canceled && result.assets && result.assets.length > 0) {
            setAvatarBase64(`data:image/jpeg;base64,${result.assets[0].base64}`);
        }
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        setSavingProfile(true);
        const { data, error } = await supabase.auth.updateUser({ data: { display_name: displayName, avatar_base64: avatarBase64 } });
        setSavingProfile(false);
        if (error) Alert.alert('Error', error.message);
        else { setUser(data.user); setEditModalVisible(false); }
    };

    const handleShareApp = async () => {
        try { await Share.share({ message: 'Check out LyricMate, an amazing app for Islamic song lyrics! Download it here: https://github.com/tabsoftwarecreations/LyricMate/releases/download/v1.0.0/lyricmate.apk' }); }
        catch (error) { console.log(error.message); }
    };

    const handleFeedback = () => { Linking.openURL('mailto:tabsoftwarecreations@gmail.com?subject=LyricMate Feedback'); };
    const handleAboutUs = () => {
        setAboutModalVisible(true);
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        if (user) await fetchContributions(user.id);
        setRefreshing(false);
    }, [user]);

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) Alert.alert('Error', error.message);
        else { navigation.reset({ index: 1, routes: [{ name: 'MainApp' }, { name: 'Auth' }] }); }
    };

    const displayNameValue = user?.user_metadata?.display_name;
    const avatarUri = user?.user_metadata?.avatar_base64;
    const initials = (displayNameValue || user?.email || '?').charAt(0).toUpperCase();
    const isContributor = contributionCount > 0;

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const MenuRow = ({ icon, iconBg, label, onPress, chevron = true, textColor, sublabel }) => (
        <TouchableOpacity style={[styles.menuRow, { borderBottomColor: colors.innerBorder }]} onPress={onPress} activeOpacity={0.65}>
            <View style={[styles.menuIcon, { backgroundColor: iconBg || colors.badge }]}>
                <Ionicons name={icon} size={17} color={textColor || colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.menuLabel, { color: textColor || colors.text }]}>{label}</Text>
                {sublabel && <Text style={[styles.menuSublabel, { color: colors.secondaryText }]}>{sublabel}</Text>}
            </View>
            {chevron && <Ionicons name="chevron-forward" size={15} color={colors.secondaryText} />}
        </TouchableOpacity>
    );

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
        >
            <StatusBar style={theme === 'dark' ? "light" : "dark"} />

            {/* Ambient glow blobs */}
            <View style={[styles.blobA, { backgroundColor: colors.blobA }]} />
            <View style={[styles.blobB, { backgroundColor: colors.blobB }]} />

            {/* Header */}
            <View style={styles.pageHeader}>
                <Text style={[styles.pageTitle, { color: colors.text }]}>Profile</Text>
            </View>

            {/* Hero Card — Liquid Glass */}
            <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}>
                {/* Avatar */}
                <TouchableOpacity
                    onPress={() => { setDisplayName(displayNameValue || ''); setAvatarBase64(avatarUri || null); setEditModalVisible(true); }}
                    style={styles.avatarWrapper}
                    activeOpacity={0.8}
                >
                    {avatarUri ? (
                        <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                    ) : (
                        <View style={[styles.avatarCircle, { backgroundColor: colors.primary, shadowColor: colors.primaryGlow }]}>
                            <Text style={styles.avatarText}>{initials}</Text>
                        </View>
                    )}
                    <View style={[styles.editBadge, { backgroundColor: colors.primary, borderColor: colors.cardSolid }]}>
                        <Ionicons name="pencil" size={11} color="#FFF" />
                    </View>
                </TouchableOpacity>

                <Text style={[styles.profileName, { color: colors.text }]}>{displayNameValue || user?.email?.split('@')[0]}</Text>
                <Text style={[styles.profileEmail, { color: colors.secondaryText }]}>{user?.email}</Text>

                {/* Role Badge */}
                <View style={[styles.roleBadge, { backgroundColor: isContributor ? 'rgba(79,142,247,0.14)' : colors.badge, borderColor: isContributor ? colors.borderSubtle : colors.innerBorder }]}>
                    <Ionicons name={isContributor ? "ribbon" : "musical-note"} size={13} color={colors.primary} style={{ marginRight: 5 }} />
                    <Text style={[styles.roleBadgeText, { color: colors.primary }]}>{isContributor ? 'Contributor' : 'Listener'}</Text>
                </View>

                {/* Stats Row */}
                <View style={[styles.statsRow, { borderTopColor: colors.innerBorder }]}>
                    <View style={styles.statItem}>
                        <View style={[styles.statIcon, { backgroundColor: 'rgba(251, 191, 36, 0.14)' }]}>
                            <Ionicons name="trophy" size={18} color="#FBBF24" />
                        </View>
                        <Text style={[styles.statValue, { color: colors.text }]}>{contributionCount}</Text>
                        <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Approved</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: colors.innerBorder }]} />
                    <View style={styles.statItem}>
                        <View style={[styles.statIcon, { backgroundColor: 'rgba(52, 211, 153, 0.14)' }]}>
                            <Ionicons name="checkmark-done-circle" size={18} color="#34D399" />
                        </View>
                        <Text style={[styles.statValue, { color: colors.text }]}>{isContributor ? '✓' : '—'}</Text>
                        <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Verified</Text>
                    </View>
                </View>
            </View>

            {/* Community Section */}
            <Text style={[styles.sectionLabel, { color: colors.secondaryText }]}>COMMUNITY</Text>
            <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}>
                <MenuRow icon="share-social-outline" label="Share App" sublabel="Spread the love" onPress={handleShareApp} />
                <MenuRow icon="chatbubbles-outline" label="Send Feedback" sublabel="tabsoftwarecreations@gmail.com" onPress={handleFeedback} />
                <MenuRow icon="information-circle-outline" label="About LyricMate" sublabel="Version 1.0.0" onPress={handleAboutUs} chevron={false} />
            </View>

            {/* Account Section */}
            <Text style={[styles.sectionLabel, { color: colors.secondaryText }]}>ACCOUNT</Text>
            <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}>
                <MenuRow icon="settings-outline" label="App Settings" sublabel="Theme, font size, language" onPress={() => navigation.navigate('Settings')} />
                <MenuRow
                    icon="log-out-outline"
                    iconBg="rgba(251,113,133,0.12)"
                    label="Log Out"
                    textColor={colors.danger}
                    onPress={handleSignOut}
                    chevron={false}
                />
            </View>

            {/* Edit Profile Modal */}
            <Modal visible={isEditModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalSheet, { backgroundColor: colors.cardSolid, borderColor: colors.border }]}>
                        <View style={[styles.modalHandle, { backgroundColor: colors.secondaryText }]} />
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Profile</Text>

                        <TouchableOpacity onPress={handlePickImage} style={styles.avatarPickerContainer} activeOpacity={0.8}>
                            {avatarBase64 ? (
                                <Image source={{ uri: avatarBase64 }} style={styles.modalAvatar} />
                            ) : (
                                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
                                    <Ionicons name="camera" size={28} color={colors.primary} />
                                </View>
                            )}
                            <View style={[styles.cameraOverlay, { backgroundColor: colors.primary, borderColor: colors.cardSolid }]}>
                                <Ionicons name="camera" size={13} color="#FFF" />
                            </View>
                        </TouchableOpacity>
                        <Text style={[styles.changePhotoLabel, { color: colors.primary }]}>Change Photo</Text>

                        <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Ionicons name="person-outline" size={20} color={colors.secondaryText} style={{ marginRight: 12 }} />
                            <TextInput
                                style={[styles.modalInput, { color: colors.text }]}
                                value={displayName}
                                onChangeText={setDisplayName}
                                placeholder="Enter display name"
                                placeholderTextColor={colors.secondaryText}
                            />
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                                onPress={() => setEditModalVisible(false)}
                            >
                                <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: colors.primary, borderColor: 'transparent' }]}
                                onPress={handleSaveProfile}
                            >
                                {savingProfile
                                    ? <ActivityIndicator color="#FFF" size="small" />
                                    : <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Save</Text>
                                }
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* About Us Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isAboutModalVisible}
                onRequestClose={() => setAboutModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalSheet, { backgroundColor: colors.cardSolid, borderColor: colors.innerBorder, minHeight: 460 }]}>
                        <View style={styles.modalHandle} />
                        <Text style={[styles.modalTitle, { color: colors.text }]}>About LyricMate</Text>
                        
                        <View style={{ alignItems: 'center', marginBottom: 24 }}>
                            <Image 
                                source={require('../assets/icon.png')} 
                                style={{ width: 90, height: 90, borderRadius: 22, marginBottom: 16 }} 
                            />
                            <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>LyricMate</Text>
                            <Text style={{ fontSize: 13, color: colors.secondaryText, marginTop: 4 }}>Version 1.0.0</Text>
                        </View>

                        <Text style={{ fontSize: 14, color: colors.text, textAlign: 'center', lineHeight: 22, marginBottom: 24, paddingHorizontal: 10 }}>
                            LyricMate is a community-driven app for beautiful, transliterated Islamic song lyrics. Built with passion to help performers and singers globally.
                        </Text>

                        <View style={{ borderTopWidth: 0.5, borderColor: colors.innerBorder, paddingTop: 16, marginBottom: 24 }}>
                            <Text style={{ fontSize: 12, color: colors.secondaryText, textAlign: 'center' }}>
                                © 2026 Tab Software Creations
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.modalBtn, { backgroundColor: colors.primary, borderColor: 'transparent', width: '100%', paddingVertical: 15 }]}
                            onPress={() => setAboutModalVisible(false)}
                        >
                            <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingHorizontal: 18, paddingTop: 58, paddingBottom: 120 },

    // Ambient blobs
    blobA: {
        position: 'absolute', width: 260, height: 260, borderRadius: 130,
        top: -60, right: -80, opacity: 0.55,
        transform: [{ scaleX: 1.3 }],
    },
    blobB: {
        position: 'absolute', width: 200, height: 200, borderRadius: 100,
        top: 200, left: -70, opacity: 0.45,
    },

    pageHeader: { marginBottom: 22 },
    pageTitle: { fontSize: 32, fontWeight: '800', letterSpacing: -0.8 },

    // Hero Card
    heroCard: {
        borderRadius: 28, borderWidth: 1,
        paddingHorizontal: 24, paddingTop: 28, paddingBottom: 20,
        alignItems: 'center', marginBottom: 28,
        shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 8,
    },
    avatarWrapper: { position: 'relative', marginBottom: 14 },
    avatarImage: { width: 88, height: 88, borderRadius: 44 },
    avatarCircle: {
        width: 88, height: 88, borderRadius: 44,
        justifyContent: 'center', alignItems: 'center',
        shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 10,
    },
    avatarText: { color: '#FFF', fontSize: 34, fontWeight: '800' },
    editBadge: {
        position: 'absolute', bottom: 0, right: 0,
        width: 26, height: 26, borderRadius: 13,
        justifyContent: 'center', alignItems: 'center', borderWidth: 2,
    },
    profileName: { fontSize: 21, fontWeight: '700', letterSpacing: -0.4, marginBottom: 4 },
    profileEmail: { fontSize: 13, marginBottom: 12 },
    roleBadge: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 12, paddingVertical: 5,
        borderRadius: 20, borderWidth: 1, marginBottom: 20,
    },
    roleBadgeText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },
    statsRow: {
        flexDirection: 'row', width: '100%',
        borderTopWidth: 0.5, paddingTop: 18,
        justifyContent: 'center',
    },
    statItem: { flex: 1, alignItems: 'center' },
    statIcon: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 7 },
    statValue: { fontSize: 15, fontWeight: '800', marginBottom: 2 },
    statLabel: { fontSize: 11, fontWeight: '500' },
    statDivider: { width: 1, marginHorizontal: 12, height: '75%', alignSelf: 'center' },

    // Section label
    sectionLabel: {
        fontSize: 11, fontWeight: '700', letterSpacing: 1.2,
        marginBottom: 10, marginLeft: 4,
    },

    // Menu card
    menuCard: {
        borderRadius: 22, borderWidth: 1, overflow: 'hidden', marginBottom: 22,
        shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4,
    },
    menuRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 14, paddingHorizontal: 16,
        borderBottomWidth: 0.5,
    },
    menuIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
    menuLabel: { fontSize: 15, fontWeight: '600' },
    menuSublabel: { fontSize: 12, marginTop: 1 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.60)', justifyContent: 'flex-end' },
    modalSheet: {
        borderTopLeftRadius: 32, borderTopRightRadius: 32,
        borderWidth: 1, borderBottomWidth: 0,
        padding: 24, paddingTop: 12, minHeight: 430,
    },
    modalHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 22, opacity: 0.35 },
    modalTitle: { fontSize: 19, fontWeight: '700', textAlign: 'center', marginBottom: 24 },
    avatarPickerContainer: { alignItems: 'center', position: 'relative', width: 90, alignSelf: 'center', marginBottom: 6 },
    modalAvatar: { width: 90, height: 90, borderRadius: 45 },
    avatarPlaceholder: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderStyle: 'dashed' },
    cameraOverlay: { position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
    changePhotoLabel: { fontSize: 13, fontWeight: '600', textAlign: 'center', marginBottom: 24 },
    inputRow: {
        flexDirection: 'row', alignItems: 'center',
        borderWidth: 1, borderRadius: 16,
        paddingHorizontal: 16, marginBottom: 24,
    },
    modalInput: { flex: 1, paddingVertical: 15, fontSize: 16 },
    modalButtons: { flexDirection: 'row', gap: 12 },
    modalBtn: { flex: 1, paddingVertical: 15, borderRadius: 16, alignItems: 'center', borderWidth: 1 },
    modalBtnText: { fontSize: 15, fontWeight: '700' },
});