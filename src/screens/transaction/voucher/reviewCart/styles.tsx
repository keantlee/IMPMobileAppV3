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

    /* List Structures */
    listContainer: { padding: 20, paddingBottom: 40 },
    emptyContainer: { paddingVertical: 40, alignItems: 'center' },
    emptyText: { color: '#7F8C8D', fontSize: 15 },
    
    /* Dynamic Cart Card Items Layout */
    itemCard: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#EAEAEA',
        /* Soft Shadow elevation for card layout */
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    itemInfo: { flex: 1, paddingRight: 12 },
    itemName: { fontSize: 16, fontWeight: '700', color: '#2C3E50' },
    itemSub: { fontSize: 13, color: '#7F8C8D', marginTop: 2 },
    itemDetails: { fontSize: 13, color: '#34495E', fontWeight: '500', marginTop: 4 },
    remarksText: { fontSize: 12, color: '#7F8C8D', fontStyle: 'italic', marginTop: 4 },
    
    itemPriceBlock: { alignItems: 'flex-end', justifyContent: 'space-between', minHeight: 65 },
    itemPrice: { fontSize: 16, fontWeight: '800', color: '#009246' },
    
    /* Container for layout action items buttons */
    actionRowContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginTop: 8 
    },
    
    /* THE DYNAMIC AMBER GOLD EDIT BUTTON */
    editButton: { 
        paddingVertical: 5, 
        paddingHorizontal: 10, 
        backgroundColor: '#FEF9E7', // Soft background tint
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#F39C12',
        marginRight: 8,
    },
    editButtonText: { 
        color: '#D35400', // Deep amber text contrast
        fontSize: 12, 
        fontWeight: '700' 
    },

    /* RED REMOVE BUTTON */
    removeButton: { 
        paddingVertical: 5, 
        paddingHorizontal: 10, 
        backgroundColor: '#FFF5F5', 
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#FADBD8',
    },
    removeButtonText: { 
        color: '#D9383A', 
        fontSize: 12, 
        fontWeight: '700' 
    },

    /* Sticky Bottom Dock Components */
    bottomDock: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 24,
        borderTopWidth: 1,
        borderColor: '#EAEAEA',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 8, // Elevation creates distinct separation on device layouts
    },
    cartSummaryText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#2C3E50',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    /* Map rowBetween formatting styles cleanly */
    rowBetween: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 10 
    },
    labelPrimary: { 
        fontSize: 14, 
        fontWeight: '500', 
        color: '#5D6D7E' 
    },
    /*  Map labelValue formatting styles cleanly */
    labelValue: { 
        fontSize: 15, 
        fontWeight: '600', 
        color: '#2C3E50' 
    },
    
    checkoutButton: {
        backgroundColor: '#009246',
        borderRadius: 10,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
    },
    disabledCheckout: { backgroundColor: '#BDC3C7' },
    checkoutButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
});