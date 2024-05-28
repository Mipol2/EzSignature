import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Alert, Modal, TouchableOpacity } from 'react-native';
import { Avatar, ButtonGroup, Icon, Button } from 'react-native-elements';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import Entypo from "@expo/vector-icons/Entypo";
import {RSA, RSAKeychain} from 'react-native-rsa-native';
import RNHash, {JSHash} from 'react-native-hash';

import RNHash, {
  JSHash,
  JSHmac,
  useHash,
  useHmac,
  CONSTANTS,
} from 'react-native-hash';

const initialDocuments = [
  { id: '1', name: 'test_file', date: 'April 5, 2024 at 12:03 PM', status: 'Not Signed' },
  { id: '2', name: 'test_file2', date: 'April 5, 2024 at 12:06 PM', status: 'Signed' },
  { id: '3', name: 'test_file3', date: 'April 5, 2024 at 12:12 PM', status: 'Not Signed' },
];

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
  const [documents, setDocuments] = useState(initialDocuments);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Entypo
          name="plus"
          size={30}
          color="blue"
          style={{ marginRight: 15 }}
          onPress={() => setModalVisible(true)}
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
        } }
      ]
    );
  };

  const handleSend = (id) => {
    Alert.alert("Send Document", `Document with id: ${id} sent.`);
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({});
      if (result.type === 'success') {
        const newDocument = {
          id: (documents.length + 1).toString(),
          name: result.name,
          date: new Date().toLocaleString(),
          status: 'Not Signed',
        };
        setDocuments([...documents, newDocument]);
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
        status: 'Not Signed',
      };
      setDocuments([...documents, newDocument]);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Image source={require('../assets/doc-placeholder.png')} style={styles.docImage} />
      <View style={styles.itemTextContainer}>
        <Text style={styles.docName}>{item.name}</Text>
        <Text style={styles.docDate}>{item.date}</Text>
        <Text style={[styles.docStatus, item.status === 'Signed' ? styles.signed : styles.notSigned]}>
          {item.status}
        </Text>
      </View>
      <View style={styles.itemButtons}>
        <Button title="Delete" onPress={() => handleDelete(item.id)} />
        <Button title="Send" onPress={() => handleSend(item.id)} />
      </View>
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
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Document Upload</Text>
          <TouchableOpacity
            style={styles.openButton}
            onPress={() => {
              setModalVisible(!modalVisible);
              handleImport();
            }}
          >
            <Text style={styles.textStyle}>Local Files</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.openButton}
            onPress={() => {
              setModalVisible(!modalVisible);
              handleScan();
            }}
          >
            <Text style={styles.textStyle}>Camera (OCR)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
            onPress={() => {
              setModalVisible(!modalVisible);
            }}
          >
            <Text style={styles.textStyle}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profileContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  profileEmail: {
    fontSize: 16,
    color: 'gray',
  },
  buttonGroup: {
    marginBottom: 20,
  },
  documentList: {
    paddingHorizontal: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  docImage: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  itemTextContainer: {
    flex: 1,
  },
  docName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  docDate: {
    fontSize: 14,
    color: 'gray',
  },
  docStatus: {
    fontSize: 14,
    marginTop: 5,
  },
  signed: {
    color: 'green',
  },
  notSigned: {
    color: 'red',
  },
  itemButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  openButton: {
    backgroundColor: "#F194FF",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginVertical: 10,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
});
