import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Alert,
  ScrollView,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from '@/components/Icon';
import * as ImagePicker from 'expo-image-picker';
import Screen from '@/components/Screen';
import Button from '@/components/Button';
import { UploadService } from '@/services/upload';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

const { width } = Dimensions.get('window');

export default function UploadScreen() {
  const router = useRouter();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need camera roll permissions to upload photos.'
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need camera permissions to take photos.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    if (selectedImages.length === 0) {
      Alert.alert('No Images', 'Please select at least one image to upload.');
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = selectedImages.map(uri => 
        UploadService.uploadPhoto(uri, `photo_${Date.now()}.jpg`)
      );
      
      const results = await Promise.all(uploadPromises);
      const successCount = results.filter(r => r.success).length;
      
      Alert.alert(
        'Upload Complete',
        `${successCount} of ${selectedImages.length} images uploaded successfully.`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Upload Failed', 'Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Upload Photos</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>Upload Your Photos</Text>
          <Text style={styles.instructionText}>
            Add photos of yourself to create amazing AI-generated avatars. 
            For best results, use clear, well-lit photos.
          </Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
            <Icon name="camera" size={32} color={Colors.accent} />
            <Text style={styles.actionButtonText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
            <Icon name="images" size={32} color={Colors.accent} />
            <Text style={styles.actionButtonText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </View>

        {selectedImages.length > 0 && (
          <View style={styles.imagesSection}>
            <Text style={styles.sectionTitle}>Selected Photos ({selectedImages.length})</Text>
            <View style={styles.imagesGrid}>
              {selectedImages.map((uri, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeImage(index)}
                  >
                    <Icon name="close" size={20} color={Colors.background} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {selectedImages.length > 0 && (
        <View style={styles.footer}>
          <Button
            title="Upload Photos"
            onPress={uploadImages}
            loading={uploading}
            style={styles.uploadButton}
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,              // Light gray #E5E5EA
  },
  title: {
    fontSize: Typography.fontSize.h2,            // 23px section header
    fontWeight: Typography.fontWeight.semibold,   // SemiBold weight
    fontFamily: Typography.fontFamily,            // Inter typeface
    color: Colors.text.primary,                   // Black text
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  instructions: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  instructionTitle: {
    fontSize: Typography.fontSize.h2,            // 23px section header
    fontWeight: Typography.fontWeight.semibold,   // SemiBold weight
    fontFamily: Typography.fontFamily,            // Inter typeface
    color: Colors.text.primary,                   // Black text
    marginBottom: Spacing.md,
  },
  instructionText: {
    fontSize: Typography.fontSize.body,           // 17px body text
    fontFamily: Typography.fontFamily,            // Inter typeface
    color: Colors.text.secondary,                 // Neutral gray
    textAlign: 'center',
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.background,           // White background
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    shadowColor: Colors.text.primary,            // Black shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,                   // Light gray border
  },
  actionButtonText: {
    fontSize: Typography.fontSize.caption,        // 13px caption
    fontWeight: Typography.fontWeight.medium,     // Medium weight
    fontFamily: Typography.fontFamily,            // Inter typeface
    color: Colors.text.primary,                   // Black text
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  imagesSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.body,           // 17px body text
    fontWeight: Typography.fontWeight.semibold,   // SemiBold weight
    fontFamily: Typography.fontFamily,            // Inter typeface
    color: Colors.text.primary,                   // Black text
    marginBottom: Spacing.md,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  imageContainer: {
    position: 'relative',
    width: (width - Spacing.xl * 2 - Spacing.md) / 2,
    aspectRatio: 3/4,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.lg,
  },
  removeButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.error,                // Red color
    borderRadius: BorderRadius.full,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    padding: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,                // Light gray #E5E5EA
  },
  uploadButton: {
    width: '100%',
  },
});