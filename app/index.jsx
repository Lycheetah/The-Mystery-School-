import { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { KEYS } from '../data/schema'
import { DEPTHS } from '../theme'

export default function EntryPoint() {
  const router = useRouter()

  useEffect(() => {
    async function route() {
      try {
        const raw = await AsyncStorage.getItem(KEYS.USER_STATE)
        const state = raw ? JSON.parse(raw) : null

        if (!state || !state.onboarded) {
          router.replace('/onboarding')
        } else {
          router.replace('/(tabs)/home')
        }
      } catch {
        router.replace('/onboarding')
      }
    }
    route()
  }, [])

  const bg = DEPTHS.NIGREDO.bg

  return (
    <View style={{ flex: 1, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color="#C9A84C" size="large" />
    </View>
  )
}
