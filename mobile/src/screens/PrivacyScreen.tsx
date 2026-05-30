// mobile/src/screens/PrivacyScreen.tsx
import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'

export default function PrivacyScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text style={styles.title}>Política de Privacidade</Text>
        <Text style={styles.subtitle}>Cidade Conectada CE — 2026</Text>

        <Text style={styles.h2}>1. Quem somos</Text>
        <Text style={styles.p}>O Cidade Conectada CE é uma plataforma de registro e acompanhamento de problemas urbanos no município de Horizonte/CE. O responsável pelo tratamento dos dados (controlador) é Leandro Gonçalves Nascimento.</Text>

        <Text style={styles.h2}>2. Dados que coletamos</Text>
        <Text style={styles.p}>Conforme a LGPD (Lei nº 13.709/2018), coletamos: nome completo, e-mail, telefone (opcional), senha (criptografada), localização (GPS) e fotos do problema relatado.</Text>

        <Text style={styles.h2}>3. Como usamos seus dados</Text>
        <Text style={styles.p}>Usamos os dados exclusivamente para registrar e encaminhar as ocorrências aos órgãos competentes (Prefeitura, Cagece, Enel), permitir o acompanhamento do status e melhorar o serviço. Não vendemos nem compartilhamos seus dados para fins comerciais.</Text>

        <Text style={styles.h2}>4. Compartilhamento</Text>
        <Text style={styles.p}>As informações da ocorrência (incluindo localização e foto) podem ser encaminhadas aos órgãos públicos responsáveis pela resolução do problema.</Text>

        <Text style={styles.h2}>5. Seus direitos (LGPD)</Text>
        <Text style={styles.p}>Você pode acessar, corrigir, atualizar ou solicitar a exclusão dos seus dados a qualquer momento, conforme a LGPD.</Text>

        <Text style={styles.h2}>6. Segurança</Text>
        <Text style={styles.p}>Adotamos medidas técnicas para proteger seus dados, incluindo criptografia de senhas e comunicação segura (HTTPS).</Text>

        <Text style={styles.h2}>7. Consentimento</Text>
        <Text style={styles.p}>Ao criar uma conta e utilizar o Cidade Conectada CE, você declara estar ciente e de acordo com esta Política de Privacidade.</Text>

        <Text style={styles.footer}>© 2026 Cidade Conectada CE — Todos os direitos reservados. Projeto desenvolvido por Leandro Gonçalves Nascimento.</Text>

        <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
          <Text style={styles.btnText}>Voltar</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1A3560', marginBottom: 2 },
  subtitle: { fontSize: 12, color: '#888', marginBottom: 20 },
  h2: { fontSize: 15, fontWeight: 'bold', color: '#1A3560', marginTop: 18, marginBottom: 4 },
  p: { fontSize: 13, color: '#444', lineHeight: 20 },
  footer: { fontSize: 11, color: '#888', marginTop: 24, lineHeight: 16, fontStyle: 'italic' },
  btn: { backgroundColor: '#2E5FA3', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 24 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
})