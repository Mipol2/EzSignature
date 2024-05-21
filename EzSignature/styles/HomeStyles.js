// styles/HomeStyles.js
import { StyleSheet } from 'react-native';

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
  verified: {
    color: 'green',
  },
  notVerified: {
    color: 'gray',
  },
  failed: {
    color: 'red',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalView: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  uploadModalView: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  docImageModal: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  modalTextContainer: {
    flex: 1,
  },
  actionButton: {
    backgroundColor: "#007BFF",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginVertical: 10,
    width: '50%',
    alignItems: 'center',
  },
  buttonTitle: {
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  uploadOptionButton: {
    backgroundColor: "#007BFF",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginVertical: 10,
    width: '50%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: "gray",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginVertical: 10,
    width: '50%',
    alignItems: 'center',
  },
  uploadModalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default styles;