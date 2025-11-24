import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import authApi from '../services/authApi'
import api from '../services/api' 
import {
  ArrowLeft,
  Lock,
  EnvelopeSimple,
  User,
  Phone,
  MapPin,
  SignIn,
  UserPlus
} from '@phosphor-icons/react'

type LoginProps = {
  onBack?: () => void
}

type MessageState = {
  text: string
  type: 'success' | 'error' | 'info'
}

export function Login({ onBack }: LoginProps) {
  const { signIn, loading } = useAuth()

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [regName, setRegName] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regAddress, setRegAddress] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('')

  const [message, setMessage] = useState<MessageState | null>(null)

  useEffect(() => {
    if (!message || message.type === 'info') return
    const timer = setTimeout(() => setMessage(null), 4000)
    return () => clearTimeout(timer)
  }, [message])

  const showMessage = (text: string, type: MessageState['type']) => {
    setMessage({ text, type })
  }

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage(null)

    try {
      await signIn(loginEmail, loginPassword)
      showMessage('Login realizado com sucesso!', 'success')
    } catch (err: any) {
      if (err?.response?.data?.error) {
        showMessage(err.response.data.error, 'error')
      } else if (err?.code === 'ERR_NETWORK') {
        showMessage('Servidor indisponível. Tente novamente em instantes.', 'error')
      } else {
        console.error('Erro inesperado no login:', err)
        showMessage('Não foi possível realizar o login. Verifique os dados e tente novamente.', 'error')
      }
    }
  }

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage(null)

    if (!regName || !regPhone || !regEmail || !regPassword) {
      showMessage('Preencha nome, telefone, e-mail e senha.', 'error')
      return
    }

    if (regPassword.length < 6) {
      showMessage('A senha deve conter no mínimo 6 caracteres.', 'error')
      return
    }

    if (regPassword !== regPasswordConfirm) {
      showMessage('As senhas digitadas não conferem.', 'error')
      return
    }

    try {
      const response = await authApi.post('/auth/signup', {
        name: regName,
        email: regEmail,
        password: regPassword
      })

      const token = response.data?.accessToken;

      if (token) {
        try {
          await api.post('/clientes', {
            name: regName,
            phone: regPhone,
            email: regEmail,
            address: regAddress
          }, {
            headers: {
              Authorization: `Bearer ${token}` 
            }
          });
        } catch (backendError) {
          console.error('Erro ao criar perfil no backend:', backendError);
        }

        localStorage.setItem('accessToken', token)
        showMessage('Conta criada com sucesso! Entrando...', 'success')
        
        setTimeout(() => window.location.reload(), 1000)
        return
      }

      await signIn(regEmail, regPassword)
      showMessage('Conta criada com sucesso! Você já pode acessar.', 'success')
      setActiveTab('login')

    } catch (err: any) {
      if (err?.response?.data?.error) {
        showMessage(err.response.data.error, 'error')
      } else {
        console.error('Erro inesperado no cadastro:', err)
        showMessage('Não foi possível concluir o cadastro. Tente novamente.', 'error')
      }
    }
  }

  return (
    <div className="login-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');

        :root {
          --primary-red: #D94343;
          --secondary-blue: #7BB5C4;
          --dark-blue: #2C3E50;
          --bg-cream: #FDFCF8;
          --white: #FFFFFF;
        }

        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          font-family: 'Poppins', sans-serif;
          background: linear-gradient(rgba(253, 252, 248, 0.8), rgba(253, 252, 248, 0.8)),
                      url('https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=1600&auto=format&fit=crop');
          background-size: cover;
          background-position: center;
        }

        .auth-container {
          width: 90%;
          max-width: 460px;
          background-color: var(--white);
          border-radius: 20px;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
        }

        .auth-header {
          text-align: center;
          padding: 2rem 1rem 1rem;
        }

        .auth-header img {
          width: 120px;
          margin: 0 auto 0.5rem;
          display: block;
          filter: drop-shadow(0 5px 10px rgba(0,0,0,0.1));
        }

        .auth-header h1 {
          font-size: 1.2rem;
          color: var(--dark-blue);
          font-weight: 600;
        }

        .tabs {
          display: flex;
          border-bottom: 2px solid #f0f0f0;
        }

        .tab-button {
          flex: 1;
          padding: 1rem;
          text-align: center;
          font-size: 1.05rem;
          font-weight: 600;
          color: #aaa;
          cursor: pointer;
          transition: color 0.3s, border-bottom 0.3s;
          border-bottom: 3px solid transparent;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          justify-content: center;
        }

        .tab-button svg {
          width: 18px;
          height: 18px;
        }

        .tab-button.active {
          color: var(--primary-red);
          border-bottom: 3px solid var(--primary-red);
        }

        .form-content {
          padding: 0 2rem 2.5rem;
        }

        .form { margin-top: 1.5rem; }

        .form-group {
          margin-bottom: 1.2rem;
          position: relative;
        }

        .form-group .icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--secondary-blue);
        }

        .auth-input {
          width: 100%;
          padding: 1rem 1rem 1rem 50px;
          border: 1px solid #ddd;
          border-radius: 10px;
          font-size: 1rem;
          transition: border-color 0.3s, box-shadow 0.3s;
          outline: none;
          font-family: 'Poppins', sans-serif;
        }

        .auth-input:focus {
          border-color: var(--secondary-blue);
          box-shadow: 0 0 0 3px rgba(123, 181, 196, 0.2);
        }

        .forgot-password {
          text-align: right;
          margin-top: -10px;
          margin-bottom: 1.5rem;
        }

        .forgot-password button {
          background: none;
          border: none;
          color: var(--secondary-blue);
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .btn-submit {
          width: 100%;
          padding: 1rem;
          margin-top: 0.5rem;
          background-color: var(--primary-red);
          color: white;
          border: none;
          border-radius: 50px;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: background-color 0.3s, transform 0.2s;
        }

        .btn-submit:hover {
          background-color: #c93a3a;
          transform: translateY(-2px);
        }

        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .message-box {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          padding: 0.9rem 1.2rem;
          text-align: center;
          font-weight: 600;
          transition: opacity 0.5s ease;
          opacity: 0;
          z-index: 10;
        }

        .message-box.visible { opacity: 1; }

        .message-box.error { background-color: #fee2e2; color: #dc2626; }
        .message-box.success { background-color: #d1fae5; color: #059669; }
        .message-box.info { background-color: #dbeafe; color: #2563eb; }

        .simulation-flag {
          position: absolute;
          bottom: 6px;
          left: 14px;
          font-size: 0.7rem;
          color: #777;
        }

        .back-button {
          position: absolute;
          top: 16px;
          left: 16px;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          color: var(--dark-blue);
          cursor: pointer;
          font-weight: 500;
        }

        .back-button:hover { color: var(--primary-red); }
      `}</style>

      {onBack && (
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={18} weight="bold" />
          Voltar
        </button>
      )}

      <div className="auth-container">
        <div
          className={`message-box ${message ? `visible ${message.type}` : ''}`}
          data-testid="login-feedback"
        >
          {message?.text}
        </div>

        <div className="auth-header">
          <img src="/Pitstop.png" alt="Logo PitStop" />
          <h1 data-testid="login-heading">Entre na sua conta</h1>
          <p>Se não tiver, cadastre-se</p>
        </div>

        <div className="tabs">
          <button
            type="button"
            className={`tab-button ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('login')
              setMessage(null)
            }}
          >
            <SignIn size={18} weight="bold" />
            Entrar
          </button>
          <button
            type="button"
            className={`tab-button ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('register')
              setMessage(null)
            }}
          >
            <UserPlus size={18} weight="bold" />
            Cadastrar
          </button>
        </div>

        <div className="form-content">
          {activeTab === 'login' ? (
            <form className="form" onSubmit={handleLogin}>
              <div className="form-group">
                <span className="icon"><EnvelopeSimple size={18} weight="bold" /></span>
                <input
                  className="auth-input"
                  type="email"
                  placeholder="E-mail"
                  value={loginEmail}
                  data-testid="login-email-input"
                  onChange={(event) => setLoginEmail(event.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <span className="icon"><Lock size={18} weight="bold" /></span>
                <input
                  className="auth-input"
                  type="password"
                  placeholder="Senha"
                  value={loginPassword}
                  data-testid="login-password-input"
                  onChange={(event) => setLoginPassword(event.target.value)}
                  required
                />
              </div>
              <button
                className="btn-submit"
                type="submit"
                disabled={loading}
                data-testid="login-submit-button"
              >
                {loading ? 'Entrando...' : 'Entrar no Sistema'}
              </button>
            </form>
          ) : (
            <form className="form" onSubmit={handleRegister}>
              <div className="form-group">
                <span className="icon"><User size={18} weight="bold" /></span>
                <input
                  className="auth-input"
                  type="text"
                  placeholder="Nome Completo"
                  value={regName}
                  onChange={(event) => setRegName(event.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <span className="icon"><Phone size={18} weight="bold" /></span>
                <input
                  className="auth-input"
                  type="tel"
                  placeholder="Telefone (WhatsApp)"
                  value={regPhone}
                  onChange={(event) => setRegPhone(event.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <span className="icon"><EnvelopeSimple size={18} weight="bold" /></span>
                <input
                  className="auth-input"
                  type="email"
                  placeholder="E-mail (Login)"
                  value={regEmail}
                  onChange={(event) => setRegEmail(event.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <span className="icon"><MapPin size={18} weight="bold" /></span>
                <input
                  className="auth-input"
                  type="text"
                  placeholder="Endereço Completo"
                  value={regAddress}
                  onChange={(event) => setRegAddress(event.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <span className="icon"><Lock size={18} weight="bold" /></span>
                <input
                  className="auth-input"
                  type="password"
                  placeholder="Crie uma Senha (mín. 6 dígitos)"
                  value={regPassword}
                  onChange={(event) => setRegPassword(event.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <span className="icon"><Lock size={18} weight="bold" /></span>
                <input
                  className="auth-input"
                  type="password"
                  placeholder="Confirme a Senha"
                  value={regPasswordConfirm}
                  onChange={(event) => setRegPasswordConfirm(event.target.value)}
                  required
                />
              </div>
              <button className="btn-submit" type="submit" disabled={loading}>
                {loading ? 'Cadastrando...' : 'Criar Minha Conta'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}