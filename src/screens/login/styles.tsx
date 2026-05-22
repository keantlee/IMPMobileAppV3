import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },

  subContainer: {
    width: '100%',
    justifyContent: 'flex-start', 
    alignItems: 'center',
  },

  inputWrapper: {
    width: '70%',
    marginVertical: 10,
  },

  input: {
    width: '100%',
    height: 48, // Standard touch-target size guideline minimums
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
    color: '#333333',
  },

  inputError: {
    borderColor: '#f27474',
    backgroundColor: '#fff5f5',
  },

  errorText: {
    color: '#f27474',
    fontSize: 12,
    marginTop: 4,
    paddingLeft: 4,
  },

  fpText: {
    fontSize: 14,
    color: '#009246',
    fontStyle: 'italic',
    textAlign: 'right',
    width: '70%',
    marginTop: 5,
    marginBottom: 25,
    alignSelf: 'center',
  },

  logInBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '70%',
    height: 48,
    borderRadius: 10,
    backgroundColor: '#009246',
  },

  btnDisabled: {
    backgroundColor: '#a3d9b9',
  },

  btnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 15,
  },

  logo: {
    height: 120,
    width: 120,
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