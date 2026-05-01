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
    const handleUpload = async () => {
        if (!title || !artist || !language || !lyrics) {
            Alert.alert('Hold Up!', 'Please fill out all the fields before submitting.');
            return;
        }
        setIsSubmitting(true);
        const { error } = await supabase
            .from('songs')
            .insert([
                {title: title, artist: artist, language: language, lyrics: lyrics}
            ]);
        setIsSubmitting(false);
        if (error) {
            Alert.alert('Error', 'Something went wrong while uploading.');
            console.error(error);
        }else {
            Alert.alert('Success', 'Your song has been uploaded!');
            navigation.goBack();
        }
    };
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.label}>Song Title</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter the title of the song"
                value={title}
                onChangeText={setTitle}
            />
            <Text style={styles.label}>Artist Name</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter the artist name"
                value={artist}
                onChangeText={setArtist}
            />
            <Text style={styles.label}>Language</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={language}
                    onValueChange={(itemValue) => setLanguage(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item label="English" value="English" />
                    <Picker.Item label="Malayalam" value="Malayalam" />
                    <Picker.Item label="Urdu" value="Urdu" />
                    <Picker.Item label="Kannada" value="Kannada" />
                </Picker>
            </View>
          
            <Text style={styles.label}>Lyrics</Text>
            <TextInput
                style={[styles.input, styles.lyricsInput]}
                placeholder="Type or paste the full lyrics here..."
                value={lyrics}
                onChangeText={setLyrics}
                multiline
            />
            <TouchableOpacity
                style={styles.submitButton}
                onPress={handleUpload}
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    <ActivityIndicator color="#ffffff" />
                ) : (
                    <Text style={styles.submitText}>Upload Song</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0FDF4',
    },
    scrollContent: {
        padding: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#166534',
        marginTop: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#FFFFFF',
        color: '#1F2937',
    },
    pickerContainer: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
        width: '100%',
    },
    lyricsInput: {
        height: 150,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: '#166534',
        padding: 16,
        marginTop: 30,  
        borderRadius: 8,
        alignItems: 'center',
    },
    submitText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});