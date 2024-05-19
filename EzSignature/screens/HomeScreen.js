// screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Alert, Modal, TouchableOpacity } from 'react-native';
import { Avatar, ButtonGroup, Button } from 'react-native-elements';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import Entypo from "@expo/vector-icons/Entypo";
import { getAuth, signOut } from 'firebase/auth';
import styles from "../styles/Styles";

const initialDocuments = [
  { id: '1', name: 'test_file', date: 'April 5, 2024 at 12:03 PM', status: 'Not Verified' },
  { id: '2', name: 'test_file2', date: 'April 5, 2024 at 12:06 PM', status: 'Verified' },
  { id: '3', name: 'test_file3', date: 'April 5, 2024 at 12:12 PM', status: 'Failed Verification' },
];

export default function HomeScreen() {
  const [documents, setDocuments] = useState(initialDocuments);
  const [modalVisible, setModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [user, setUser] = useState(null);
  const navigation = useNavigation();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        navigation.navigate('Login'); // Redirect to login screen if not authenticated
      }
    });
    return unsubscribe; // Unsubscribe on cleanup
  }, [auth]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Entypo
          name="plus"
          size={30}
          color="#007BFF"
          style={{ marginRight: 15 }}
          onPress={() => setUploadModalVisible(true)}
        />
      ),
      headerLeft: () => (
        <Entypo
          name="menu"
          size={30}
          style={{ marginLeft: 15 }}
          onPress={() => {}}
        />
      ),
      headerTitleAlign: 'center',
    });
  }, [navigation]);

  const handleDelete = (id) => {
    Alert.alert(
      "Delete Document",
      "Are you sure you want to delete this document?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => {
          setDocuments(documents.filter(doc => doc.id !== id));
          setSelectedDocument(null);
          setModalVisible(false);
        } }
      ]
    );
  };

  const handleShare = (id) => {
    Alert.alert("Share Document", `Document with id: ${id} sent.`);
    setSelectedDocument(null);
    setModalVisible(false);
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({});
      if (result.type === 'success') {
        const newDocument = {
          id: (documents.length + 1).toString(),
          name: result.name,
          date: new Date().toLocaleString(),
          status: 'Not Verified',
        };
        setDocuments([...documents, newDocument]);
        setUploadModalVisible(false);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const handleScan = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }
    const result = await ImagePicker.launchCameraAsync();
    if (!result.cancelled) {
      const newDocument = {
        id: (documents.length + 1).toString(),
        name: `Scanned Document ${documents.length + 1}`,
        date: new Date().toLocaleString(),
        status: 'Not Verified',
      };
      setDocuments([...documents, newDocument]);
      setUploadModalVisible(false);
    }
  };

  const openModal = (document) => {
    setSelectedDocument(document);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedDocument(null);
    setModalVisible(false);
  };

  const closeUploadModal = () => {
    setUploadModalVisible(false);
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigation.navigate('Login');
      })
      .catch((error) => {
        console.error('Error logging out:', error);
      });
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Image source={require('../assets/doc-placeholder.png')} style={styles.docImage} />
      <View style={styles.itemTextContainer}>
        <Text style={styles.docName}>{item.name}</Text>
        <Text style={styles.docDate}>{item.date}</Text>
        <Text style={[styles.docStatus, item.status === 'Verified' ? styles.verified : item.status === 'Failed Verification' ? styles.failed : styles.notVerified]}>
          {item.status}
        </Text>
      </View>
      <TouchableOpacity onPress={() => openModal(item)}>
        <Entypo name="dots-three-vertical" size={20} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Avatar
          rounded
          size="large"
          source={{
            uri: 'https://randomuser.me/api/portraits/men/41.jpg',
          }}
        />
        <Text style={styles.profileName}>Fulan</Text>
        <Text style={styles.profileEmail}>fulanwagapat@gmail.com</Text>
      </View>
      <ButtonGroup
        buttons={['Sign Mode', 'Verify Mode']}
        containerStyle={styles.buttonGroup}
        selectedIndex={0}
      />
      <Button title="Logout" onPress={handleLogout} /> {/* Add a logout button for testing */}
      <FlatList
        data={documents}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.documentList}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {selectedDocument && (
              <>
                <View style={styles.modalHeader}>
                  <Image source={require('../assets/doc-placeholder.png')} style={styles.docImageModal} />
                  <View style={styles.modalTextContainer}>
                    <Text style={styles.docName}>{selectedDocument.name}</Text>
                    <Text style={styles.docDate}>{selectedDocument.date}</Text>
                    <Text style={[styles.docStatus, selectedDocument.status === 'Verified' ? styles.verified : selectedDocument.status === 'Failed Verification' ? styles.failed : styles.notVerified]}>
                      {selectedDocument.status}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleShare(selectedDocument.id)}
                >
                  <Text style={styles.buttonTitle}>Share</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: 'red' }]}
                  onPress={() => handleDelete(selectedDocument.id)}
                >
                  <Text style={styles.buttonTitle}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: 'gray' }]}
                  onPress={closeModal}
                >
                  <Text style={styles.buttonTitle}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={uploadModalVisible}
        onRequestClose={closeUploadModal}
      >
        <View style={styles.centeredView}>
          <View style={styles.uploadModalView}>
            <Text style={styles.uploadModalText}>Document Upload</Text>
            <TouchableOpacity
              style={styles.uploadOptionButton}
              onPress={handleImport}
            >
              <Text style={styles.textStyle}>Local Files</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.uploadOptionButton}
              onPress={handleScan}
            >
              <Text style={styles.textStyle}>Camera (OCR)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={closeUploadModal}
            >
              <Text style={styles.textStyle}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
