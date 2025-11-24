import React, { useEffect, useState } from 'react'
import api from '../services/api' 
import {
  UserCircle,
  Tire,
  Compass,
  CarBattery,
  Toolbox,
  Engine,
  CheckCircle,
  ShieldCheck,
  Wrench,
  Package,
  SignIn
} from '@phosphor-icons/react'

type LandingProps = {
  onAccess: () => void
}

interface ServiceItem {
  id: string
  name: string
  price: number
}

interface PartItem {
  id: string
  name: string
  price: number
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
})

export function Landing({ onAccess }: LandingProps) {
  const [servicePrice, setServicePrice] = React.useState(0)
  const [partsPrice, setPartsPrice] = React.useState(0)
  
  const [servicesList, setServicesList] = useState<ServiceItem[]>([])
  const [partsList, setPartsList] = useState<PartItem[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const [servicesRes, partsRes] = await Promise.all([
          api.get('/servicos'),
          api.get('/pecas')
        ])
        setServicesList(servicesRes.data)
        setPartsList(partsRes.data)
      } catch (error) {
        console.error("Erro ao carregar dados da calculadora:", error)
      }
    }
    fetchData()
  }, [])

  const total = React.useMemo(() => currencyFormatter.format(servicePrice + partsPrice), [servicePrice, partsPrice])

  const handleAccess = (event?: React.MouseEvent) => {
    event?.preventDefault()
    onAccess()
  }

  return (
    <div className="min-h-screen" id="home">
      <style>{`
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Lobster&display=swap');

        :root {
          --primary-red: #40bbecff;
          --secondary-blue: #7BB5C4;
          --dark-blue: #2C3E50;
          --bg-cream: #FDFCF8;
          --white: #FFFFFF;
          --about-bg-color: #cbf5dd;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body, .min-h-screen {
          font-family: 'Poppins', sans-serif;
          background-color: var(--bg-cream);
          color: var(--dark-blue);
          line-height: 1.6;
        }

        header {
          background-color: var(--white);
          padding: 0.5rem 5%;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 1000;
          overflow: visible;
        }

        .nav-logo {
          font-weight: 700;
          font-size: 1.5rem;
          color: var(--primary-red);
          text-decoration: none;
          letter-spacing: 1px;
          font-family: 'Lobster', cursive;
        }

        .logo-link {
          position: relative;
          display: flex;
          align-items: center;
          padding-left: 0;
          height: auto;
        }

        .footer-logo {
          height: 80px;
          width: auto;
          object-fit: contain;
          margin-bottom: 0.6rem;
          filter: drop-shadow(0 6px 14px rgba(0,0,0,0.12));
        }

        nav ul {
          list-style: none;
          display: flex;
          gap: 2rem;
        }

        nav a {
          text-decoration: none;
          color: var(--dark-blue);
          font-weight: 500;
          transition: 0.3s;
        }

        nav a:hover { color: var(--primary-red); }

        .btn-login {
          background-color: transparent;
          color: var(--dark-blue);
          padding: 0.6rem 1.5rem;
          border: 2px solid var(--dark-blue);
          border-radius: 50px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .btn-login:hover {
          background-color: var(--dark-blue);
          color: white;
        }

        .btn-cta {
          background-color: var(--primary-red);
          color: white;
          padding: 0.6rem 1.5rem;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 600;
          transition: transform 0.2s ease;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(217, 67, 67, 0.3);
        }

        .hero {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          text-align: center;
          padding: 7rem 1rem;
          background: linear-gradient(rgba(253, 252, 248, 0.75), rgba(253, 252, 248, 0.75)),
                      url('https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=1600&auto=format&fit=crop');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
        }

        .hero h1 {
          font-size: 2.5rem;
          max-width: 800px;
          margin-bottom: 1rem;
          color: var(--dark-blue);
          font-weight: 700;
        }

        .hero p {
          font-size: 1.1rem;
          color: #666;
          max-width: 600px;
          margin-bottom: 2rem;
        }

        .services {
          padding: 5rem 5%;
          background-color: var(--white);
        }

        .section-title {
          text-align: center;
          margin-bottom: 3rem;
        }

        .section-title h2 {
          font-size: 2rem;
          color: var(--dark-blue);
          position: relative;
          display: inline-block;
        }

        .section-title h2::after {
          content: '';
          display: block;
          width: 60px;
          height: 4px;
          background-color: var(--secondary-blue);
          margin: 10px auto 0;
          border-radius: 2px;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
        }

        .services-more {
          text-align: center;
          margin-top: 2.25rem;
        }

        .services-more h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--dark-blue);
          letter-spacing: 1px;
          text-transform: uppercase;
          margin: 0 auto;
          max-width: 1100px;
        }

        .card {
          background: var(--bg-cream);
          padding: 2rem;
          border-radius: 15px;
          border: 1px solid rgba(0,0,0,0.05);
          transition: all 0.3s ease;
          text-align: left;
          position: relative;
          overflow: hidden;
        }

        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          border-color: var(--secondary-blue);
        }

        .icon-box {
          width: 60px;
          height: 60px;
          background-color: rgba(123, 181, 196, 0.15);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          color: var(--secondary-blue);
          font-size: 1.5rem;
        }

        .card h3 { margin-bottom: 0.5rem; color: var(--dark-blue); }
        .card p { font-size: 0.9rem; color: #666; }

        .about {
          padding: 5rem 5%;
          background-color: var(--about-bg-color);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4rem;
          box-shadow: inset 0 5px 15px rgba(0,0,0,0.03);
        }

        .about-content { flex: 1; max-width: 600px; }

        .about-content h2 {
          font-size: 2.2rem;
          color: var(--dark-blue);
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }

        .about-content p { margin-bottom: 1rem; color: #555; text-align: justify; }

        .about-features {
          list-style: none;
          margin-top: 1.5rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .about-features li {
          display: flex;
          align-items: center;
          font-weight: 600;
          color: var(--dark-blue);
          font-size: 0.9rem;
          gap: 0.5rem;
        }

        .about-visual {
          flex: 1;
          max-width: 500px;
          background-color: var(--secondary-blue);
          background-image: url("data:image/svg+xml,%3Csvg width='10' height='10' viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23669faa' fill-opacity='0.2' fill-rule='evenodd'%3E%3Cpath d='M0 10V9.9L10 0V.1L0 10zM10 10V.1L0 10z'/%3E%3C/g%3E%3C/svg%3E");
          background-size: 20px 20px;
          padding: 3rem;
          border-radius: 20px;
          color: white;
          position: relative;
          box-shadow: 20px 20px 0px rgba(217, 67, 67, 0.1);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
        }

        .about-visual h3 { font-size: 2rem; margin-bottom: 1.2rem; line-height: 1.2; }
        .about-visual p { font-size: 1.05rem; opacity: 0.9; }

        .budget-section {
          padding: 5rem 5%;
          background-color: var(--white);
        }

        .calculator-wrapper {
          max-width: 900px;
          margin: 0 auto;
          background-color: #d8f0f7ff;
          border-radius: 20px;
          padding: 3rem;
          border: 2px solid #eee;
          box-shadow: 0 10px 40px rgba(0,0,0,0.05);
        }

        .calc-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .input-group label {
          display: block;
          font-weight: 600;
          color: var(--dark-blue);
          margin-bottom: 0.8rem;
          font-size: 1.1rem;
        }

        .label-icon {
          margin-right: 0.5rem;
          display: inline-flex;
          vertical-align: middle;
        }

        .input-group select {
          width: 100%;
          padding: 1rem;
          border: 2px solid #ddd;
          border-radius: 10px;
          font-family: 'Poppins', sans-serif;
          font-size: 1rem;
          color: #555;
          background-color: white;
          outline: none;
          cursor: pointer;
          transition: 0.3s;
        }

        .input-group select:focus {
          border-color: var(--secondary-blue);
          box-shadow: 0 0 0 3px rgba(123, 181, 196, 0.2);
        }

        .result-box {
          text-align: center;
          border-top: 2px dashed #ddd;
          padding-top: 2rem;
        }

        .price-tag {
          font-size: 3rem;
          font-weight: 700;
          color: var(--primary-red);
          margin: 0.5rem 0 1.5rem 0;
        }

        .price-label {
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #888;
        }

        .disclaimer { font-size: 0.8rem; color: #999; margin-top: 1rem; }

        footer {
          background-color: var(--dark-blue);
          color: white;
          text-align: center;
          padding: 2.25rem 1rem;
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .footer-logo {
          height: 125px;
          width: auto;
          object-fit: contain;
          margin-bottom: 0;
        }

        footer p { font-size: 0.95rem; opacity: 0.9; margin: 0; }

        @media (max-width: 992px) {
          .about { flex-direction: column; text-align: center; gap: 3rem; }
          .about-content { max-width: 100%; }
          .about-content h2, .about-content p { text-align: center; }
          .about-features { grid-template-columns: 1fr; justify-items: center; }
          .about-visual { max-width: 80%; }
        }

        @media (max-width: 768px) {
          nav ul { display: none; }
          .hero h1 { font-size: 2rem; }
          .calc-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 480px) {
          footer { flex-direction: column; gap: 0.5rem; padding: 1.5rem 1rem; }
          .footer-logo { height: 96px; }
        }
      `}</style>

      <header>
        <a href="#home" className="logo-link nav-logo" style={{ textDecoration: 'none' }}>
          <span >PITSTOP</span>
        </a>
        <nav>
          <ul>
            <li><a href="#servicos">Serviços</a></li>
            <li><a href="#sobre">Sobre</a></li>
            <li><a href="#orcamento">Orçamento</a></li>
          </ul>
        </nav>
  <button type="button" className="btn-login" onClick={handleAccess} data-testid="landing-access-button">
          <UserCircle size={18} weight="bold" />
          Minha Conta
        </button>
      </header>

      <section className="hero">
        <h1 data-testid="landing-hero-title">Cuidamos do seu carro com paixão clássica e tecnologia moderna.</h1>
        <p>Manutenção especializada, troca de pneus e elétrica automotiva. A qualidade italiana que seu carro merece.</p>
        <a href="#servicos" className="btn-cta" style={{ backgroundColor: 'var(--secondary-blue)' }}>
          Ver Serviços
        </a>
      </section>

      <section id="servicos" className="services">
        <div className="section-title">
          <h2>Nossos Serviços</h2>
          <p>Soluções completas para manter seu veículo sempre novo.</p>
        </div>
        <div className="cards-grid">
          {[{
            title: 'Troca de Pneus',
            description: 'Trabalhamos com as melhores marcas. Instalação rápida, calibragem e verificação de desgaste.',
            icon: <Tire size={28} weight="bold" color="#7BB5C4" />
          }, {
            title: 'Alinhamento 3D',
            description: 'Garanta a estabilidade e evite o desgaste irregular dos pneus com nosso alinhamento computadorizado de precisão.',
            icon: <Compass size={28} weight="bold" color="#7BB5C4" />
          }, {
            title: 'Bateria e Elétrica',
            description: 'Diagnóstico completo do sistema elétrico, troca de baterias e reparo de alternadores.',
            icon: <CarBattery size={28} weight="bold" color="#7BB5C4" />
          }, {
            title: 'Manutenção Preventiva',
            description: 'Troca de óleo, filtros e check-up geral para garantir que você não fique na mão.',
            icon: <Toolbox size={28} weight="bold" color="#7BB5C4" />
          }, {
            title: 'Freios e Suspensão',
            description: 'Sua segurança em primeiro lugar. Revisão de pastilhas, discos e amortecedores.',
            icon: <Engine size={28} weight="bold" color="#7BB5C4" />
          }, ].map(service => (
            <div className="card" key={service.title}>
              <div className="icon-box">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>

        <div className="services-more" aria-hidden={false}>
          <h3>E MUITO MAIS PARA DEIXAR O SEU CARRO NO MELHOR ESTADO!!</h3>
        </div>
      </section>

      <section id="sobre" className="about">
        <div className="about-content">
          <h2>Tradição e Tecnologia na Mesma Direção</h2>
          <p>Na PitStop, entendemos que seu carro é mais do que um meio de transporte; é parte da sua história. Combinamos o cuidado artesanal das antigas oficinas com a precisão dos diagnósticos computadorizados modernos.</p>
          <ul className="about-features">
            {['Peças Originais', 'Garantia no Serviço', 'Agendamento Flexível', 'Equipe Especializada'].map(feature => (
              <li key={feature}>
                <CheckCircle size={18} weight="fill" color="#D94343" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
        <div className="about-visual">
          <ShieldCheck size={80} weight="duotone" className="icon-shield" />
          <h3>Compromisso com a Qualidade</h3>
          <p>Transparência total no orçamento e peças de primeira linha. Aqui, você sabe exatamente pelo que está pagando.</p>
        </div>
      </section>

      <section id="orcamento" className="budget-section">
        <div className="section-title">
          <h2>Simule seu Orçamento</h2>
          <p>Consulte valores estimados e acesse o sistema para agendar.</p>
        </div>

        <div className="calculator-wrapper">
          <div className="calc-grid">
            <div className="input-group">
              <label htmlFor="service-select">
                <span className="label-icon">
                  <Wrench size={18} weight="bold" color="#D94343" />
                </span>
                Escolha o Serviço
              </label>
              <select
                id="service-select"
                value={servicePrice}
                onChange={event => setServicePrice(Number(event.target.value))}
              >
                <option value={0}>Selecione...</option>
                {servicesList.map(service => (
                  <option key={service.id} value={service.price}>
                    {service.name} ({currencyFormatter.format(service.price)})
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="parts-select">
                <span className="label-icon">
                  <Package size={18} weight="bold" color="#D94343" />
                </span>
                Peças Necessárias
              </label>
              <select
                id="parts-select"
                value={partsPrice}
                onChange={event => setPartsPrice(Number(event.target.value))}
              >
                <option value={0}>Nenhuma / Apenas Mão de Obra</option>
                {partsList.map(part => (
                  <option key={part.id} value={part.price}>
                    {part.name} ({currencyFormatter.format(part.price)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="result-box">
            <p className="price-label">Estimativa Total</p>
            <div className="price-tag">{total}</div>
            <button type="button" className="btn-cta" onClick={handleAccess}>
              <SignIn size={18} weight="bold" />
              Acessar para Agendar
            </button>
            <p className="disclaimer">*Necessário cadastro para confirmar o agendamento.</p>
          </div>
        </div>
      </section>

      <footer id="contato">
        <img src="/Pitstop.png" alt="PitStop" className="footer-logo" />
        <p>&copy; {new Date().getFullYear()} PitStop. Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}

export default Landing