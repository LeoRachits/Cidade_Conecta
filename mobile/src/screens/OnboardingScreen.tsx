// mobile/src/screens/OnboardingScreen.tsx
import React, { useState, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native'
import * as SecureStore from 'expo-secure-store'

const { width } = Dimensions.get('window')

const SLIDES = [
  {
    icon: '🏙️',
    title: 'Bem-vindo ao Cidade Conectada CE',
    text: 'O canal direto entre você e a Prefeitura de Horizonte para resolver problemas urbanos.',
  },
  {
    icon: '📸',
    title: 'Registre com foto',
    text: 'Encontrou um buraco, falta de luz ou água? Tire uma foto e registre a ocorrência em segundos.',
  },
  {
    icon: '📍',
    title: 'Localização automática',
    text: 'O app usa o GPS para marcar exatamente onde está o problema. A prefeitura sabe onde agir.',
  },
  {
    icon: '🔔',
    title: 'Acompanhe tudo',
    text: 'Veja o status da sua ocorrência: recebida, em análise, em andamento e resolvida.',
  },
]

export default function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0)
  const scrollRef = useRef<ScrollView>(null)

  function next() {
    if (index < SLIDES.length - 1) {
      const newIndex = index + 1
      setIndex(newIndex)
      scrollRef.current?.scrollTo({ x: newIndex * width, animated: true })
    } else {
      finish()
    }
  }

  async function finish() {
    await SecureStore.setItemAsync('onboardingDone', 'true')
    onDone()
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
      >
        {SLIDES.map((slide, i) => (
          <View key={i} style={[styles.slide, { width }]}>
            <Text style={styles.icon}>{slide.icon}</Text>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.text}>{slide.text}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={finish}>
          <Text style={styles.skip}>Pular</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={next}>
          <Text style={styles.btnText}>{index === SLIDES.length - 1 ? 'Começar' : 'Próximo'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A3560' },
  slide: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  icon: { fontSize: 90, marginBottom: 32 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 16 },
  text: { fontSize: 16, color: '#BDD3F5', textAlign: 'center', lineHeight: 24 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3A5680' },
  dotActive: { backgroundColor: '#fff', width: 24 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 32, paddingBottom: 50 },
  skip: { color: '#BDD3F5', fontSize: 15 },
  btn: { backgroundColor: '#27AE60', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
})