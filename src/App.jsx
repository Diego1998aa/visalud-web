import Header from './components/Header.jsx'
import IntroSection from './components/IntroSection.jsx'
import ServicesAndProfessionals from './components/ServicesAndProfessionals.jsx'
import InstagramSection from './components/InstagramSection.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <Header />
      <main>
        <IntroSection />
        <ServicesAndProfessionals />
        <InstagramSection />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
