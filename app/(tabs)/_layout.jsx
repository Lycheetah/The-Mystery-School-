import { Tabs } from 'expo-router'
import { Text, View } from 'react-native'
import { useUserState } from '../../hooks/useUserState'
import { DEPTHS, TOKENS, GLYPHS } from '../../theme'

function TabIcon({ glyph, label, focused, theme }) {
  return (
    <View style={{ alignItems: 'center', gap: 2 }}>
      <Text style={{
        fontFamily: 'Courier New',
        fontSize: focused ? 18 : 15,
        color: focused ? theme.accent : theme.textDim,
      }}>
        {glyph}
      </Text>
      <Text style={{
        fontSize: 9,
        letterSpacing: 0.8,
        color: focused ? theme.accent : theme.textDim,
        textTransform: 'uppercase',
      }}>
        {label}
      </Text>
    </View>
  )
}

export default function TabLayout() {
  const { state } = useUserState()
  const theme = DEPTHS[state.depthKey || 'NIGREDO']

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textDim,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon glyph="⟟" label="Home" focused={focused} theme={theme} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon glyph="✧" label="Map" focused={focused} theme={theme} />
          ),
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon glyph="Ψ" label="Practice" focused={focused} theme={theme} />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon glyph="≋" label="Journal" focused={focused} theme={theme} />
          ),
        }}
      />
      <Tabs.Screen
        name="spiral"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon glyph="⟲" label="Journey" focused={focused} theme={theme} />
          ),
        }}
      />
    </Tabs>
  )
}
