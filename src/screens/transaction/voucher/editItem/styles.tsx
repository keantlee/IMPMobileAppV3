import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#F8F9FA' 
    },
    header: { 
        height: 56, 
        backgroundColor: '#009246', 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: 8 
    },
    backButton: { 
        width: 40, 
        height: 40, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    backIcon: { 
        fontSize: 24, 
        color: '#FFF', 
        fontWeight: 'bold' 
    },
    headerTitle: { 
        fontSize: 18, 
        fontWeight: '700', 
        color: '#FFF' 
    },
    backPlaceholder: { 
        width: 40 
    },
    scrollContent: { 
        padding: 20, 
        paddingBottom: 140 
    },
    formGroup: { 
        marginBottom: 16 
    },
    formLabel: { 
        fontSize: 14, 
        fontWeight: '600', 
        color: '#34495E', 
        marginBottom: 6 
    },
    asterisk: {
        color: '#D9383A', // High contrast error danger red
        fontWeight: '700',
    },
    inputField: { 
        height: 48, 
        backgroundColor: '#FFF', 
        borderWidth: 1, 
        borderColor: '#BDC3C7', 
        borderRadius: 8, 
        paddingHorizontal: 12, 
        color: '#2C3E50' },
    dropdownBox: { 
        height: 48, 
        backgroundColor: '#FFF', 
        borderWidth: 1, 
        borderColor: '#009246', 
        borderRadius: 8, 
        justifyContent: 'center', 
        paddingHorizontal: 12 
    },
    flexRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginBottom: 16 
    },
    errorLabel: { 
        color: '#D9383A', 
        fontSize: 12, 
        marginTop: 4, 
        fontWeight: '500' 
    },

    /* Dropdown Search Layout Box */
    modalContainer: { 
        backgroundColor: '#FFF', 
        borderWidth: 1, 
        borderColor: '#BDC3C7', 
        borderRadius: 8, 
        marginTop: 4, 
        padding: 8, 
        elevation: 3 
    },
    modalSearchRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        borderBottomWidth: 1, 
        borderBottomColor: '#ECEFF1', 
        paddingBottom: 4, 
        marginBottom: 4 
    },
    modalSearchInput: { 
        flex: 1, 
        height: 36, 
        paddingHorizontal: 8, 
        color: '#2C3E50' 
    },
    modalItemRow: { 
        paddingVertical: 12, 
        paddingHorizontal: 8, 
        borderBottomWidth: 0.5, 
        borderBottomColor: '#F2F4F4' 
    },
    modalItemText: { color: '#2C3E50', fontSize: 14 },

    /* Footer Metrics Bar Dock Layout */
    bottomDock: { 
        backgroundColor: '#FFF', 
        paddingHorizontal: 20, 
        paddingTop: 12, 
        paddingBottom: 24, 
        borderTopWidth: 1, 
        borderColor: 
        '#ECEFF1' 
    },
    dockRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginBottom: 6 
    },
    dockLabel: { 
        fontSize: 13, 
        fontWeight: '600', 
        color: '#7F8C8D' },
    dockValue: { 
        fontSize: 15, 
        fontWeight: '700', 
        color: '#2C3E50' 
    },
    submitButton: { 
        backgroundColor: '#009246', 
        height: 48, 
        borderRadius: 8, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginTop: 10 
    },
    submitButtonText: { 
        color: '#FFF', 
        fontSize: 14, 
        fontWeight: '700', 
        letterSpacing: 0.5 
    },
    
    noResultsText: {
        textAlign: 'center',
        color: '#D9383A',
        fontSize: 14,
        marginTop: 20,
        fontStyle: 'italic'
    }
});