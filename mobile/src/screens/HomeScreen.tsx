// mobile/src/screens/HomeScreen.tsx
import React, { useState, useCallback } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import MapView, { Marker, Callout } from 'react-native-maps'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import api from '../services/api'

const STATUS_COLORS: Record<string, string> = {
  OPEN: '#E74C3C', UNDER_REVIEW: '#F39C12',
  IN_PROGRESS: '#2980B9', RESOLVED: '#27AE60', REJECTED: '#95A5A6',
}

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Aberto', UNDER_REVIEW: 'Em análise', IN_PROGRESS: 'Em andamento', RESOLVED: 'Resolvido', REJECTED: 'Rejeitado',
}

const CATEGORY_LABELS: Record<string, string> = {
  ROAD: '🛣️ Via/Buraco', LIGHTING: '💡 Iluminação', GARBAGE: '🗑️ Lixo',
  FLOODING: '🌊 Alagamento', WATER: '💧 Falta de Água', ENERGY: '⚡ Falta de Luz', OTHER: '📌 Outro',
}

export default function HomeScreen() {
  const navigation = useNavigation<any>()
  const [occurrences, setOccurrences] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useFocusEffect(
    useCallback(() => {
      let active = true
      setLoading(true)
      api.get('/occurrences/map')
        .then(r => { if (active) setOccurrences(r.data) })
        .catch(err => console.error(err))
        .finally(() => { if (active) setLoading(false) })
      return () => { active = false }
    }, [])
  )

  // Apenas ocorrências com coordenadas válidas aparecem no mapa
  const validOccurrences = occurrences.filter(
    o => typeof o.latitude === 'number' && typeof o.longitude === 'number'
  )

  const stats = {
    total: occurrences.length,
    open: occurrences.filter(o => o.status === 'OPEN').length,
    resolved: occurrences.filter(o => o.status === 'RESOLVED').length,
  }

  return (
    <View style={styles.container}>
      {/* Stats bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}><Text style={styles.statVal}>{stats.total}</Text><Text style={styles.statLbl}>Total</Text></View>
        <View style={[styles.statItem, styles.statBorder]}><Text style={[styles.statVal, { color: '#E74C3C' }]}>{stats.open}</Text><Text style={styles.statLbl}>Abertos</Text></View>
        <View style={styles.statItem}><Text style={[styles.statVal, { color: '#27AE60' }]}>{stats.resolved}</Text><Text style={styles.statLbl}>Resolvidos</Text></View>
      </View>

      {/* Map */}
      {loading ? (
        <View style={styles.loadingBox}><ActivityIndicator size="large" color="#1A3560" /></View>
      ) : (
        <MapView
          style={styles.map}
          initialRegion={{ latitude: -3.8694, longitude: -38.4983, latitudeDelta: 0.06, longitudeDelta: 0.06 }}
          showsUserLocation
          showsMyLocationButton
        >
          {validOccurrences.map(occ => (
            <Marker
              key={occ.id}
              coordinate={{ latitude: occ.latitude, longitude: occ.longitude }}
              pinColor={STATUS_COLORS[occ.status] ?? '#999'}
              onCalloutPress={() => navigation.navigate('OccurrenceDetail', { id: occ.id })}
            >
              <Callout tooltip onPress={() => navigation.navigate('OccurrenceDetail', { id: occ.id })}>
                <View style={styles.callout}>
                  <Text style={styles.calloutCat}>{CATEGORY_LABELS[occ.category] ?? occ.category}</Text>
                  <Text style={styles.calloutTitle}>{occ.title}</Text>
                  {!!occ.neighborhood && <Text style={styles.calloutSub}>{occ.neighborhood}</Text>}
                  <Text style={[styles.calloutStatus, { color: STATUS_COLORS[occ.status] }]}>
                    {STATUS_LABELS[occ.status] ?? occ.status}
                  </Text>
                  <Text style={styles.calloutTap}>Toque para ver detalhes</Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('NewOccurrence')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  statsBar: { flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#EEE' },
  statItem: { flex: 1, alignItems: 'center' },
  statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#EEE' },
  statVal: { fontSize: 20, fontWeight: 'bold', color: '#1A3560' },
  statLbl: { fontSize: 11, color: '#888', marginTop: 2 },
  map: { flex: 1 },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  callout: { width: 210, padding: 12, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E5E5E5' },
  calloutCat: { fontSize: 12, color: '#2E5FA3', fontWeight: 'bold', marginBottom: 4 },
  calloutTitle: { fontWeight: 'bold', fontSize: 14, color: '#1A3560', marginBottom: 2 },
  calloutSub: { fontSize: 11, color: '#888' },
  calloutStatus: { fontWeight: 'bold', fontSize: 12, marginTop: 4 },
  calloutTap: { fontSize: 10, color: '#2E5FA3', marginTop: 6, fontStyle: 'italic' },
  fab: { position: 'absolute', bottom: 28, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#1A3560', justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6 },
  fabText: { fontSize: 30, color: '#fff', fontWeight: '300' },
})
