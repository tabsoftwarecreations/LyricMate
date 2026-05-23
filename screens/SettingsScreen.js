import React from 'react';
import {
    View, Text, StyleSheet, Switch, TouchableOpacity,
    Alert, ScrollView
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../context/ThemeContext';
import { supabase } from './supabase';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function SettingsScreen({ navigation }) {
    const { theme, toggleTheme, fontSize, updateFontSize, changeFontSize, readingLanguage, updateReadingLanguage, colors } = useTheme();

    const handleDeleteAccount = () => {
        Alert.alert("Delete Account", "Are you sure you want to permanently delete your account? This action cannot be undone.", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete Forever", style: "destructive",
                onPress: async () => {
                    const { data: { session } } = await supabase.auth.getSession();
                    const user = session?.user || null;
                    if (user) {
                        const { error } = await supabase.auth.admin.deleteUser(user.id);
                        if (error) Alert.alert("Error", error.message);
                        else { await supabase.auth.signOut(); navigation.replace('Auth'); }
                    }
                }
            }
        ]);
    };

    const SectionLabel = ({ title }) => (
        <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>{title}</Text>
    );

    const RowItem = ({ icon, label, children, noBorder }) => (
        <View style={[styles.rowItem, { borderBottomColor: colors.innerBorder, borderBottomWidth: noBorder ? 0 : 0.5 }]}>
            <View style={styles.rowLeft}>
                <View style={[styles.rowIcon, { backgroundColor: colors.badge }]}>
                    <Ionicons name={icon} size={17} color={colors.primary} />
                </View>
                <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
            </View>
            {children}
        </View>
    );

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 80 }}
        >
            <StatusBar style={theme === 'dark' ? "light" : "dark"} />

            {/* Ambient glow blobs */}
            <View style={[styles.blobA, { backgroundColor: colors.blobA }]} />

            {/* ─── Appearance ─── */}
            <SectionLabel title="APPEARANCE" />
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}>
                <RowItem icon="moon-outline" label="Dark Mode" noBorder>
                    <Switch
                        value={theme === 'dark'}
                        onValueChange={toggleTheme}
                        trackColor={{ false: '#C7C7CC', true: colors.primary }}
                        thumbColor="#FFFFFF"
                        ios_backgroundColor="#C7C7CC"
                    />
                </RowItem>
            </View>

            {/* ─── Lyrics Display ─── */}
            <SectionLabel title="LYRICS DISPLAY" />
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}>

                {/* Font Size */}
                <View style={[styles.blockItem, { borderBottomColor: colors.innerBorder }]}>
                    <View style={styles.rowLeft}>
                        <View style={[styles.rowIcon, { backgroundColor: colors.badge }]}>
                            <Ionicons name="text-outline" size={17} color={colors.primary} />
                        </View>
                        <Text style={[styles.rowLabel, { color: colors.text }]}>Font Size</Text>
                        <View style={[styles.valuePill, { backgroundColor: colors.primarySoft }]}>
                            <Text style={[styles.valuePillText, { color: colors.primary }]}>{fontSize}px</Text>
                        </View>
                    </View>

                    {/* Live preview */}
                    <View style={[styles.previewBox, { backgroundColor: colors.innerBorder, borderColor: colors.border }]}>
                        <Text style={{ fontSize, color: colors.text, textAlign: 'center', lineHeight: fontSize * 1.4 }} numberOfLines={2}>
                            Hello · ഹലോ · ನಮಸ್ಕಾರ
                        </Text>
                    </View>

                    <Slider
                        style={{ width: '100%', height: 36, marginTop: 6 }}
                        minimumValue={12}
                        maximumValue={40}
                        step={1}
                        value={fontSize}
                        onValueChange={changeFontSize || updateFontSize}
                        minimumTrackTintColor={colors.primary}
                        maximumTrackTintColor={colors.innerBorder}
                        thumbTintColor={colors.primary}
                    />
                    <View style={styles.sliderLabels}>
                        <Text style={[styles.sliderLabel, { color: colors.secondaryText }]}>Small</Text>
                        <Text style={[styles.sliderLabel, { color: colors.secondaryText }]}>Large</Text>
                    </View>
                </View>

                {/* Preferred Language */}
                <View style={[styles.blockItem, { borderBottomWidth: 0 }]}>
                    <View style={styles.rowLeft}>
                        <View style={[styles.rowIcon, { backgroundColor: colors.badge }]}>
                            <Ionicons name="language-outline" size={17} color={colors.primary} />
                        </View>
                        <Text style={[styles.rowLabel, { color: colors.text }]}>Default Script</Text>
                    </View>
                    <View style={[styles.pickerContainer, { backgroundColor: colors.background, borderColor: colors.innerBorder }]}>
                        <Picker
                            selectedValue={readingLanguage}
                            onValueChange={updateReadingLanguage}
                            style={{ color: colors.text }}
                            dropdownIconColor={colors.primary}
                        >
                            <Picker.Item label="English (Default)" value="English" />
                            <Picker.Item label="Malayalam" value="Malayalam" />
                            <Picker.Item label="Kannada" value="Kannada" />
                        </Picker>
                    </View>
                    <Text style={[styles.helpText, { color: colors.secondaryText }]}>
                        Lyrics will open in this script by default.
                    </Text>
                </View>
            </View>

            {/* ─── Account ─── */}
            <SectionLabel title="ACCOUNT" />
            <TouchableOpacity
                style={[styles.dangerCard, {
                    backgroundColor: 'rgba(251,113,133,0.07)',
                    borderColor: 'rgba(251,113,133,0.22)',
                    shadowColor: colors.danger,
                }]}
                onPress={handleDeleteAccount}
                activeOpacity={0.70}
            >
                <View style={[styles.dangerIcon, { backgroundColor: 'rgba(251,113,133,0.12)' }]}>
                    <Ionicons name="trash-outline" size={17} color={colors.danger} />
                </View>
                <Text style={[styles.dangerText, { color: colors.danger }]}>Delete Account</Text>
                <Ionicons name="chevron-forward" size={15} color={colors.danger} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 18 },

    // Ambient blob
    blobA: {
        position: 'absolute', width: 280, height: 280, borderRadius: 140,
        top: -60, right: -100, opacity: 0.40,
    },

    sectionTitle: {
        fontSize: 11, fontWeight: '700', letterSpacing: 1.2,
        marginTop: 28, marginBottom: 10, marginLeft: 4,
    },
    card: {
        borderRadius: 22, borderWidth: 1, overflow: 'hidden',
        shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.09, shadowRadius: 14, elevation: 4,
    },
    rowItem: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', paddingVertical: 15, paddingHorizontal: 16,
    },
    blockItem: {
        paddingVertical: 15, paddingHorizontal: 16, borderBottomWidth: 0.5,
    },
    rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    rowIcon: { width: 32, height: 32, borderRadius: 9, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    rowLabel: { fontSize: 15, fontWeight: '600' },
    valuePill: { marginLeft: 8, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 10 },
    valuePillText: { fontSize: 12, fontWeight: '800' },
    previewBox: {
        marginTop: 14, borderRadius: 14, borderWidth: 1,
        paddingVertical: 16, paddingHorizontal: 14,
        alignItems: 'center', justifyContent: 'center', minHeight: 64,
    },
    sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4, marginTop: -2 },
    sliderLabel: { fontSize: 11, fontWeight: '500' },
    pickerContainer: { borderRadius: 13, borderWidth: 1, overflow: 'hidden', marginTop: 12 },
    helpText: { fontSize: 12, marginTop: 8, fontStyle: 'italic', marginLeft: 44, lineHeight: 16 },
    dangerCard: {
        flexDirection: 'row', alignItems: 'center',
        padding: 16, borderRadius: 22, borderWidth: 1,
        shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 3,
    },
    dangerIcon: { width: 32, height: 32, borderRadius: 9, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    dangerText: { fontSize: 15, fontWeight: '600' },
});