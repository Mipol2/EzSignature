import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CheckBox from 'expo-checkbox';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';
const { width, height } = Dimensions.get('window');

const errorMessages = {
  'auth/email-already-in-use': 'The email address is already in use.',
  'auth/invalid-email': 'The email address is not valid.',
  'auth/operation-not-allowed': 'Operation not allowed.',
  'auth/weak-password': 'The password is too weak.',
  'auth/user-disabled': 'The user account has been disabled.',
  'auth/user-not-found': 'No user found with this email.',
  'auth/wrong-password': 'The password is incorrect.',
};

export default function AuthScreen() {
  const navigation = useNavigation();
  const [currentScreen, setCurrentScreen] = useState('initial');
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [message, setMessage] = useState('');

  const handleRegister = () => {
    if (!agree) {
      setMessage('You must agree to the terms and conditions.');
      return;
    }
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        sendEmailVerification(userCredential.user)
          .then(() => {
            setMessage('Verification Email Sent');
            switchScreen('login');
          })
          .catch((error) => {
            setMessage('Error sending verification email.');
          });
      })
      .catch((error) => {
        setMessage(errorMessages[error.code] || 'An error occurred.');
      });
  };

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setMessage('User logged in successfully!');
        navigation.navigate('Home'); 
      })
      .catch((error) => {
        setMessage(errorMessages[error.code] || 'An error occurred.');
      });
  };

  const handlePasswordReset = () => {
    if (!email) {
      setMessage('Please enter your email address to reset your password.');
      return;
    }
    sendPasswordResetEmail(auth, email)
      .then(() => {
        setMessage('Password reset email sent!');
      })
      .catch((error) => {
        setMessage(errorMessages[error.code] || 'An error occurred.');
      });
  };

  const resetFields = () => {
    setName('');
    setEmail('');
    setPassword('');
    setAgree(false);
    setMessage('');
  };

  const switchScreen = (screen) => {
    resetFields();
    setCurrentScreen(screen);
  };

  if (currentScreen === 'initial') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.initialContainer}>
          <View style={styles.logoContainer}>
            <Image source={require('../assets/EZSig.png')} style={styles.logo} />
            <Text style={styles.title}>EZSignature</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.loginButton} onPress={() => switchScreen('login')}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.signupButton} onPress={() => switchScreen('signup')}>
              <Text style={styles.signupButtonText}>Signup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (currentScreen === 'resetPassword') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.navigationBar}>
            <TouchableOpacity style={styles.backButton} onPress={() => switchScreen('login')}>
              <Ionicons name="arrow-back" size={24} color="#1D232E" />
            </TouchableOpacity>
            <Text style={styles.pageTitle}>Reset Password</Text>
          </View>
          <View style={styles.form}>
            <Text style={styles.resetPasswordInstruction}>
              Enter your email, we will send the reset password link
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
            />
            <TouchableOpacity style={styles.button} onPress={handlePasswordReset}>
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
            {message ? <Text style={styles.message}>{message}</Text> : null}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.navigationBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => switchScreen('initial')}>
            <Ionicons name="arrow-back" size={24} color="#1D232E" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>{currentScreen === 'login' ? 'Log In' : 'Sign Up'}</Text>
        </View>
        <Image source={require('../assets/EZSig.png')} style={styles.logo} />
        <View style={styles.form}>
          {currentScreen === 'signup' && (
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={name}
              onChangeText={setName}
            />
          )}
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {currentScreen === 'signup' && (
            <View style={styles.checkboxContainer}>
              <CheckBox
                value={agree}
                onValueChange={setAgree}
                style={styles.checkbox}
              />
              <Text style={styles.label}>
                I have read and agree to the
                <Text style={styles.link}> privacy policy </Text>
                and
                <Text style={styles.link}> terms of use </Text>
                of EZSignature
              </Text>
            </View>
          )}
          <TouchableOpacity style={styles.button} onPress={currentScreen === 'login' ? handleLogin : handleRegister}>
            <Text style={styles.buttonText}>{currentScreen === 'login' ? 'Log In' : 'Sign Up'}</Text>
          </TouchableOpacity>
          {currentScreen === 'login' && (
            <TouchableOpacity onPress={() => switchScreen('resetPassword')}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}
          {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

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
    marginTop: '15%', // Move the logo and title to the upper side of the screen
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
