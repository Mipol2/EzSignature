// screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, Alert, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Avatar, ButtonGroup, Button } from 'react-native-elements';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import Entypo from "@expo/vector-icons/Entypo";
import { signOut, updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import styles from "../styles/HomeStyles";
import { auth, storage } from '../firebaseConfig';
import PlaceholderImage from '../assets/people-placeholder.png';
import {RSA, RSAKeychain} from 'react-native-rsa-native';
import RNHash, {
  JSHash,
  JSHmac,
  useHash,
  useHmac,
  CONSTANTS,
} from 'react-native-hash';

// ! TO-DO : masukin ke tempat yang seharusnya, sesuaikan; masukin logic ambil public key

const signFile = async (fileUrl) => {

  // ganti test pake nama user?

  try {
    const publicKey = await RSAKeychain.getPublicKey("com.ezsignature.test");
    if (publicKey != null) {
      const hash = await RNHash.hashFile(fileUrl, CONSTANTS.HashAlgorithms.sha512);
      const sign = await RSA.sign(hash, "com.ezsignature.test");
      return sign;
    } else {
      throw new Error("Key has not been generated!");
    }
  } catch (err) {
      console.error(err);
      return null;
  }

}

const verifyFile = async (fileUrl, publicKey, sign) => {

  // ganti test pake nama user?

  try {
    const hash = await RNHash.hashFile(fileUrl, CONSTANTS.HashAlgorithms.sha512);
    const verify = await RSA.verify(sign, hash, publicKey);
    return verify;
  } catch (err) {
      console.error(err);
      return null;
  }

}


export default function HomeScreen() {
  const [documents, setDocuments] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        fetchDocuments(user.uid);
      } else {
        navigation.navigate('Auth'); 
      }
    });
    return unsubscribe;
  }, [auth]);

  const fetchDocuments = async (userId) => {
    try {
      const storageRef = ref(storage, `documents/${userId}`);
      const result = await listAll(storageRef);
      const docs = await Promise.all(result.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return {
          name: itemRef.name,
          url,
        };
      }));
      setDocuments(docs);
    } catch (error) {
      console.error('Error fetching documents:', error);
      alert(`Error fetching documents: ${error.message}`);
    }
  };

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

  const handleDelete = async (name) => {
    Alert.alert(
      "Delete Document",
      "Are you sure you want to delete this document?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: async () => {
          try {
            const docRef = ref(storage, `documents/${user.uid}/${name}`);
            await deleteObject(docRef);
            setDocuments(documents.filter(doc => doc.name !== name));
            setSelectedDocument(null);
            setModalVisible(false);
          } catch (error) {
            console.error('Error deleting document:', error);
          }
        } }
      ]
    );
  };

  const handleShare = (name) => {
    Alert.alert("Share Document", `Document with name: ${name} shared.`);
    setSelectedDocument(null);
    setModalVisible(false);
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
        navigation.navigate('Auth');
      })
      .catch((error) => {
        console.error('Error logging out:', error);
      });
  };

  const handleUpload = async () => {
    try {
      let result = await DocumentPicker.getDocumentAsync({});
      console.log("DocumentPicker result:", result);
      if (!result.canceled) {
        const pickedDocument = result.assets[0];
        setUploading(true);
        const filePath = `documents/${user.uid}/${pickedDocument.name}`;
        await uploadDocument(pickedDocument, filePath);
        const newDocument = {
          id: (documents.length + 1).toString(),
          name: pickedDocument.name,
          date: new Date().toLocaleString(),
          status: 'Not Signed',
          url: pickedDocument.uri,
          filePath: filePath
        };
        setDocuments([...documents, newDocument]);
      } else {
        console.log("DocumentPicker cancelled or failed");
      }
    } catch (err) {
      console.error("Error picking document:", err);
    }
    setUploading(false);
  };

  const handleScan = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }
    const result = await ImagePicker.launchCameraAsync();
    if (!result.cancelled) {
      setUploading(true);
      const filePath = `documents/${user.uid}/Scanned_Document_${documents.length + 1}`;
      await uploadDocument(result, filePath);
      const newDocument = {
        id: (documents.length + 1).toString(),
        name: `Scanned Document ${documents.length + 1}`,
        date: new Date().toLocaleString(),
        status: 'Not Signed',
        url: result.uri,
        filePath: filePath
      };
      setDocuments([...documents, newDocument]);
    }
    setUploading(false);
  };

  const uploadDocument = async (document, filePath) => {
    try {
      console.log('Uploading document:', document);
      const response = await fetch(document.uri);
      const blob = await response.blob();
      const storageRef = ref(storage, filePath);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      setUrl(downloadURL);
      console.log("Document uploaded successfully:", downloadURL);
    } catch (error) {
      console.error("Error uploading document:", error);
      alert('Error uploading document.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Image source={{ uri: item.url || 'https://via.placeholder.com/150' }} style={styles.docImage} />
      <View style={styles.itemTextContainer}>
        <Text style={styles.docName}>{item.name}</Text>
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
          source={PlaceholderImage}
        />
        <Text style={styles.profileName}>{user?.displayName || user?.email.split('@')[0]}</Text>
        <Text style={styles.profileEmail}>{user?.email}</Text>
      </View>
      <ButtonGroup
        buttons={['Sign Mode', 'Verify Mode']}
        containerStyle={styles.buttonGroup}
        selectedIndex={0}
      />
      <Button title="Logout" onPress={handleLogout} />
      <FlatList
        data={documents}
        renderItem={renderItem}
        keyExtractor={item => item.name}
        style={styles.documentList}
      />
      {uploading && <ActivityIndicator size="large" color="#0000ff" />}
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
                  <Image source={{ uri: selectedDocument.url }} style={styles.docImageModal} />
                  <View style={styles.modalTextContainer}>
                    <Text style={styles.docName}>{selectedDocument.name}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleShare(selectedDocument.name)}
                >
                  <Text style={styles.buttonTitle}>Share</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: 'red' }]}
                  onPress={() => handleDelete(selectedDocument.name)}
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
              onPress={handleUpload}
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
