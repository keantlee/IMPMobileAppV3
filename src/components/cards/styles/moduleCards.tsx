import { StyleSheet } from "react-native";

export const moduleCardsStyles = StyleSheet.create({ 
    modulesContainerPerItemRow: {
        flexDirection: 'row',
        justifyContent: 'center',
      },
  
      moduleItem: {
        flexDirection: 'column',
        marginHorizontal: 5
      },
  
      moduleCards: {
        marginVertical: 10,
        height: 80,
        width: 80, 
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5,
        borderBottomLeftRadius: 5,
        elevation:10,
        backgroundColor: '#7c7c7c',
      },

      moduleTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#ffffff',
      },

      moduleImage: {
        width: '100%',
        height: '100%', // or whatever height you want
      },

      moduleCardOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Adjust the opacity as needed
        padding: 5,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
      },
});