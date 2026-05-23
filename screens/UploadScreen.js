import React, { useState, useCallback, useRef } from 'react';
import {
    StyleSheet, Text, View, TextInput, TouchableOpacity,
    Alert, ScrollView, ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase, safeInsertSong } from './supabase';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES = [
    { label: 'Malayalam', value: 'Malayalam', color: '#4F8EF7' },
    { label: 'English', value: 'English', color: '#06B6D4' },
    { label: 'Kannada', value: 'Kannada', color: '#10B981' },
    { label: 'Urdu', value: 'Urdu', color: '#F59E0B' },
    { label: 'Mappila Patt', value: 'Mappila Patt', color: '#EC4899' },
    { label: 'Mashup', value: 'Mashup', color: '#F97316' },
];

export default function UploadScreen({ navigation }) {
    const { colors, theme } = useTheme();
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [lyrics, setLyrics] = useState('');
    const [category, setCategory] = useState('Malayalam');
    const [loading, setLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const scrollViewRef = useRef(null);

    useFocusEffect(
        useCallback(() => {
            scrollViewRef.current?.scrollTo({ y: 0, animated: false });
            checkAuth();
        }, [])
    );

    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
            setIsAuthenticated(false);
            navigation.navigate('Home');
            navigation.navigate('Auth');
        } else {
            setIsAuthenticated(true);
        }
    };

    const generateTransliteration = async (lyricsText, songCategory) => {
        const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
        console.log("🔑 Using Groq Key (first 5):", GROQ_API_KEY?.substring(0, 5));
        try {
            console.log("⚡ Sending request to Groq (LLaMA-3 70B) for 3-way transliteration...");
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    response_format: { type: "json_object" },
                    messages: [
                        {
                            role: "system",
                            content: `You are an expert, strict PHONETIC TRANSLITERATION ENGINE.
Your task is to take lyrics in a given category and phonetically map their exact sounds into three target scripts: English (Latin script), Malayalam script, and Kannada script.

CRITICAL RULES:
1. STRICTLY NO TRANSLATION OF MEANING:
   - Do NOT translate the meaning of any words.
   - Example (Wrong translation): Malayalam "ഒന്ന് കണ്ടോട്ടെ" -> English "Let me see once" (NO!)
   - Example (Correct transliteration): Malayalam "ഒന്ന് കണ്ടോട്ടെ" -> English "Onnu kandotte" (YES!)
   - Example (Wrong translation): Arabic "حبيبي" -> English "My love" (NO!)
   - Example (Correct transliteration): Arabic "حبيبي" -> English "Habibi" (YES!)
   - Do NOT translate Islamic themes, cultural phrases, or vocabulary. Write down exactly how they sound using the target alphabet.

2. PRESERVE STRUCTURE EXACTLY:
   - You MUST keep all line breaks, brackets (like [onnu] or ||2||), and verse spacing exactly intact.
   - Use explicit newline characters (\n) inside your JSON strings to represent every single line break.

3. Return ONLY a valid JSON object with exactly these three keys: "English", "Malayalam", "Kannada".`
                        },
                        { role: "user", content: `Song Category: ${songCategory}\n\nLyrics to phonetically transliterate:\n${lyricsText}` }
                    ],
                    temperature: 0.1,
                })
            });
            if (!response.ok) { 
                console.warn("❌ Groq API CORS or Status Error. Using local fallback."); 
                return {
                    English: lyricsText,
                    Malayalam: songCategory === 'Malayalam' ? lyricsText : '',
                    Kannada: songCategory === 'Kannada' ? lyricsText : ''
                };
            }
            const data = await response.json();
            const jsonObject = JSON.parse(data.choices[0].message.content.trim());
            console.log("✅ Transliteration JSON generated successfully with keys:", Object.keys(jsonObject));
            return jsonObject;
        } catch (error) { 
            console.error("❌ Groq/Parsing Error:", error); 
            return {
                English: lyricsText,
                Malayalam: songCategory === 'Malayalam' ? lyricsText : '',
                Kannada: songCategory === 'Kannada' ? lyricsText : ''
            };
        }
    };

    const handleUpload = async () => {
        if (!title || !artist || !lyrics) { Alert.alert('Missing Fields', 'Please fill in all fields.'); return; }
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) { setLoading(false); Alert.alert('Not Logged In', 'Please log in first.'); navigation.navigate('Auth'); return; }
        try {
            console.log("🤖 Generating AI Transliteration...");
            const transliterations = await generateTransliteration(lyrics, category);
            console.log("💾 Saving to database...");
            const { error: dbError } = await safeInsertSong({ title, artist, lyrics, category, status: 'pending', user_id: user.id, transliterations });
            if (dbError) throw dbError;
            Alert.alert('Submitted! ⏳', 'Your lyrics have been sent for Admin approval.', [{
                text: "Awesome!", onPress: () => { setTitle(''); setArtist(''); setLyrics(''); navigation.navigate('Home'); }
            }]);
        } catch (error) {
            console.error("Upload Error:", error);
            Alert.alert('Upload Failed', 'Something went wrong while saving your contribution.');
        } finally { setLoading(false); }
    };

    // Fallback: not authenticated
    if (!isAuthenticated) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }]}>
                <View style={[styles.lockCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={[styles.lockIconWrap, { backgroundColor: colors.primarySoft }]}>
                        <Ionicons name="lock-closed" size={36} color={colors.primary} />
                    </View>
                    <Text style={[styles.lockTitle, { color: colors.text }]}>Sign In Required</Text>
                    <Text style={[styles.lockSub, { color: colors.secondaryText }]}>You need to be logged in to contribute lyrics.</Text>
                    <TouchableOpacity style={[styles.lockBtn, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('Auth')}>
                        <Text style={styles.lockBtnText}>Go to Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const currentCat = CATEGORIES.find(c => c.value === category);
    const accentColor = currentCat?.color || colors.primary;

    const FormLabel = ({ children }) => (
        <Text style={[styles.label, { color: colors.secondaryText }]}>{children}</Text>
    );

    return (
        <ScrollView
            ref={scrollViewRef}
            style={[styles.container, { backgroundColor: colors.background }]}
            showsVerticalScrollIndicator={false}
        >
            <StatusBar style={theme === 'dark' ? "light" : "dark"} />

            {/* Ambient blobs */}
            <View style={[styles.blobA, { backgroundColor: colors.blobA }]} />
            <View style={[styles.blobB, { backgroundColor: colors.blobB }]} />

            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.headerEyebrow, { color: colors.secondaryText }]}>CONTRIBUTE</Text>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Upload Lyrics</Text>
                <View style={[styles.aiBadge, { backgroundColor: colors.primarySoft, borderColor: colors.borderSubtle }]}>
                    <Ionicons name="sparkles" size={13} color={colors.primary} style={{ marginRight: 5 }} />
                    <Text style={[styles.aiBadgeText, { color: colors.primary }]}>AI auto-transliteration included</Text>
                </View>
            </View>

            <View style={styles.formContainer}>

                {/* Title + Artist in a single glass card */}
                <View style={[styles.inputCard, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}>
                    {/* Song Title */}
                    <View style={[styles.inputRow, { borderBottomColor: colors.innerBorder }]}>
                        <View style={[styles.inputIcon, { backgroundColor: colors.primarySoft }]}>
                            <Ionicons name="musical-note-outline" size={15} color={colors.primary} />
                        </View>
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Song title"
                            placeholderTextColor={colors.secondaryText}
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>
                    {/* Artist */}
                    <View style={styles.inputRow}>
                        <View style={[styles.inputIcon, { backgroundColor: colors.primarySoft }]}>
                            <Ionicons name="person-outline" size={15} color={colors.primary} />
                        </View>
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Artist / Singer"
                            placeholderTextColor={colors.secondaryText}
                            value={artist}
                            onChangeText={setArtist}
                        />
                    </View>
                </View>

                {/* Category picker */}
                <FormLabel>CATEGORY</FormLabel>
                <View style={[styles.inputCard, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow, borderLeftWidth: 3, borderLeftColor: accentColor }]}>
                    <Picker
                        selectedValue={category}
                        onValueChange={(val) => setCategory(val)}
                        style={[styles.picker, { color: colors.text }]}
                        dropdownIconColor={colors.primary}
                    >
                        {CATEGORIES.map(c => (
                            <Picker.Item key={c.value} label={c.label} value={c.value} />
                        ))}
                    </Picker>
                </View>

                {/* Lyrics textarea */}
                <FormLabel>LYRICS</FormLabel>
                <View style={[styles.inputCard, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}>
                    <TextInput
                        style={[styles.textArea, { color: colors.text }]}
                        placeholder="Paste or type the full lyrics here..."
                        placeholderTextColor={colors.secondaryText}
                        value={lyrics}
                        onChangeText={setLyrics}
                        multiline
                        numberOfLines={10}
                        textAlignVertical="top"
                    />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, { backgroundColor: colors.primary, shadowColor: colors.primaryGlow }]}
                    onPress={handleUpload}
                    disabled={loading}
                    activeOpacity={0.82}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <View style={styles.submitInner}>
                            <Ionicons name="cloud-upload-outline" size={20} color="#FFF" style={{ marginRight: 10 }} />
                            <Text style={styles.submitButtonText}>Submit for Approval</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <Text style={[styles.submitNote, { color: colors.secondaryText }]}>
                    Your submission will be reviewed by an admin before going live.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    blobA: {
        position: 'absolute', width: 300, height: 300, borderRadius: 150,
        top: -60, right: -100, opacity: 0.40,
    },
    blobB: {
        position: 'absolute', width: 220, height: 220, borderRadius: 110,
        top: 300, left: -90, opacity: 0.30,
    },

    header: { paddingTop: 62, paddingHorizontal: 22, paddingBottom: 10 },
    headerEyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 4 },
    headerTitle: { fontSize: 30, fontWeight: '800', letterSpacing: -0.6, marginBottom: 14 },
    aiBadge: {
        flexDirection: 'row', alignItems: 'center',
        alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6,
        borderRadius: 20, borderWidth: 1,
    },
    aiBadgeText: { fontSize: 12, fontWeight: '700' },

    formContainer: { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 110 },

    label: {
        fontSize: 11, fontWeight: '700', letterSpacing: 1.1,
        marginBottom: 8, marginTop: 16, marginLeft: 4,
    },

    // Shared glass input card
    inputCard: {
        borderRadius: 18, borderWidth: 1, overflow: 'hidden',
        shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.09, shadowRadius: 14, elevation: 4,
        marginBottom: 4,
    },
    inputRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 4,
        borderBottomWidth: 0.5,
    },
    inputIcon: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    input: { flex: 1, paddingVertical: 16, fontSize: 15 },
    picker: { height: 52 },
    textArea: {
        paddingHorizontal: 16, paddingVertical: 16,
        fontSize: 15, minHeight: 200, lineHeight: 22,
    },

    // Submit
    submitButton: {
        paddingVertical: 17, borderRadius: 18, alignItems: 'center', marginTop: 28,
        shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.30, shadowRadius: 16, elevation: 8,
    },
    submitInner: { flexDirection: 'row', alignItems: 'center' },
    submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    submitNote: { textAlign: 'center', fontSize: 12, marginTop: 12, lineHeight: 18 },

    // Auth fallback
    lockCard: {
        width: '100%', borderRadius: 28, borderWidth: 1,
        padding: 32, alignItems: 'center',
    },
    lockIconWrap: { width: 70, height: 70, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 18 },
    lockTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
    lockSub: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
    lockBtn: { paddingVertical: 14, paddingHorizontal: 32, borderRadius: 14 },
    lockBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});