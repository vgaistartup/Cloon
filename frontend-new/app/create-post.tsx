import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Screen from '@/components/Screen';
import { Colors } from '@/constants/theme';

export default function CreatePostScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [caption, setCaption] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const { imageUri, lookId, brand, timestamp } = params;

  const handlePost = async () => {
    if (!caption.trim()) {
      Alert.alert('Caption required', 'Please add a caption to your post.');
      return;
    }

    setIsPosting(true);
    try {
      // TODO: Implement actual post creation
      console.log('Creating post:', {
        imageUri,
        lookId,
        brand,
        timestamp,
        caption,
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      Alert.alert('Success', 'Your post has been created!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity
          onPress={handlePost}
          disabled={isPosting}
          style={[styles.postButton, isPosting && styles.postButtonDisabled]}
        >
          <Text style={[styles.postButtonText, isPosting && styles.postButtonTextDisabled]}>
            {isPosting ? 'Posting...' : 'Post'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri as string }} style={styles.image} />
          <View style={styles.imageOverlay}>
            <Text style={styles.brandText}>{brand}</Text>
          </View>
        </View>

        <View style={styles.captionContainer}>
          <TextInput
            style={styles.captionInput}
            placeholder="Write a caption..."
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={280}
            placeholderTextColor="#9CA3AF"
          />
          <Text style={styles.charCount}>{caption.length}/280</Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  postButton: {
    backgroundColor: '#111',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  postButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  postButtonTextDisabled: {
    color: '#9CA3AF',
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 3/4,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  brandText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  captionContainer: {
    padding: 16,
  },
  captionInput: {
    fontSize: 16,
    color: '#111',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 8,
  },
});
