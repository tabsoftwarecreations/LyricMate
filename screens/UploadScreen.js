import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from './supabase';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function UploadScreen({ navigation }) {
    const { colors, theme } = useTheme();
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [lyrics, setLyrics] = useState('');
    const [category, setCategory] = useState('Malayalam');
    const [loading, setLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // ==========================================
    // THE UPLOAD GATEKEEPER
    // ==========================================
    useFocusEffect(
        useCallback(() => {
            checkAuth();
        }, [])
    );

    const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setIsAuthenticated(false);
            // Bounce to Home, then open Auth to prevent infinite loops
            navigation.navigate('Home');
            navigation.navigate('Auth');
        } else {
            setIsAuthenticated(true);
        }
    };

    const generateTransliteration = async (lyrics, lang) => {
        const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
        console.log("🔑 Using API Key (first 5):", GEMINI_API_KEY?.substring(0, 5));

        const prompt = `Transliterate the following ${lang} lyrics into English phonetics. Return ONLY the transliterated text without any conversational filler or extra notes:\n\n${lyrics}`;

        try {
            console.log("📡 Sending request to Gemini...");
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("❌ Gemini API Error Status:", response.status, errorData);
                return null;
            }

            const data = await response.json();
            console.log("📦 Gemini Response Received:", JSON.stringify(data).substring(0, 200));

            if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
                const result = data.candidates[0].content.parts[0].text.trim();
                console.log("✅ Transliteration successful (length):", result.length);
                return result;
            }
            console.error("❌ Gemini response missing content:", data);
            return null;
        } catch (error) {
            console.error("❌ Gemini Error:", error);
            return null;
        }
    };

    const handleUpload = async () => {
        if (!title || !artist || !lyrics) {
            Alert.alert('Missing Fields', 'Please fill in all fields.');
            return;
        }

        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setLoading(false);
            navigation.navigate('Profile');
            return;
        }

        try {
            console.log("🤖 Generating AI Transliteration...");
            const transliterations = await generateTransliteration(lyrics, category);

            console.log("💾 Saving to database...");
            const { error: dbError } = await supabase
                .from('songs')
                .insert([{
                    title,
                    artist,
                    lyrics,
                    category,
                    status: 'pending',
                    user_id: user.id,
                    transliterations
                }]);

            if (dbError) throw dbError;

            Alert.alert(
                'Submitted! ⏳',
                'Your lyrics have been sent for Admin approval.',
                [{
                    text: "Awesome!", onPress: () => {
                        setTitle(''); setArtist(''); setLyrics('');
                        navigation.navigate('Home');
                    }
                }]
            );

        } catch (error) {
            console.error("Upload Error:", error);
            Alert.alert('Upload Failed', 'Something went wrong while saving your contribution.');
        } finally {
            setLoading(false);
        }
    };

    // --- FALLBACK UI ---
    if (!isAuthenticated) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="lock-closed" size={64} color={colors.primary} />
                <Text style={{ color: colors.text, marginTop: 20, fontSize: 18, marginBottom: 20 }}>Please log in to continue</Text>

                <TouchableOpacity
                    style={{ backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 }}
                    onPress={() => navigation.navigate('Auth')}
                >
                    <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>Go to Login</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // --- MAIN RENDER ---
    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={theme === 'dark' ? "light" : "dark"} />
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <Text style={[styles.headerTitle, { color: colors.primary }]}>Upload Lyrics</Text>
                <Text style={[styles.headerSubtitle, { color: colors.secondaryText }]}>Contribute to the master collection</Text>
            </View>

            <View style={styles.formContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Song Title</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                    placeholder="e.g. Kun Anta"
                    placeholderTextColor={colors.secondaryText}
                    value={title}
                    onChangeText={setTitle}
                />

                <Text style={[styles.label, { color: colors.text }]}>Artist / Singer</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                    placeholder="e.g. Humood AlKhudher"
                    placeholderTextColor={colors.secondaryText}
                    value={artist}
                    onChangeText={setArtist}
                />

                <Text style={[styles.label, { color: colors.text }]}>Category</Text>
                <View style={[styles.pickerContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Picker
                        selectedValue={category}
                        onValueChange={(itemValue) => setCategory(itemValue)}
                        style={[styles.picker, { color: colors.text }]}
                        dropdownIconColor={colors.primary}
                    >
                        <Picker.Item label="Malayalam" value="Malayalam" />
                        <Picker.Item label="English" value="English" />
                        <Picker.Item label="Kannada" value="Kannada" />
                        <Picker.Item label="Urdu" value="Urdu" />
                        <Picker.Item label="Mappila Patt" value="Mappila Patt" />
                        <Picker.Item label="Mashup" value="Mashup" />
                    </Picker>
                </View>

                <Text style={[styles.label, { color: colors.text }]}>Lyrics</Text>
                <TextInput
                    style={[styles.input, styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                    placeholder="Paste the full lyrics here..."
                    placeholderTextColor={colors.secondaryText}
                    value={lyrics}
                    onChangeText={setLyrics}
                    multiline
                    numberOfLines={10}
                    textAlignVertical="top"
                />

                <TouchableOpacity
                    style={[styles.submitButton, { backgroundColor: colors.primary }]}
                    onPress={handleUpload}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Submit for Approval</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

// Ensure styles are OUTSIDE the main function!
const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1 },
    headerTitle: { fontSize: 28, fontWeight: 'bold' },
    headerSubtitle: { fontSize: 16, marginTop: 4 },
    formContainer: { padding: 20, paddingBottom: 100 },
    label: { fontSize: 16, fontWeight: '600', marginBottom: 8, marginTop: 15 },
    input: { borderWidth: 1, borderRadius: 12, padding: 15, fontSize: 16 },
    pickerContainer: { borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
    picker: { height: 55, width: '100%' },
    textArea: { minHeight: 200 },
    submitButton: { paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
    submitButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }
});