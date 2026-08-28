import React from 'react';
import { View, Text, Modal, ActivityIndicator, StyleSheet } from 'react-native';

export default function LoaderModal({ visible = false, text = 'Authenticating...' }) {
  return (
    <Modal transparent={true} animationType="fade" visible={visible}>
      <View style={styles.modalOverlay}>
        <View style={styles.loaderCard}>
          <ActivityIndicator size="large" color="#25AAE2" style={{ marginBottom: 12 }} />
          <Text style={styles.loaderText}>{text}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  loaderText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
});
