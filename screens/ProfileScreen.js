import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from './supabase';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

export default function ProfileScreen({ navigation }) {
    const { colors, theme } = useTheme();
    const [user, setUser] = useState(null);
    const [contributionCount, setContributionCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                fetchContributions(user.id);
            } else {
                navigation.replace('Auth');
            }
        };
        getUser();
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (user) {
                fetchContributions(user.id);
            }
        }, [user])
    );

    const fetchContributions = async (userId) => {
        const { count, error } = await supabase
            .from('songs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'approved');

        if (error) {
            console.error('Error fetching contributions:', error);
        } else {
            setContributionCount(count || 0);
        }
        setLoading(false);
    };

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            Alert.alert('Error', error.message);
        } else {
            navigation.replace('Auth');
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.profileHeader}>
                <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
                    <Text style={styles.avatarText}>{user?.email?.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={[styles.emailText, { color: colors.text }]}>{user?.email}</Text>
                <Text style={[styles.usernameText, { color: colors.secondaryText }]}>@{user?.email?.split('@')[0]}</Text>
            </View>

            <View style={[styles.statsContainer, { backgroundColor: colors.card }]}>
                <View style={styles.statItem}>
                    <View style={styles.badgeIcon}>
                        <Ionicons name="trophy" size={32} color="#F59E0B" />
                    </View>
                    <Text style={[styles.statValue, { color: colors.text }]}>{contributionCount}</Text>
                    <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Approved Contributions</Text>
                </View>
            </View>

            <View style={styles.infoSection}>
                <Text style={[styles.infoTitle, { color: colors.primary }]}>Why Contribute?</Text>
                <Text style={[styles.infoText, { color: colors.text }]}>
                    Every approved lyric helps performers around the world. Keep contributing to earn higher ranks!
                </Text>
            </View>

            <View style={styles.actionSection}>
                <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]} 
                    onPress={() => navigation.navigate('Settings')}
                >
                    <Ionicons name="settings-outline" size={20} color={colors.text} />
                    <Text style={[styles.actionButtonText, { color: colors.text }]}>App Settings</Text>
                    <Ionicons name="chevron-forward" size={18} color={colors.secondaryText} style={{ marginLeft: 'auto' }} />
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.signOutButton, { borderColor: '#EF4444' }]} 
                    onPress={handleSignOut}
                >
                    <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                    <Text style={styles.signOutText}>Log Out</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    profileHeader: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: 'bold',
    },
    emailText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    usernameText: {
        fontSize: 14,
        marginTop: 5,
    },
    statsContainer: {
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    statItem: {
        alignItems: 'center',
    },
    badgeIcon: {
        marginBottom: 10,
    },
    statValue: {
        fontSize: 36,
        fontWeight: '900',
    },
    statLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 5,
    },
    infoSection: {
        padding: 20,
        marginBottom: 20,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    infoText: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
    },
    actionSection: {
        marginTop: 'auto',
        marginBottom: 20,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 12,
    },
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
    },
    signOutText: {
        color: '#EF4444',
        fontWeight: 'bold',
        marginLeft: 10,
    }
});