import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },

    subContainer: {
        flex: 0.8, 
        justifyContent: 'flex-start', 
        alignItems: 'center',
    },

    input: {
        margin: 25,
        width: '70%',
        height: 2,
        borderRadius: 10
    },

    logo: {
        height:'30%',
        width: '100%',
    },

    otpVerificationTitleContainer:{
        // top: Dimensions.vw(10),  
        justifyContent: 'center'
    },

    otpVerificationTitle:{  
        textAlign: 'center',
    },

    otpSubtitle:{
        textAlign: 'center',
    }, 

    textTitle: {
        fontSize: 25,
        fontWeight: 'bold',
        textAlign: 'center',
    },

    text:{
        marginVertical: 10,
        textAlign: 'center',
        fontSize: 18,
    },

    cell: {
        width: 50,
        height: 50,
        lineHeight: 45,
        fontSize: 25,
        borderWidth: 2,
        textAlign: 'center',
        borderRadius: 5, 
        margin:3, 
        borderColor: '#808080',
    },

    focusCell:{
        width: 50,
        height: 50,
        lineHeight: 45,
        fontSize: 25,
        borderWidth: 2,
        textAlign: 'center',
        borderRadius: 5, 
        margin:3, 
        borderColor: '#00f731', 
        color: '#00f731',        
    },

    cellHasValue:{
        width: 50,
        height: 50,
        lineHeight: 45,
        fontSize: 25,
        borderWidth: 2,
        textAlign: 'center',
        borderRadius: 5, 
        margin:3, 
        borderColor: '#00f731', 
        color: '#00f731',     
    },

    errorCell:{
        width: 50,
        height: 50,
        lineHeight: 45,
        fontSize: 25,
        borderWidth: 2,
        textAlign: 'center',
        borderRadius: 5, 
        margin:3,  
        borderColor: '#f70000', 
        color: '#f70000',     
    },

    root: {
        padding: 10,
        borderWidth: 2,
    },

    title: {
        textAlign: 'center', 
        fontSize: 30
    },
    
    codeFieldRoot: {
        margin: 25,
    },

    verifyBtn: {
        alignItems: 'center',
        width: '70%',
        borderRadius: 10,
        backgroundColor: '#009246',
        borderColor: '#009246',
    },

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        margin: 15,
        marginLeft: 40,
    },

    link:{
        color: "#FDB075",
        fontWeight: "bold",
        marginRight: 60,
    },

      logoContainer: {
        marginVertical: 25,
        alignSelf: 'center',
        borderRadius: 60,
        overflow: 'hidden',
        backgroundColor: 'white',
        // iOS shadow properties setup
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,                 
        shadowRadius: 4.65,
        // Android alternative elevation parameter configurations
        elevation: 8,
    },
});