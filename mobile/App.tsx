// mobile/App.tsx
import React, { useState, useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text, ActivityIndicator, View } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import { AuthProvider, useAuth } from './src/hooks/useAuth'
import OnboardingScreen from './src/screens/OnboardingScreen'
import LoginScreen from './src/screens/LoginScreen'
import RegisterScreen from './src/screens/RegisterScreen'
import HomeScreen from './src/screens/HomeScreen'
import NewOccurrenceScreen from './src/screens/NewOccurrenceScreen'
import MyOccurrencesScreen from './src/screens/MyOccurrencesScreen'
import OccurrenceDetailScreen from './src/screens/OccurrenceDetailScreen'
import ProfileScreen from './src/screens/ProfileScreen'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#1A3560',
        tabBarInactiveTintColor: '#999',
        headerStyle: { backgroundColor: '#1A3560' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Tab.Screen
        name="Home" component={HomeScreen}
        options={{ title: 'Mapa', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🗺️</Text> }}
      />
      <Tab.Screen
        name="NewOccurrence" component={NewOccurrenceScreen}
        options={{ title: 'Denunciar', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>➕</Text> }}
      />
      <Tab.Screen
        name="MyOccurrences" component={MyOccurrencesScreen}
        options={{ title: 'Minhas', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📋</Text> }}
      />
      <Tab.Screen
        name="Profile" component={ProfileScreen}
        options={{ title: 'Perfil', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text> }}
      />
    </Tab.Navigator>
  )
}

function RootNavigator({ showOnboarding, onOnboardingDone }: { showOnboarding: boolean; onOnboardingDone: () => void }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A3560' }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    )
  }

  if (showOnboarding && !user) {
    return <OnboardingScreen onDone={onOnboardingDone} />
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen
            name="OccurrenceDetail" component={OccurrenceDetailScreen}
            options={{ headerShown: true, headerStyle: { backgroundColor: '#1A3560' }, headerTintColor: '#fff', title: 'Detalhe da Ocorrência' }}
          />
        </>
      )}
    </Stack.Navigator>
  )
}

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    SecureStore.getItemAsync('onboardingDone').then((done) => {
      setShowOnboarding(done !== 'true')
      setChecking(false)
    })
  }, [])

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A3560' }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    )
  }

  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator showOnboarding={showOnboarding} onOnboardingDone={() => setShowOnboarding(false)} />
      </NavigationContainer>
    </AuthProvider>
  )
}
