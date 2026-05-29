// src/app/PrivacyPage.tsx
import { Link } from 'react-router-dom'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-8">
        <Link to="/login" className="text-blue-600 hover:underline text-sm">← Voltar</Link>
        <h1 className="text-2xl font-bold text-blue-900 mt-4 mb-2">Política de Privacidade</h1>
        <p className="text-sm text-gray-500 mb-6">Cidade Conectada CE — Última atualização: 2026</p>

        <div className="space-y-5 text-sm text-gray-700 leading-relaxed">
          <section>
            <h2 className="font-bold text-gray-800 mb-1">1. Quem somos</h2>
            <p>O Cidade Conectada CE é uma plataforma de registro e acompanhamento de problemas urbanos no município de Horizonte/CE. O responsável pelo tratamento dos dados (controlador) é Leandro Gonçalves Nascimento.</p>
          </section>

          <section>
            <h2 className="font-bold text-gray-800 mb-1">2. Dados que coletamos</h2>
            <p>Coletamos os seguintes dados pessoais, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD):</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Nome completo</strong> — para identificação do autor da ocorrência.</li>
              <li><strong>E-mail</strong> — para login e envio de atualizações sobre suas ocorrências.</li>
              <li><strong>Telefone</strong> (opcional) — para contato, caso necessário.</li>
              <li><strong>Senha</strong> — armazenada de forma criptografada (nunca temos acesso à senha original).</li>
              <li><strong>Localização (GPS)</strong> — para georreferenciar o problema relatado.</li>
              <li><strong>Fotos</strong> — imagens do problema urbano que você optar por enviar.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-gray-800 mb-1">3. Como usamos seus dados</h2>
            <p>Os dados são usados exclusivamente para: registrar e encaminhar as ocorrências aos órgãos competentes (Prefeitura, Cagece, Enel); permitir o acompanhamento do status; e melhorar o serviço. Não vendemos nem compartilhamos seus dados com terceiros para fins comerciais.</p>
          </section>

          <section>
            <h2 className="font-bold text-gray-800 mb-1">4. Compartilhamento</h2>
            <p>As informações da ocorrência (incluindo localização e foto) podem ser encaminhadas aos órgãos públicos responsáveis pela resolução do problema, como a Prefeitura Municipal de Horizonte e concessionárias de serviços públicos.</p>
          </section>

          <section>
            <h2 className="font-bold text-gray-800 mb-1">5. Seus direitos (LGPD)</h2>
            <p>Você tem direito a acessar, corrigir, atualizar ou solicitar a exclusão dos seus dados pessoais a qualquer momento, conforme previsto na LGPD. Para exercer esses direitos, entre em contato com o responsável pela plataforma.</p>
          </section>

          <section>
            <h2 className="font-bold text-gray-800 mb-1">6. Segurança</h2>
            <p>Adotamos medidas técnicas para proteger seus dados, incluindo criptografia de senhas e comunicação segura (HTTPS). Apesar dos esforços, nenhum sistema é 100% imune, e nos comprometemos a comunicar eventuais incidentes conforme a legislação.</p>
          </section>

          <section>
            <h2 className="font-bold text-gray-800 mb-1">7. Consentimento</h2>
            <p>Ao criar uma conta e utilizar o Cidade Conectada CE, você declara estar ciente e de acordo com esta Política de Privacidade e com o tratamento dos seus dados conforme aqui descrito.</p>
          </section>

          <section className="pt-4 border-t border-gray-200 text-xs text-gray-500">
            <p>© 2026 Cidade Conectada CE — Todos os direitos reservados. Projeto desenvolvido por Leandro Gonçalves Nascimento.</p>
          </section>
        </div>
      </div>
    </div>
  )
}