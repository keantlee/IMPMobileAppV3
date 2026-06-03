import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({ 
    container: { 
        flex: 1, 
        backgroundColor: '#F8F9FA' 
    },
    center: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    
    /* Header Styles */
    header: {
        height: 56,
        backgroundColor: '#009246',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
    },
    backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    backIcon: { fontSize: 24, color: '#FFF', fontWeight: 'bold' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFF' },
    backPlaceholder: { width: 40 },
});