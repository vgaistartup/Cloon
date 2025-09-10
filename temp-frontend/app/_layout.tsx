import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="biometric-setup" />
      <Stack.Screen name="pin-setup" />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="upload" />
      <Stack.Screen name="guided-capture" />
      <Stack.Screen name="photo-review" />
      <Stack.Screen name="avatar-gallery" />
    </Stack>
  );
}