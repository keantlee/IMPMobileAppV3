import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    // Category() Styles
    wrapper: {
        marginBottom: 4,
    },
    dropdown: {
        height: 48,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        paddingHorizontal: 12,
    },
    leftIcon: {
        marginRight: 8,
    },
    placeholderStyle: {
        fontSize: 14,
        color: '#BDC3C7',
    },
    selectedTextStyle: {
        fontSize: 14,
        color: '#2C3E50',
        fontWeight: '500',
    },
    containerStyle: {
        borderRadius: 8,
        marginTop: 2,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    itemTextStyle: {
        fontSize: 14,
        color: '#2C3E50',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    errorMessageText: {
        color: '#D9383A',
        fontSize: 12,
        marginLeft: 4,
        fontWeight: '500',
    },

    // AmountInput() Styles
    wrapperContainer: {
        width: '100%',
        marginVertical: 2,
    },
    inputHeaderLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#34495E',
        marginBottom: 4,
    },
    errorRowInline: { 
        flexDirection: 'row', 
        alignItems: 'center',
        marginTop: 4,
    },
    primaryContainer: {
        width: '100%',
        marginVertical: 6, // Replaced unstable vh calculations with uniform pixel offsets
    },

    /**
     * Modernized Responsive Number Box Input
     * Provides standard pixel vertical offsets to prevent truncation errors across Android & iOS devices.
     */
    primaryInputSmallBox: {
        borderWidth: 1,
        width: '100%', // changed from vw(43.5) to '100%' so columns fill out their split layout correctly!
        height: 48,    // Fixed height eliminates device font-scaling clipping issues
        borderRadius: 8,        
        backgroundColor: '#FFFFFF',
        color: '#2C3E50',
        paddingLeft: 14,                
        paddingRight: 14,
        fontSize: 14,  // Standard, highly legible text node size
        
        // Android text baseline positioning adjustment rules
        textAlignVertical: 'center',
        
        // Clean conditional font fallback rules protection engine
        ...Platform.select({
            ios: {
                fontFamily: 'System', 
                fontWeight: '400',
            },
            android: {
                // Keep your custom font configuration rules framework asset if registered globally
                // fontFamily: constants.Fonts.PoppinsRegular, 
                fontFamily: 'Poppins-Regular',
            }
        }),
    },
})