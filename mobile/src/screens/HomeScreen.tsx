// mobile/src/screens/HomeScreen.tsx
import React, { useState, useCallback } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import MapView, { Marker } from 'react-native-maps'
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
  const [selected, setSelected] = useState<any | null>(null)

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
          onPress={() => setSelected(null)}
        >
          {validOccurrences.map(occ => (
            <Marker
              key={occ.id}
              coordinate={{ latitude: occ.latitude, longitude: occ.longitude }}
              pinColor={STATUS_COLORS[occ.status] ?? '#999'}
              onPress={() => setSelected(occ)}
            />
          ))}
        </MapView>
      )}

      {/* Painel inferior ao selecionar um marcador */}
      {selected && (
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelCat}>{CATEGORY_LABELS[selected.category] ?? selected.category}</Text>
            <TouchableOpacity onPress={() => setSelected(null)}>
              <Text style={styles.panelClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.panelTitle}>{selected.title}</Text>
          {!!selected.neighborhood && <Text style={styles.panelSub}>📍 {selected.neighborhood}</Text>}
          <View style={[styles.panelStatus, { backgroundColor: (STATUS_COLORS[selected.status] ?? '#999') + '20' }]}>
            <Text style={[styles.panelStatusTxt, { color: STATUS_COLORS[selected.status] ?? '#999' }]}>
              {STATUS_LABELS[selected.status] ?? selected.status}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.panelBtn}
            onPress={() => { const id = selected.id; setSelected(null); navigation.navigate('OccurrenceDetail', { id }) }}
          >
            <Text style={styles.panelBtnTxt}>Ver detalhes completos →</Text>
          </TouchableOpacity>
        </View>
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
  panel: {
    position: 'absolute', bottom: 24, left: 16, right: 16,
    backgroundColor: '#fff', borderRadius: 16, padding: 18,
    elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12,
  },
  panelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  panelCat: { fontSize: 13, color: '#2E5FA3', fontWeight: 'bold' },
  panelClose: { fontSize: 18, color: '#999', fontWeight: 'bold', paddingHorizontal: 4 },
  panelTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A3560', marginTop: 6 },
  panelSub: { fontSize: 13, color: '#888', marginTop: 4 },
  panelStatus: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginTop: 10 },
  panelStatusTxt: { fontSize: 12, fontWeight: 'bold' },
  panelBtn: { backgroundColor: '#1A3560', borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 16 },
  panelBtnTxt: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  fab: { position: 'absolute', bottom: 28, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#1A3560', justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6 },
  fabText: { fontSize: 30, color: '#fff', fontWeight: '300' },
})
