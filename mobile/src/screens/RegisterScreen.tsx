// mobile/src/screens/RegisterScreen.tsx
import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import api from '../services/api'
import { useAuth } from '../hooks/useAuth'

export default function RegisterScreen({ navigation }: any) {
  const { login } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  function update(k: string, v: string) { setForm(p => ({ ...p, [k]: v })) }

  async function handle() {
    if (!form.name || !form.email || !form.password) { Alert.alert('Atenção', 'Preencha todos os campos obrigatórios'); return }
    if (form.password !== form.confirm) { Alert.alert('Erro', 'As senhas não coincidem'); return }
    if (form.password.length < 8) { Alert.alert('Erro', 'A senha deve ter pelo menos 8 caracteres'); return }
    if (!/[A-Z]/.test(form.password)) { Alert.alert('Erro', 'A senha deve ter pelo menos uma letra maiúscula'); return }
    if (!/[0-9]/.test(form.password)) { Alert.alert('Erro', 'A senha deve ter pelo menos um número'); return }
    setLoading(true)
    try {
      const email = form.email.trim().toLowerCase()
      const { data } = await api.post('/auth/register', {
        name: form.name.trim(),
        email,
        password: form.password,
        phone: form.phone || undefined,
      })
      await SecureStore.setItemAsync('accessToken', data.accessToken)
      await SecureStore.setItemAsync('refreshToken', data.refreshToken)
      await login(email, form.password)
    } catch (err: any) {
      const msg = err.response?.data?.details
        ? err.response.data.details.map((d: any) => d.message).join('\n')
        : (err.response?.data?.error ?? 'Erro ao criar conta')
      Alert.alert('Erro', msg)
    } finally { setLoading(false) }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#1A3560' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24, paddingVertical: 50 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Text style={{ fontSize: 42, marginBottom: 8 }}>🏙️</Text>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>Criar Conta</Text>
          <Text style={{ fontSize: 13, color: '#BDD3F5', marginTop: 4 }}>Cidade Conectada CE</Text>
        </View>
        <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 28 }}>
          {[
            { label: 'Nome completo *', key: 'name', placeholder: 'Seu nome', secure: false, keyboard: 'default' as const },
            { label: 'E-mail *', key: 'email', placeholder: 'seu@email.com', secure: false, keyboard: 'email-address' as const },
            { label: 'Telefone', key: 'phone', placeholder: '(85) 99999-0000', secure: false, keyboard: 'phone-pad' as const },
            { label: 'Senha * (mín. 8, 1 maiúscula, 1 número)', key: 'password', placeholder: '••••••••', secure: true, keyboard: 'default' as const },
            { label: 'Confirmar senha *', key: 'confirm', placeholder: '••••••••', secure: true, keyboard: 'default' as const },
          ].map(f => (
            <View key={f.key}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 14 }}>{f.label}</Text>
              <TextInput
                style={{ borderWidth: 1, borderColor: '#DDD', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, backgroundColor: '#FAFAFA' }}
                value={(form as any)[f.key]} onChangeText={v => update(f.key, v)}
                placeholder={f.placeholder} secureTextEntry={f.secure}
                keyboardType={f.keyboard}
                autoCapitalize={f.key === 'name' ? 'words' : 'none'}
                autoCorrect={false}
              />
            </View>
          ))}
          <TouchableOpacity
            style={{ backgroundColor: '#27AE60', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 20, opacity: loading ? 0.7 : 1 }}
            onPress={handle} disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Criar Conta Gratuita</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16, alignItems: 'center' }}>
            <Text style={{ color: '#666', fontSize: 13 }}>Já tem conta? <Text style={{ color: '#2E5FA3', fontWeight: 'bold' }}>Entrar</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
