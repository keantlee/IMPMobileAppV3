import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    centerFlexContainer: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#F8F9FA', 
        padding: 24
    },
    errorText: {
        fontSize: 15, 
        color: '#2C3E50', 
        textAlign: 'center', 
        lineHeight: 22, 
        marginBottom: 20
    },
    retryButton: {
        backgroundColor: '#16A085', 
        paddingVertical: 12, 
        paddingHorizontal: 24, 
        borderRadius: 8
    },
    retryButtonText: {
        color: '#ffffff', 
        fontWeight: '700', 
        fontSize: 15
    },
    topOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    bottomOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', paddingTop: 24 },
    middleRowOverlay: { flexDirection: 'row', height: 260 },
    sideOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    targetFrameBox: {
        width: 260,
        height: 260,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    instructionPrompt: { color: '#ffffff', fontSize: 14, fontWeight: '600', letterSpacing: 0.5 },
    cornerMarker: { position: 'absolute', width: 24, height: 24, borderColor: '#16A085', borderWidth: 4 },
    topLeftCorner: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
    topRightCorner: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
    bottomLeftCorner: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
    bottomRightCorner: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 },
    modalCard: { backgroundColor: '#ffffff', borderRadius: 14, width: '100%', maxWidth: 320, padding: 24, alignItems: 'center', elevation: 5 },
    modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
    modalMessage: { fontSize: 14, color: '#666666', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
    modalButton: { width: '100%', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    modalButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '600' }
})