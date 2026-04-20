import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useUserState } from '../hooks/useUserState'

export default function RootLayout() {
  const { loaded } = useUserState()

  if (!loaded) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="threshold" />
        <Stack.Screen name="subject/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="practice/[type]" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="guide" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="settings" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="assessment" options={{ gestureEnabled: false }} />
        <Stack.Screen name="result" options={{ gestureEnabled: false }} />
      </Stack>
    </GestureHandlerRootView>
  )
}
