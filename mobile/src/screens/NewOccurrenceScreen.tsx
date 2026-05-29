// mobile/src/screens/NewOccurrenceScreen.tsx
// Tela principal: registro de ocorrÃªncia com cÃ¢mera nativa e GPS automÃ¡tico
import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Image,
  KeyboardAvoidingView, Platform,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as Location from 'expo-location'
import api from '../services/api'

type Category = 'ROAD' | 'LIGHTING' | 'GARBAGE' | 'FLOODING' | 'WATER' | 'ENERGY' | 'OTHER'

const CATEGORIES: { value: Category; label: string; icon: string }[] = [
  { value: 'ROAD',     label: 'Via / Buraco',   icon: 'ðŸ›£ï¸' },
  { value: 'LIGHTING', label: 'IluminaÃ§Ã£o',      icon: 'ðŸ’¡' },
  { value: 'GARBAGE',  label: 'Lixo',            icon: 'ðŸ—‘ï¸' },
  { value: 'FLOODING', label: 'Alagamento',      icon: 'ðŸŒŠ' },
  { value: 'WATER',    label: 'Falta de Ãgua',   icon: 'ðŸ’§' },
  { value: 'ENERGY',   label: 'Falta de Luz',    icon: 'âš¡' },
  { value: 'OTHER',    label: 'Outro',            icon: 'ðŸ“Œ' },
]

export default function NewOccurrenceScreen({ navigation }: any) {
  const [title, setTitle]             = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory]       = useState<Category | null>(null)
  const [address, setAddress]         = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [photo, setPhoto]             = useState<{ uri: string; base64?: string } | null>(null)
  const [coords, setCoords]           = useState<{ lat: number; lng: number } | null>(null)
  const [locating, setLocating]       = useState(false)
  const [submitting, setSubmitting]   = useState(false)

  // â”€â”€ CÃ¢mera / Galeria â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async function openCamera() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('PermissÃ£o necessÃ¡ria', 'Permita acesso Ã  cÃ¢mera nas configuraÃ§Ãµes.')
      return
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [4, 3],
    })
    if (!result.canceled) setPhoto({ uri: result.assets[0].uri })
  }

  async function openGallery() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('PermissÃ£o necessÃ¡ria', 'Permita acesso Ã  galeria nas configuraÃ§Ãµes.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [4, 3],
    })
    if (!result.canceled) setPhoto({ uri: result.assets[0].uri })
  }

  // â”€â”€ GPS automÃ¡tico â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async function getLocation() {
    setLocating(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('PermissÃ£o negada', 'Permita acesso Ã  localizaÃ§Ã£o nas configuraÃ§Ãµes.')
        return
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
      setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude })

      // GeocodificaÃ§Ã£o reversa para preencher endereÃ§o
      const [place] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      })
      if (place) {
        setAddress(`${place.street ?? ''}, ${place.streetNumber ?? ''}`.trim().replace(/,$/, ''))
        setNeighborhood(place.district ?? place.subregion ?? '')
      }
    } catch {
      Alert.alert('Erro', 'NÃ£o foi possÃ­vel obter a localizaÃ§Ã£o.')
    } finally {
      setLocating(false)
    }
  }

  // â”€â”€ Envio â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async function handleSubmit() {
    if (!title.trim())       { Alert.alert('AtenÃ§Ã£o', 'Informe um tÃ­tulo'); return }
    if (!category)           { Alert.alert('AtenÃ§Ã£o', 'Selecione uma categoria'); return }
    if (!description.trim()) { Alert.alert('AtenÃ§Ã£o', 'Descreva o problema'); return }
    if (!coords)             { Alert.alert('AtenÃ§Ã£o', 'Use o botÃ£o GPS para obter a localizaÃ§Ã£o'); return }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', title.trim())
      formData.append('description', description.trim())
      formData.append('category', category)
      formData.append('latitude', String(coords.lat))
      formData.append('longitude', String(coords.lng))
      if (address)      formData.append('address', address)
      if (neighborhood) formData.append('neighborhood', neighborhood)

      if (photo) {
        const filename = photo.uri.split('/').pop() ?? 'photo.jpg'
        const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg'
        const mime = ext === 'png' ? 'image/png' : 'image/jpeg'
        formData.append('photo', { uri: photo.uri, name: filename, type: mime } as any)
      }

      const { data } = await api.post('/occurrences', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      Alert.alert(
        'âœ… OcorrÃªncia Registrada!',
        'A Prefeitura foi notificada automaticamente por e-mail. Acompanhe o andamento na aba "Minhas".',
        [{ text: 'Ver detalhes', onPress: () => navigation.navigate('OccurrenceDetail', { id: data.id }) }],
      )

      // Reset form
      setTitle(''); setDescription(''); setCategory(null)
      setAddress(''); setNeighborhood(''); setPhoto(null); setCoords(null)

    } catch (err: any) {
      const msg = err.response?.data?.details
        ? err.response.data.details.map((d: any) => d.message).join('\n')
        : (err.response?.data?.error ?? 'Erro ao enviar. Verifique sua conexÃ£o.')
      Alert.alert('Erro', msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">

        <Text style={styles.screenTitle}>ðŸ“¢ Registrar OcorrÃªncia</Text>
        <Text style={styles.hint}>Preencha os dados e tire uma foto do problema</Text>

        {/* TÃ­tulo */}
        <Text style={styles.label}>TÃ­tulo *</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle}
          placeholder="Ex: Buraco na calÃ§ada da Rua das Flores" maxLength={100} />

        {/* Categoria */}
        <Text style={styles.label}>Categoria *</Text>
        <View style={styles.catGrid}>
          {CATEGORIES.map(c => (
            <TouchableOpacity
              key={c.value}
              style={[styles.catBtn, category === c.value && styles.catBtnActive]}
              onPress={() => setCategory(c.value)}
            >
              <Text style={styles.catIcon}>{c.icon}</Text>
              <Text style={[styles.catLabel, category === c.value && styles.catLabelActive]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* DescriÃ§Ã£o */}
        <Text style={styles.label}>DescriÃ§Ã£o *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description} onChangeText={setDescription}
          placeholder="Descreva o problema com detalhes: hÃ¡ quanto tempo, tamanho, riscos..."
          multiline numberOfLines={4} textAlignVertical="top" maxLength={1000}
        />

        {/* GPS */}
        <Text style={styles.label}>LocalizaÃ§Ã£o *</Text>
        <TouchableOpacity style={styles.gpsBtn} onPress={getLocation} disabled={locating}>
          {locating
            ? <ActivityIndicator color="#2E5FA3" />
            : <Text style={styles.gpsBtnText}>ðŸ“ {coords ? 'âœ… LocalizaÃ§Ã£o obtida â€” toque para atualizar' : 'Usar minha localizaÃ§Ã£o GPS'}</Text>
          }
        </TouchableOpacity>
        {coords && (
          <Text style={styles.coordsText}>
            Lat: {coords.lat.toFixed(5)}  |  Lng: {coords.lng.toFixed(5)}
          </Text>
        )}

        {/* EndereÃ§o (auto-preenchido) */}
        <Text style={styles.label}>EndereÃ§o (auto-preenchido pelo GPS)</Text>
        <TextInput style={styles.input} value={address} onChangeText={setAddress}
          placeholder="Rua, nÃºmero..." />

        <Text style={styles.label}>Bairro</Text>
        <TextInput style={styles.input} value={neighborhood} onChangeText={setNeighborhood}
          placeholder="Nome do bairro" />

        {/* Foto */}
        <Text style={styles.label}>ðŸ“· Foto do problema</Text>
        <View style={styles.photoRow}>
          <TouchableOpacity style={[styles.photoBtn, { marginRight: 8 }]} onPress={openCamera}>
            <Text style={styles.photoBtnText}>ðŸ“· CÃ¢mera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.photoBtn} onPress={openGallery}>
            <Text style={styles.photoBtnText}>ðŸ–¼ï¸ Galeria</Text>
          </TouchableOpacity>
        </View>

        {photo && (
          <View style={styles.photoPreview}>
            <Image source={{ uri: photo.uri }} style={styles.previewImg} resizeMode="cover" />
            <TouchableOpacity style={styles.removePhoto} onPress={() => setPhoto(null)}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>âœ• Remover</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Enviar */}
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit} disabled={submitting}
        >
          {submitting
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitBtnText}>âœ… Enviar OcorrÃªncia</Text>
          }
        </TouchableOpacity>

        <Text style={styles.noteText}>
          Ao enviar, a Prefeitura de Horizonte e a Secretaria de Infraestrutura serÃ£o notificadas automaticamente por e-mail.
        </Text>

      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  screenTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A3560', marginBottom: 4 },
  hint: { fontSize: 13, color: '#888', marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6, marginTop: 16 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#DDD', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#1A1A1A' },
  textArea: { height: 100 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catBtn: { width: '30%', backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#DDD', borderRadius: 12, alignItems: 'center', paddingVertical: 12, marginBottom: 4 },
  catBtnActive: { borderColor: '#2E5FA3', backgroundColor: '#EBF1FB' },
  catIcon: { fontSize: 24, marginBottom: 4 },
  catLabel: { fontSize: 11, color: '#666', textAlign: 'center' },
  catLabelActive: { color: '#1A3560', fontWeight: 'bold' },
  gpsBtn: { backgroundColor: '#EBF1FB', borderWidth: 1.5, borderColor: '#2E5FA3', borderStyle: 'dashed', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  gpsBtnText: { color: '#2E5FA3', fontWeight: '600', fontSize: 14 },
  coordsText: { fontSize: 11, color: '#27AE60', marginTop: 6, textAlign: 'center', fontWeight: '600' },
  photoRow: { flexDirection: 'row' },
  photoBtn: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#DDD', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  photoBtnText: { fontSize: 14, color: '#555', fontWeight: '600' },
  photoPreview: { marginTop: 12, position: 'relative' },
  previewImg: { width: '100%', height: 200, borderRadius: 12 },
  removePhoto: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  submitBtn: { backgroundColor: '#27AE60', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 28 },
  submitBtnDisabled: { backgroundColor: '#7DC79B' },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  noteText: { fontSize: 11, color: '#888', textAlign: 'center', marginTop: 14, lineHeight: 16 },
})
