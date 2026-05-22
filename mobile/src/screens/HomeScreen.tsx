// mobile/src/screens/HomeScreen.tsx
import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native'
import MapView, { Marker, Callout } from 'react-native-maps'
import { useNavigation } from '@react-navigation/native'
import api from '../services/api'

const STATUS_COLORS: Record<string, string> = {
  OPEN: '#E74C3C', UNDER_REVIEW: '#F39C12',
  IN_PROGRESS: '#2980B9', RESOLVED: '#27AE60', REJECTED: '#95A5A6',
}

export default function HomeScreen() {
  const navigation = useNavigation<any>()
  const [occurrences, setOccurrences] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/occurrences/map')
      .then(r => setOccurrences(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

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
          initialRegion={{ latitude: -3.8694, longitude: -38.4983, latitudeDelta: 0.04, longitudeDelta: 0.04 }}
          showsUserLocation
          showsMyLocationButton
        >
          {occurrences.map(occ => (
            <Marker
              key={occ.id}
              coordinate={{ latitude: occ.latitude, longitude: occ.longitude }}
              pinColor={STATUS_COLORS[occ.status] ?? '#999'}
            >
              <Callout onPress={() => navigation.navigate('OccurrenceDetail', { id: occ.id })}>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{occ.title}</Text>
                  <Text style={styles.calloutSub}>{occ.neighborhood ?? ''}</Text>
                  <Text style={[styles.calloutStatus, { color: STATUS_COLORS[occ.status] }]}>
                    {occ.status === 'OPEN' ? 'Aberto' : occ.status === 'RESOLVED' ? 'Resolvido' : 'Em andamento'}
                  </Text>
                  <Text style={styles.calloutTap}>Toque para ver detalhes →</Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('NewOccurrence')}>
        <Text style={styles.fabText}>➕</Text>
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
  callout: { width: 200, padding: 8 },
  calloutTitle: { fontWeight: 'bold', fontSize: 13, color: '#1A3560', marginBottom: 2 },
  calloutSub: { fontSize: 11, color: '#888' },
  calloutStatus: { fontWeight: 'bold', fontSize: 12, marginTop: 4 },
  calloutTap: { fontSize: 10, color: '#2E5FA3', marginTop: 4, fontStyle: 'italic' },
  fab: { position: 'absolute', bottom: 28, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#1A3560', justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6 },
  fabText: { fontSize: 24 },
})
