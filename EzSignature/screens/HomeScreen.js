// screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, Alert, Modal, TouchableOpacity, ActivityIndicator, Share, TextInput } from 'react-native';
import { Avatar, ButtonGroup, Button } from 'react-native-elements';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { useNavigation } from '@react-navigation/native';
import Entypo from "@expo/vector-icons/Entypo";
import { signOut, updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL, listAll, deleteObject, getMetadata } from 'firebase/storage';
import { addDoc, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import styles from "../styles/HomeStyles";
import { auth, storage, db } from '../firebaseConfig';
import PlaceholderImage from '../assets/people-placeholder.png';
import { RSA, RSAKeychain } from 'react-native-rsa-native';
import RNHash, { CONSTANTS } from 'react-native-hash';


// ! TO-DO : masukin pas otentikasi pertama buat generate key, upload public key ke database



// ! TO-DO : masukin ke tempat yang seharusnya, sesuaikan; masukin logic ambil public key






export default function HomeScreen() {
  const [documents, setDocuments] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState('');
  const [newDocumentName, setNewDocumentName] = useState('');
  const [documentUri, setDocumentUri] = useState('');
  const [filePath, setFilePath] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [sign, setSign] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        fetchDocuments(user.uid);
        generateKeychain(user.uid);
      } else {
        navigation.navigate('Auth'); 
      }
    });
    return unsubscribe;
  }, [auth]);

  const generateKeychain = async (userId) => {
  
    // ganti test pake nama user?

    var generated = false;
  
    try {
      const publicKey = await RSAKeychain.getPublicKey(`com.example.ezsignature.${userId}`);
      if (publicKey != null) {
        generated = true;
      } else {
        throw new Error("Key has not been generated, generating...");
      }
    } catch (err) {
      console.error(err);
      alert(`Error getting keychain: ${err.message}`);
    }
  
    if (!generated) {
      const keys = await RSAKeychain.generate(`com.example.ezsignature.${userId}`);
    }
  };

  const signFile = async (userId, fileUrl) => {

    // ganti test pake nama user?

    try {
      const publicKey = await RSAKeychain.getPublicKey(`com.example.ezsignature.${userId}`);
      if (publicKey != null) {
        const cleanUrl = fileUrl.replace('file://', '');
        const hash = await RNHash.hashFile(cleanUrl, CONSTANTS.HashAlgorithms.sha512);
        const sign = await RSAKeychain.sign(hash, `com.example.ezsignature.${userId}`);
        return [publicKey, sign];
      } else {
        alert("Key has not been generated!");
        throw new Error("Key has not been generated!");
      }
    } catch (err) {
      console.error(err);
      alert(`Error signing document: ${err.message}`);
      
      // INI DUMMY BUAT TESTING (cuma kesini kalo yg atas error)
      return ["dummyPublicKey", "dummySignature"];
    }
  };

  const verifyFile = async (userId, fileUrl, publicKey, sign) => {

    // ganti test pake nama user?

    try {
      const cleanUrl = fileUrl.replace('file://', '');
      const hash = await RNHash.hashFile(cleanUrl, CONSTANTS.HashAlgorithms.sha512);
      const verify = await RSAKeychain.verify(sign, hash, publicKey);
      return verify;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const fetchDocuments = async (userId) => {
    try {
      const storageRef = ref(storage, `documents/${userId}`);
      const result = await listAll(storageRef);
      const docs = await Promise.all(result.items.map(async (itemRef) => {
        const [url, metadata] = await Promise.all([
          getDownloadURL(itemRef),
          getMetadata(itemRef)]);
        const { publicKey, sign } = metadata.customMetadata || { publicKey: null, sign: null };
        return {
          name: itemRef.name,
          url,
          publicKey,
          sign
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
  
            // Find and delete the Firestore document
            const querySnapshot = await getDocs(collection(db, 'documents'));
            let docId = null;
            querySnapshot.forEach((doc) => {
              if (doc.data().document_name === name && doc.data().owner_id === user.uid) {
                docId = doc.id;
              }
            });
  
            if (docId) {
              await deleteDoc(doc(db, 'documents', docId));
            }
  
            setDocuments(documents.filter(doc => doc.name !== name));
            setSelectedDocument(null);
            setModalVisible(false);
          } catch (error) {
            console.error('Error deleting document:', error);
            alert('Error deleting document.');
          }
        } }
      ]
    );
  };

  const shareDocument = async (document) => {
    try {
      // Fetch the download URL for the document
      const downloadURL = await getDownloadURL(ref(storage, document.filePath));
      
      const message = `Here is the document: ${document.name}\n\nDocument URL: ${downloadURL}\n\nDigital Signature: ${document.sign}\n\nPublic Key: ${document.publicKey}`;
      await Share.share({
        message,
      });
    } catch (error) {
      console.error('Error sharing document:', error);
    }
  };

  const handleShare = (document) => {
    shareDocument(document);
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

  const closeRenameModal = () => {
    setRenameModalVisible(false);
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
      if (!result.canceled) {
        const pickedDocument = result.assets[0];
        setDocumentUri(pickedDocument.uri);
        setFilePath(`documents/${user.uid}/${pickedDocument.name}`);
        setRenameModalVisible(true);
      }
    } catch (err) {
      console.error("Error picking document:", err);
      alert(`Error picking document: ${err.message}`);
    }
  };

  const handleRenameAndUpload = async () => {
    try {
      setUploading(true);
      const [publicKey, sign] = await signFile(user.uid, documentUri);
      const newFilePath = `documents/${user.uid}/${newDocumentName}.jpg`;
      await uploadDocument({ uri: documentUri, name: `${newDocumentName}.jpg` }, newFilePath, publicKey, sign);
      const newDocument = {
        id: (documents.length + 1).toString(),
        name: `${newDocumentName}.jpg`,
        date: new Date().toLocaleString(),
        status: 'Not Signed',
        publicKey: publicKey,
        sign: sign,
        url: documentUri,
        filePath: newFilePath
      };
      setDocuments([...documents, newDocument]);
      setRenameModalVisible(false);
    } catch (err) {
      console.error("Error uploading document:", err);
      alert(`Error uploading document: ${err.message}`);
    }
    setUploading(false);
  };

  const handleViewSignature = (document) => {
    Alert.alert(
      "Document Signature",
      `Digital Signature: ${document.sign}\n\nPublic Key: ${document.publicKey}`
    );
  };

  const handleScan = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }
    const result = await ImagePicker.launchCameraAsync();
    if (!result.cancelled) {
      setDocumentUri(result.assets[0].uri);
      setFilePath(`documents/${user.uid}/Scanned_Document_${documents.length + 1}`);
      setRenameModalVisible(true);
    }
  };

  const uploadDocument = async (document, filePath, publicKey, sign) => {
    try {
      const response = await fetch(document.uri);
      const blob = await response.blob();
      const storageRef = ref(storage, filePath);
      const metadata = {
        customMetadata: {
          'publicKey': publicKey,
          'sign': sign,
        },
      };
      await uploadBytes(storageRef, blob, metadata);
      const downloadURL = await getDownloadURL(storageRef);
  
      // Add metadata
      const docRef = await addDoc(collection(db, 'documents'), {
        document_name: document.name,
        owner_id: user.uid,
        public_key: publicKey,
        date_created: new Date().toISOString(),
        document_url: downloadURL,
        digital_signature: sign,
      });
  
      console.log("Document uploaded successfully and metadata stored:", docRef.id);
      setUrl(downloadURL);
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
                  onPress={() => handleShare(selectedDocument)}
                >
                  <Text style={styles.textStyle}>Share</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleViewSignature(selectedDocument)}
                >
                  <Text style={styles.textStyle}>View Signature</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: 'red' }]}
                  onPress={() => handleDelete(selectedDocument.name)}
                >
                  <Text style={styles.textStyle}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.cancelButton, { backgroundColor: 'gray' }]}
                  onPress={closeModal}
                >
                  <Text style={styles.textStyle}>Close</Text>
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
              style={styles.actionButton}
              onPress={handleUpload}
            >
              <Text style={styles.textStyle}>Local Files</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleScan}
            >
              <Text style={styles.textStyle}>Camera</Text>
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
      <Modal
        animationType="slide"
        transparent={true}
        visible={renameModalVisible}
        onRequestClose={closeRenameModal}
      >
        <View style={styles.centeredView}>
          <View style={styles.uploadModalView}>
            <Text style={styles.uploadModalText}>Rename Document</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter new document name"
              value={newDocumentName}
              onChangeText={setNewDocumentName}
            />
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleRenameAndUpload}
            >
              <Text style={styles.textStyle}>Upload</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={closeRenameModal}
            >
              <Text style={styles.textStyle}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}