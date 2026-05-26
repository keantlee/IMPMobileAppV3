import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: 
        '#F8F9FA' 
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
    },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    itemInfo: { flex: 1, paddingRight: 8 },
    itemName: { fontSize: 16, fontWeight: '700', color: '#2C3E50' },
    itemSub: { fontSize: 13, color: '#7F8C8D', marginTop: 2 },
    itemDetails: { fontSize: 13, color: '#333', fontWeight: '500', marginTop: 4 },
    itemPriceBlock: { alignItems: 'flex-end' },
    itemPrice: { fontSize: 16, fontWeight: '800', color: '#009246' },
    removeButton: { marginTop: 8, paddingVertical: 4, paddingHorizontal: 8, backgroundColor: '#FFF5F5', borderRadius: 4 },
    removeButtonText: { color: '#D9383A', fontSize: 12, fontWeight: '600' },

    /* Action Control Boxes Layout */
    footerActionsContainer: { marginTop: 8, marginBottom: 20 },
    dashedButton: {
        borderWidth: 2,
        borderColor: '#009246',
        borderStyle: 'dashed',
        borderRadius: 10,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 146, 70, 0.02)',
    },
    disabledButton: { borderColor: '#BDC3C7', backgroundColor: '#F2F4F4' },
    dashedButtonText: { color: '#009246', fontSize: 15, fontWeight: '700' },
    alertText: { color: '#D9383A', textAlign: 'center', marginTop: 8, fontSize: 12, fontWeight: '500' },

    /* Sticky Bottom Dock Components */
    bottomDock: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 24,
        borderTopWidth: 1,
        borderColor: '#EAEAEA',
    },
    dockRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    dockLabelSecondary: { fontSize: 13, fontWeight: '600', color: '#7F8C8D' },
    dockValueSecondary: { fontSize: 14, fontWeight: '700', color: '#2C3E50' },
    dockLabelPrimary: { fontSize: 15, fontWeight: '700', color: '#2C3E50' },
    dockValuePrimary: { fontSize: 18, fontWeight: '800', color: '#009246' },
    
    checkoutButton: {
        backgroundColor: '#009246',
        borderRadius: 10,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    disabledCheckout: { backgroundColor: '#BDC3C7' },
    checkoutButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});