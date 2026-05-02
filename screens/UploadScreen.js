import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { supabase } from "./supabase";
import { Picker } from "@react-native-picker/picker";

export default function UploadScreen({ navigation }) {
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [language, setLanguage] = useState('English');
    const [lyrics, setLyrics] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    // --- THE AI TRANSLITERATION ENGINE ---
    const generateTransliterations = async (inputLyrics) => {
        try {
            setErrorMsg(null);
            const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

            if (!apiKey) {
                const msg = "Gemini API Key missing in .env";
                setErrorMsg(msg);
                return null;
            }

            const promptText = `
                ACT AS A PROFESSIONAL MUSIC TRANSLITERATOR.
                Transliterate/translate these lyrics into exactly 4 scripts.
                Return ONLY a JSON object with keys: "english", "malayalam", "kannada", "urdu".
                
                Lyrics:
                ${inputLyrics}
            `;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: promptText }] }]
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("AI API Error:", data);
                setErrorMsg(data.error?.message || "AI processing failed.");
                return null;
            }

            const jsonString = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!jsonString) {
                setErrorMsg("AI returned no content.");
                return null;
            }

            const cleaned = jsonString.replace(/```json|```/g, "").trim();
            return JSON.parse(cleaned); 
            
        } catch (error) {
            console.error("AI Crash:", error);
            setErrorMsg(`Connection Error: ${error.message}`);
            return null;
        }
    };

    // --- THE UPLOAD HANDLER ---
    const handleUpload = async () => {
        if (isSubmitting) return;

        try {
            if (!title.trim() || !artist.trim() || !lyrics.trim()) {
                Alert.alert('Hold Up!', 'Please fill out all fields.');
                return;
            }

            setIsSubmitting(true);
            const transliterationPack = await generateTransliterations(lyrics);

            if (!transliterationPack) {
                setIsSubmitting(false);
                return; 
            }

            const { error: dbError } = await supabase
                .from('songs')
                .insert([{
                    title: title.trim(), 
                    artist: artist.trim(), 
                    language: language, 
                    lyrics: lyrics.trim(), 
                    transliterations: transliterationPack 
                }]);

            setIsSubmitting(false);

            if (dbError) {
                console.error("Supabase Error:", dbError);
                setErrorMsg(`Database Error: ${dbError.message}`);
            } else {
                Alert.alert('Success', 'Song uploaded successfully!');
                navigation.goBack();
            }
        } catch (globalError) {
            console.error("Global Handler Error:", globalError);
            setIsSubmitting(false);
            setErrorMsg(`Unexpected Error: ${globalError.message}`);
        }
    };

    // --- THE UI ---
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            {errorMsg && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
            )}

            <Text style={styles.label}>Song Title</Text>
            <TextInput style={styles.input} placeholder="Enter the title" value={title} onChangeText={setTitle} />
            
            <Text style={styles.label}>Artist Name</Text>
            <TextInput style={styles.input} placeholder="Enter the artist" value={artist} onChangeText={setArtist} />
            
            <Text style={styles.label}>Category</Text>
            <View style={styles.pickerContainer}>
                <Picker selectedValue={category} onValueChange={(itemValue) => setCategory(itemValue)} style={styles.picker}>
                    <Picker.Item label="Malayalam" value="Malayalam" />
                    <Picker.Item label="English/Manglish" value="English" />
                    <Picker.Item label="Kannada" value="Kannada" />
                    <Picker.Item label="Urdu" value="Urdu" />
                    <Picker.Item label="Mappila Patt" value="Mappila Patt" />
                    <Picker.Item label="Mashup" value="Mashup" />
                </Picker>
            </View>
          
            <Text style={styles.label}>Lyrics</Text>
            <TextInput
                style={[styles.input, styles.lyricsInput]}
                placeholder="Paste lyrics here..."
                value={lyrics}
                onChangeText={setLyrics}
                multiline
            />
            
            <TouchableOpacity style={styles.submitButton} onPress={handleUpload} disabled={isSubmitting}>
                {isSubmitting ? (
                    <ActivityIndicator color="#ffffff" />
                ) : (
                    <Text style={styles.submitText}>Process & Upload</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0FDF4' },
    scrollContent: { padding: 24, paddingBottom: 50 },
    errorBanner: { backgroundColor: '#FEE2E2', padding: 12, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#EF4444' },
    errorText: { color: '#B91C1C', fontSize: 14, textAlign: 'center', fontWeight: '500' },
    label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#166534', marginTop: 15 },
    input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#FFFFFF', color: '#1F2937' },
    pickerContainer: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, overflow: 'hidden' },
    picker: { height: 50, width: '100%' },
    lyricsInput: { height: 150, textAlignVertical: 'top' },
    submitButton: { backgroundColor: '#166534', padding: 16, marginTop: 30, borderRadius: 8, alignItems: 'center' },
    submitText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
});