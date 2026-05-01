import {StyleSheet, Text, View, FlatList, TouchableOpacity} from 'react-native';

const dummySongs=[
    {id: '1', title: 'Ya Nabi Salam Alayka', artist: 'Maher Zain'},
    {id: '2', title: 'Mawlaya', artist: 'Sami Yusuf'},
    {id: '3', title: 'Hasbi Rabbi Jallallah', artist: 'Mesut Kurtis'},
    {id: '4', title: 'Tala Al Badru Alayna', artist: 'Traditional'},
]

export default function LanguageScreen({route, navigation}) {
    const {langName} = route.params;

    const renderSong=({item}) => (
        <TouchableOpacity style={styles.songCard}>
            <Text style={styles.songTitle}>{item.title}</Text>
            <Text style={styles.songArtist}>{item.artist}</Text>
        </TouchableOpacity>
    );
    return (
        <View style={styles.container}>
            <View style={styles.header}></View>
                        <Text style={styles.headerText}>{langName} Songs</Text>
            <FlatList
            data={dummySongs}
            keyExtractor={(item) => item.id}
            renderItem={renderSong}
            contentContainerStyle={styles.listContainer}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0FDF4',
    },
    header: {
        padding: 20,
        paddingTop: 40,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#166534',
    },
    listContainer: {
        padding: 20,
    },
    songCard: {
        backgroundColor: '#ffffff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    songTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    songArtist: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
});