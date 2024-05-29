// styles/HomeStyles.js
import { StyleSheet, Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#FFFFFF',
    },
    initialContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      padding: 16,
      width: width,
      height: height,
    },
    logoContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      marginTop: '15%',
    },
    container: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'center',
      padding: 16,
      backgroundColor: '#FFFFFF',
      shadowColor: '#9194B1',
      shadowOffset: { width: 0, height: 84 },
      shadowOpacity: 0.44,
      shadowRadius: 84,
      borderRadius: 30,
      width: width,
      height: height,
    },
    navigationBar: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      height: 88,
      backgroundColor: 'rgba(255, 255, 255, 0.0025)',
      paddingHorizontal: 16,
    },
    backButton: {
      position: 'absolute',
      left: 0,
    },
    pageTitle: {
      flex: 1,
      fontSize: 20,
      fontWeight: '500',
      textAlign: 'center',
      color: '#1D232E',
    },
    logo: {
      width: 100,
      height: 100,
      marginBottom: 20,
    },
    title: {
      fontSize: 32,
      fontWeight: '600',
      marginBottom: 400,
      color: '#1D232E',
    },
    buttonContainer: {
      position: 'absolute',
      bottom: 82,
      width: '100%',
      paddingHorizontal: 24,
    },
    loginButton: {
      height: 56,
      backgroundColor: '#007FFF',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
      marginBottom: 16,
    },
    signupButton: {
      height: 56,
      backgroundColor: '#C0D9F3',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
    },
    signupButtonText: {
      fontSize: 16,
      color: '#4FA6FF',
    },
    buttonText: {
      fontSize: 18,
      color: '#FFFFFF',
    },
    form: {
      width: '100%',
      alignItems: 'center',
    },
    input: {
      width: '90%',
      height: 50,
      backgroundColor: '#F7F7F7',
      borderColor: '#DADADA',
      borderWidth: 1,
      borderRadius: 8,
      padding: 8,
      marginBottom: 16,
      fontSize: 16,
      color: '#8F8F8F',
    },
    checkboxContainer: {
      flexDirection: 'row',
      marginBottom: 20,
      alignItems: 'center',
      width: '90%',
    },
    checkbox: {
      alignSelf: 'center',
    },
    label: {
      marginLeft: 8,
      fontSize: 14,
      color: '#1D232E',
    },
    link: {
      color: '#007FFF',
      textDecorationLine: 'underline',
    },
    button: {
      width: '90%',
      height: 56,
      backgroundColor: '#007FFF',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
      marginBottom: 16,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '500',
      color: '#FFFFFF',
    },
    forgotPasswordText: {
      fontSize: 16,
      fontWeight: '500',
      color: '#007FFF',
      marginTop: 16,
    },
    resetPasswordInstruction: {
      fontSize: 16,
      fontWeight: '400',
      color: '#1D232E',
      marginBottom: 16,
      textAlign: 'center',
      paddingHorizontal: 24, // Added padding to match button margins
    },
    message: {
      marginTop: 20,
      fontSize: 16,
      color: 'green',
    },
  });
export default styles;