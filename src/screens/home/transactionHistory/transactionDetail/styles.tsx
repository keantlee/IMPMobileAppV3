import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
        backgroundColor: '#F8F9FA',
    },

    subContainer: {
        width: '100%',
        justifyContent: 'flex-start', 
        alignItems: 'center',
    },

    header: {
        height: 56,
        backgroundColor: '#009246',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backIcon: {
        fontSize: 24,
        color: '#FFF',
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFF',
    },
    backButtonPlaceholder: {
        width: 40,
    },

    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 32,
    },
});