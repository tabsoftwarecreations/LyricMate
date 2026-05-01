import {StyleSheet, Text, View, ScrollView } from 'react-native';
export default function LyricScreen({route}) {
    const {songTitle, artist, lyrics } = route.params;
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
            <Text style={styles.title}>{songTitle}</Text>
            <Text style={styles.artist}>{artist}</Text>

            <View style={styles.divider} />

            <Text style={styles.lyricsText}>{lyrics}</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0FDF4',
    },
    scrollContainer: {
        padding: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#166534',
        textAlign: 'center',
    },
    artist: {
        fontSize: 16,
        color: '#4B5563',
        textAlign: 'center',
        marginTop: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#D1D5DB',
        marginVertical: 20,
    },
    lyricsText: {
        fontSize: 18,
        color: '#1F2937',
        lineHeight: 20,
        textAlign: 'left',
    },
});