import React, { useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Colors } from '../theme/colors';

interface Props {
  visible: boolean;
  onClose: () => void;
  onPhotoCaptured: (localUri: string) => void;
}

export default function CameraModal({ visible, onClose, onPhotoCaptured }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  async function takePicture() {
    const result = await cameraRef.current?.takePictureAsync({ quality: 0.7, base64: false });
    if (result?.uri) {
      onPhotoCaptured(result.uri);
      onClose();
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      {!permission?.granted ? (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            Camera access is required to capture evidence
          </Text>
          <TouchableOpacity style={styles.grantBtn} onPress={requestPermission}>
            <Text style={styles.grantBtnText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelTextBtn} onPress={onClose}>
            <Text style={styles.cancelTextBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.cameraContainer}>
          <CameraView ref={cameraRef} facing="back" style={styles.camera} />
          <View style={styles.controls}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shutterOuter} onPress={takePicture}>
              <View style={styles.shutterInner} />
            </TouchableOpacity>
            {/* Spacer mirrors the Cancel button width to keep shutter centred */}
            <View style={{ width: 80 }} />
          </View>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  permissionContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  permissionText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  grantBtn: {
    backgroundColor: Colors.green,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  grantBtnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  cancelTextBtn: { paddingVertical: 10, paddingHorizontal: 16 },
  cancelTextBtnText: { color: '#94A3B8', fontSize: 14 },
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  controls: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
  },
  cancelBtn: { width: 80, alignItems: 'center' },
  cancelBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  shutterOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1C1C1E',
  },
});
