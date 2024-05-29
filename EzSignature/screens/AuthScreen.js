import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CheckBox from 'expo-checkbox';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import styles from '../styles/AuthStyles';

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
