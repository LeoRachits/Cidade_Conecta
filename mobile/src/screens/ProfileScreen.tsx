// mobile/src/screens/ProfileScreen.tsx
import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native'
import { useAuth } from '../hooks/useAuth'

export default function ProfileScreen() {
  const { user, logout } = useAuth()

  async function handleLogout() {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ])
  }

  return (
    <ScrollView style={{ backgroundColor: '#F4F6FA' }} contentContainerStyle={{ padding: 20 }}>
      {/* Avatar */}
      <View style={s.avatarBox}>
        <View style={s.avatar}><Text style={s.avatarTxt}>{user?.name?.charAt(0).toUpperCase()}</Text></View>
        <Text style={s.name}>{user?.name}</Text>
        <Text style={s.email}>{user?.email}</Text>
        {user?.role === 'ADMIN' && (
          <View style={s.adminBadge}><Text style={s.adminBadgeTxt}>⚙️ Administrador</Text></View>
        )}
      </View>

      {/* Info */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Informações da Conta</Text>
        <View style={s.row}><Text style={s.rowLabel}>Nome</Text><Text style={s.rowVal}>{user?.name}</Text></View>
        <View style={s.row}><Text style={s.rowLabel}>E-mail</Text><Text style={s.rowVal}>{user?.email}</Text></View>
        <View style={s.row}><Text style={s.rowLabel}>Tipo</Text><Text style={s.rowVal}>{user?.role === 'ADMIN' ? 'Administrador' : 'Cidadão'}</Text></View>
      </View>

      {/* About */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Sobre o Cidade Conectada CE</Text>
        <Text style={s.about}>Plataforma de denúncias e acompanhamento de problemas urbanos em Horizonte – CE. Projeto Acadêmico — Desafios do Ciberespaço 2026.</Text>
        <Text style={s.about}>Repositório: github.com/LeoRachits/Cidade_Conecta</Text>
      </View>

      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
        <Text style={s.logoutTxt}>Sair da conta</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  avatarBox: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1A3560', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarTxt: { fontSize: 36, color: '#fff', fontWeight: 'bold' },
  name: { fontSize: 20, fontWeight: 'bold', color: '#1A3560' },
  email: { fontSize: 13, color: '#888', marginTop: 4 },
  adminBadge: { marginTop: 8, backgroundColor: '#FFF3CD', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  adminBadgeTxt: { fontSize: 12, color: '#856404', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 18, marginBottom: 14, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6 },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#1A3560', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#F0F0F0' },
  rowLabel: { fontSize: 13, color: '#888' },
  rowVal: { fontSize: 13, color: '#333', fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
  about: { fontSize: 12, color: '#666', lineHeight: 18, marginBottom: 6 },
  logoutBtn: { backgroundColor: '#E74C3C', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  logoutTxt: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
})
