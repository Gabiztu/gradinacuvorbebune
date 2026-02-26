'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import ScrollShrinkWrapper from '@/components/animations/ScrollShrinkWrapper'
import IOSNotification from '@/components/IOSNotification'

export default function AcasaPage() {
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [countersAnimated, setCountersAnimated] = useState(false)
  const [counterValues, setCounterValues] = useState({ messages: 0, plants: 0, situations: 0, days: 0 })
  const statsRef = useRef<HTMLDivElement>(null)
  const totalSteps = 3
  
  const targets = { messages: 18542, plants: 3120, situations: 12, days: 247 }
  
  useEffect(() => {
    setMounted(true)
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!mounted || countersAnimated) return
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setCountersAnimated(true)
        }
      },
      { threshold: 0.5 }
    )
    
    if (statsRef.current) {
      observer.observe(statsRef.current)
    }
    
    return () => observer.disconnect()
  }, [mounted, countersAnimated])

  useEffect(() => {
    if (!countersAnimated) return
    
    const duration = 2000
    const steps = 60
    const interval = duration / steps
    
    let step = 0
    const timer = setInterval(() => {
      step++
      const progress = step / steps
      
      setCounterValues({
        messages: Math.round(targets.messages * progress),
        plants: Math.round(targets.plants * progress),
        situations: Math.round(targets.situations * progress),
        days: Math.round(targets.days * progress)
      })
      
      if (step >= steps) {
        clearInterval(timer)
        setCounterValues({ messages: targets.messages, plants: targets.plants, situations: targets.situations, days: targets.days })
      }
    }, interval)
    
    return () => clearInterval(timer)
  }, [countersAnimated])

  useEffect(() => {
    if (!mounted) return
    
    const interval = setInterval(() => {
      setCurrentStep(prev => prev < totalSteps ? prev + 1 : 1)
    }, 10000)
    
    return () => clearInterval(interval)
  }, [mounted, currentStep])

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex)
  }

  if (!mounted) return null

  return (
    <div className="font-sans">
      {/* ================= NAV ================= */}
      <nav 
        id="navbar" 
        className={`fixed w-full top-0 z-[110] transition-all duration-500 bg-transparent py-5 ${
          scrolled ? 'bg-white/30 backdrop-blur-md border-b border-white/20 py-3' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
            <span className="text-[15px] font-bold tracking-tighter text-stone-800 flex flex-col uppercase leading-none">
              <span>Grădina cu</span>
              <span className="-mt-[2px]">Vorbe Bune</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hidden md:block text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
              Login
            </Link>
            <Link 
              href="/login?mode=signup" 
              className="bg-stone-900 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-stone-800 hover:scale-105 transition-all shadow-lg shadow-stone-900/20"
            >
              Începe Acum
            </Link>
          </div>
        </div>
      </nav>

      {/* ================= 1. HERO SECTION ================= */}
      <section className="relative min-h-screen flex items-center pt-20 md:pt-3 pb-12 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-60">
          <div className="blob-1 absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-emerald-200/40 rounded-full blur-[100px]" />
          <div className="blob-2 absolute bottom-[-10%] right-[-10%] w-[40vw] h-[60vw] bg-amber-200/30 rounded-full blur-[100px]" />
        </div>

        <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
          <img 
            src="/images/fundall.jpg" 
            alt="Texture" 
            className="w-full h-full object-cover opacity-40 blur-sm"
            style={{
              maskImage: 'radial-gradient(circle at center, black 30%, transparent 85%)',
              WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 85%)',
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
          {/* Text content - First on mobile, left on desktop */}
          <div id="hero-text" className="flex flex-col items-start text-left z-20 order-1 lg:order-1">
            <motion.div
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="w-full"
              >
              <h1 className="text-[40px] md:text-[80px] font-semibold text-stone-900 mb-4 md:mb-6 leading-[1.1] font-serif">
                Cuvintele potrivite cresc <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 italic pr-2">încrederea</span> copiilor.
              </h1>

              <p className="text-lg text-stone-500 mb-6 md:mb-10 max-w-lg leading-relaxed">
                Transformă momentele dificile în pași de creștere emoțională. O bibliotecă de empatie la un click distanță.
              </p>
            </motion.div>
          </div>

          {/* Image - Second on mobile, right on desktop */}
          <div className="relative h-[300px] md:h-[500px] w-full flex items-center justify-center mt-2 order-2 lg:order-2">
            <div className="relative h-full w-auto max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white z-10">
              <div className="relative h-full w-auto">
                <img 
                  src="/images/familie.jpeg" 
                  alt="Familie" 
                  className="h-full w-auto max-w-full object-cover object-center" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/20 to-transparent" />
                
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[75%] bg-white/20 backdrop-blur-xl border border-white/30 p-4 rounded-xl z-10">
                  <p className="text-white/80 font-medium text-[10px] mb-1 uppercase tracking-wider">Mesaj trimis</p>
                  <p className="text-white text-sm font-medium leading-tight italic">"Sunt mândru de efortul tău, indiferent de rezultat."</p>
                </div>
              </div>
            </div>
          </div>

          {/* Button - Third on mobile, inside text on desktop */}
          <div className="order-3 mt-8 lg:absolute lg:-bottom-12 flex justify-center lg:justify-start">
            <Link href="/login?mode=signup" className="bg-emerald-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-emerald-700 hover:-translate-y-1 transition-all duration-300">
              Descoperă Biblioteca
            </Link>
          </div>
        </div>
      </section>

      {/* ================= 2. THE PROBLEM ================= */}
      <section className="pt-16 pb-8 px-6 bg-white relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-10">
            <h2 className="text-4xl md:text-6xl font-semibold text-stone-900 mb-6 leading-tight font-serif">
              Copiii trec prin mai multe decât spun. Adesea, în tăcere.
            </h2>
            <p className="text-xl text-stone-500 leading-relaxed">
              Noi te ajutăm să găsești calea de comunicare potrivită, exact atunci când au cea mai mare nevoie.
            </p>
          </div>

          <div className="space-y-0">
            {/* Problema - Text first on mobile, photo second */}
            <div className="flex flex-col md:flex-row items-center gap-0 lg:gap-24 mt-20 lg:mt-0">
              <div className="flex-1 w-full order-2 md:order-1">
                <div className="aspect-[4/3] bg-[#F4F4F5] rounded-[2.5rem] overflow-hidden relative group">
                  <img src="/images/cap.png" alt="Copil" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="flex-1 w-full order-1 md:order-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-100 text-red-600 text-sm font-medium mb-6">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Problema
                </div>
                <h3 className="text-3xl md:text-4xl font-semibold text-stone-900 mb-6 font-serif">
                  Cuvintele greșite au impact real
                </h3>
                <p className="text-lg text-stone-500 leading-relaxed">
                  Copiii absorb fiecare mesaj pe care îl aud. Când limbajul este critic, rece sau distant, ei internalizează aceste mesaje - chiar dacă tu nu ai intenționat asta.
                </p>
              </div>
            </div>

            {/* Soluția - Text first on mobile, photo second */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-0 lg:gap-24 mt-12 lg:mt-0">
              <div className="flex-1 w-full order-2 md:order-1">
                <div className="aspect-[4/3] bg-[#F0FDF4] rounded-[2.5rem] overflow-hidden relative group">
                  <img src="/images/mama.png" alt="Mamă" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="flex-1 w-full order-1 md:order-2 pt-10 lg:pt-0">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm font-medium mb-6">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Soluția
                </div>
                <h3 className="text-3xl md:text-4xl font-semibold text-stone-900 mb-6 font-serif">
                  Fiecare cuvânt contează
                </h3>
                <p className="text-lg text-stone-500 leading-relaxed">
                  Grădina cu Vorbe Bune îți oferă mesajele potrivite pentru fiecare situație. Simplu, cald și dovedit psihologic.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. HOW IT WORKS ================= */}
      <section className="overflow-hidden bg-[#FAFAF9] pt-24 pb-20 border-t border-stone-100" id="cum-functioneaza">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center relative">
            <div className="flex-1 w-full">
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-stone-900 mb-12 font-serif">
                De la emoție dificilă la conexiune în 3 pași simpli.
              </h2>

              <div className="flex flex-col lg:flex-col gap-0">
                {/* Horizontal layout for mobile - Numbers and Lines */}
                <div className="flex flex-row items-center justify-center gap-0 lg:hidden">
                  {/* Step 1 */}
                  <div 
                    className={`flex flex-col items-center cursor-pointer group ${currentStep === 1 ? 'opacity-100' : 'opacity-50 hover:opacity-100'} transition-opacity duration-300`}
                    onClick={() => goToStep(1)}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shadow-sm z-10 transition-colors duration-300 ${currentStep === 1 ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white border-2 border-stone-200 text-stone-400 group-hover:border-emerald-300'}`}>1</div>
                  </div>
                  
                  {/* Line 1-2 */}
                  <div className="w-16 h-1 bg-stone-200 relative overflow-hidden">
                    <motion.div 
                      className="absolute top-0 left-0 h-full bg-emerald-500"
                      initial={{ width: "0%" }}
                      animate={{ width: currentStep === 1 ? "100%" : "0%" }}
                      transition={{ duration: currentStep === 1 ? 10 : 0, ease: "linear" }}
                    />
                  </div>

                  {/* Step 2 */}
                  <div 
                    className={`flex flex-col items-center cursor-pointer group ${currentStep === 2 ? 'opacity-100' : 'opacity-50 hover:opacity-100'} transition-opacity duration-300`}
                    onClick={() => goToStep(2)}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shadow-sm z-10 transition-colors duration-300 ${currentStep === 2 ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white border-2 border-stone-200 text-stone-400 group-hover:border-emerald-300'}`}>2</div>
                  </div>

                  {/* Line 2-3 */}
                  <div className="w-16 h-1 bg-stone-200 relative overflow-hidden">
                    <motion.div 
                      className="absolute top-0 left-0 h-full bg-emerald-500"
                      initial={{ width: "0%" }}
                      animate={{ width: currentStep === 2 ? "100%" : "0%" }}
                      transition={{ duration: currentStep === 2 ? 10 : 0, ease: "linear" }}
                    />
                  </div>

                  {/* Step 3 */}
                  <div 
                    className={`flex flex-col items-center cursor-pointer group ${currentStep === 3 ? 'opacity-100' : 'opacity-50 hover:opacity-100'} transition-opacity duration-300`}
                    onClick={() => goToStep(3)}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shadow-sm z-10 transition-colors duration-300 ${currentStep === 3 ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white border-2 border-stone-200 text-stone-400 group-hover:border-emerald-300'}`}>3</div>
                  </div>

                  {/* Line after 3 */}
                  <div className="w-16 h-1 bg-stone-200 relative overflow-hidden">
                    <motion.div 
                      className="absolute top-0 left-0 h-full bg-emerald-500"
                      initial={{ width: "0%" }}
                      animate={{ width: currentStep === 3 ? "100%" : "0%" }}
                      transition={{ duration: currentStep === 3 ? 10 : 0, ease: "linear" }}
                    />
                  </div>
                </div>

                {/* Text content for each step - visible on mobile */}
                <div className="relative mt-4 lg:hidden min-h-[120px]">
                  <div className={`text-center transition-opacity duration-300 absolute w-full ${currentStep === 1 ? 'opacity-100' : 'opacity-0'}`}>
                    <h3 className="text-2xl font-semibold text-emerald-900 font-serif mb-2">Alegi situația</h3>
                    <p className="text-lg text-stone-500">Selectezi copilul și contextul prin care trece (tristețe, un examen greu, o reușită).</p>
                  </div>
                  <div className={`text-center transition-opacity duration-300 absolute w-full ${currentStep === 2 ? 'opacity-100' : 'opacity-0'}`}>
                    <h3 className="text-2xl font-semibold text-emerald-900 font-serif mb-2">Primești mesajul potrivit</h3>
                    <p className="text-lg text-stone-500">Aplicația îți sugerează formulări calde, validate psihologic, gata să fie trimise sau spuse.</p>
                  </div>
                  <div className={`text-center transition-opacity duration-300 absolute w-full ${currentStep === 3 ? 'opacity-100' : 'opacity-0'}`}>
                    <h3 className="text-2xl font-semibold text-emerald-900 font-serif mb-2">Crești planta</h3>
                    <p className="text-lg text-stone-500">Cu fiecare interacțiune pozitivă, grădina voastră virtuală prinde viață și înflorește.</p>
                  </div>
                </div>

                {/* Desktop layout - Vertical */}
                <div className="hidden lg:flex lg:flex-col gap-0">
                  {/* Step 1 */}
                  <div 
                    className={`flex gap-6 step-item cursor-pointer group ${currentStep === 1 ? 'opacity-100' : 'opacity-50 hover:opacity-100'} transition-opacity duration-300`}
                    onClick={() => goToStep(1)}
                  >
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-sm z-10 transition-colors duration-300 ${currentStep === 1 ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white border-2 border-stone-200 text-stone-400 group-hover:border-emerald-300'}`}>1</div>
                      <div className="w-1 min-h-[80px] h-full bg-stone-200 my-2 rounded-full relative overflow-hidden">
                        <motion.div 
                          className="absolute top-0 left-0 w-full bg-emerald-500 rounded-full"
                          initial={{ height: "0%" }}
                          animate={{ height: currentStep === 1 ? "100%" : "0%" }}
                          transition={{ duration: currentStep === 1 ? 10 : 0, ease: "linear" }}
                        />
                      </div>
                    </div>
                    <div className="pb-10 pt-2">
                      <h3 className={`text-2xl font-semibold tracking-tight mb-2 font-serif transition-colors ${currentStep === 1 ? 'text-emerald-900' : 'text-stone-800'}`}>Alegi situația</h3>
                      <p className="text-lg text-stone-500">Selectezi copilul și contextul prin care trece (tristețe, un examen greu, o reușită).</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div 
                    className={`flex gap-6 step-item cursor-pointer group ${currentStep === 2 ? 'opacity-100' : 'opacity-50 hover:opacity-100'} transition-opacity duration-300`}
                    onClick={() => goToStep(2)}
                  >
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-sm z-10 transition-colors duration-300 ${currentStep === 2 ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white border-2 border-stone-200 text-stone-400 group-hover:border-emerald-300'}`}>2</div>
                      <div className="w-1 min-h-[80px] h-full bg-stone-200 my-2 rounded-full relative overflow-hidden">
                        <motion.div 
                          className="absolute top-0 left-0 w-full bg-emerald-500 rounded-full"
                          initial={{ height: "0%" }}
                          animate={{ height: currentStep === 2 ? "100%" : "0%" }}
                          transition={{ duration: currentStep === 2 ? 10 : 0, ease: "linear" }}
                        />
                      </div>
                    </div>
                    <div className="pb-10 pt-2">
                      <h3 className={`text-2xl font-semibold tracking-tight mb-2 font-serif transition-colors ${currentStep === 2 ? 'text-emerald-900' : 'text-stone-800'}`}>Primești mesajul potrivit</h3>
                      <p className="text-lg text-stone-500">Aplicația îți sugerează formulări calde, validate psihologic, gata să fie trimise sau spuse.</p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div 
                    className={`flex gap-6 step-item cursor-pointer group ${currentStep === 3 ? 'opacity-100' : 'opacity-50 hover:opacity-100'} transition-opacity duration-300`}
                    onClick={() => goToStep(3)}
                  >
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-sm z-10 transition-colors duration-300 ${currentStep === 3 ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white border-2 border-stone-200 text-stone-400 group-hover:border-emerald-300'}`}>3</div>
                      <div className="w-1 min-h-[80px] h-full bg-stone-200 my-2 rounded-full relative overflow-hidden">
                        <motion.div 
                          className="absolute top-0 left-0 w-full bg-emerald-500 rounded-full"
                          initial={{ height: "0%" }}
                          animate={{ height: currentStep === 3 ? "100%" : "0%" }}
                          transition={{ duration: currentStep === 3 ? 10 : 0, ease: "linear" }}
                        />
                      </div>
                    </div>
                    <div className="pb-10 pt-2">
                      <h3 className={`text-2xl font-semibold tracking-tight mb-2 font-serif transition-colors ${currentStep === 3 ? 'text-emerald-900' : 'text-stone-800'}`}>
                        Crești planta
                      </h3>
                      <p className="text-lg text-stone-500">Cu fiecare interacțiune pozitivă, grădina voastră virtuală prinde viață și înflorește.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full relative min-h-[450px]">
              <div className="absolute inset-0 bg-emerald-100/50 rounded-full blur-[80px] -z-10" />
                
              <div className="relative w-full max-w-md mx-auto h-[400px]">
                {/* Step 1 Visual */}
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out ${currentStep === 1 ? 'opacity-100 translate-x-0 z-10 visible pointer-events-auto' : 'opacity-0 translate-x-8 z-0 invisible pointer-events-none'}`}>
                  <div className="w-full bg-white rounded-3xl p-6 shadow-xl border border-stone-100 transform -rotate-2">
                    <div className="flex items-start justify-between mb-6 pb-4 border-b border-stone-50">
                      <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-600 text-xs font-medium border border-stone-200">
                        Familie
                      </span>
                    </div>
                    <h4 className="text-xl font-semibold text-stone-800 mb-2 font-serif">Reconectare familială</h4>
                    <p className="text-sm text-stone-500 font-light mb-4">Timp împreună, seri liniștite</p>
                    <div className="flex items-center gap-2 text-stone-400">
                      <span className="text-xs">24 de mesaje</span>
                    </div>
                  </div>
                </div>

                {/* Step 2 Visual */}
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out ${currentStep === 2 ? 'opacity-100 translate-x-0 z-10 visible pointer-events-auto' : 'opacity-0 translate-x-8 z-0 invisible pointer-events-none'}`}>
                  <div className="w-full bg-white rounded-3xl p-6 shadow-xl border border-stone-100 transform rotate-2">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-50">
                      <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="text-sm font-medium text-stone-400">Sugestia Zilei</div>
                      <svg className="w-4 h-4 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <div className="bg-orange-50/50 rounded-2xl p-6 mb-6">
                      <p className="text-xl text-stone-700 font-medium italic mb-2 font-serif">
                        "Hai să vorbim deschis. Îmi pasă de tine și vreau să te ascult."
                      </p>
                    </div>
                    <div className="w-full bg-stone-900 text-white py-4 rounded-xl flex items-center justify-center gap-2 font-medium">
                      Trimite mesajul
                    </div>
                  </div>
                </div>

                {/* Step 3 Visual */}
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out ${currentStep === 3 ? 'opacity-100 translate-x-0 z-10 visible pointer-events-auto' : 'opacity-0 translate-x-8 z-0 invisible pointer-events-none'}`}>
                  <img src="/images/plant/gradinar.png" alt="Floare Evolutie" className="w-full h-[350px] object-contain drop-shadow-xl animate-float" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4. STATS ================= */}
      <section id="stats-section" className="pt-0 pb-32 md:pb-40 bg-[#FAFAF9] relative z-50 border-t border-stone-100 overflow-visible">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/50 rounded-full blur-[80px] -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-50/50 rounded-full blur-[80px] -z-10" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="relative -mt-11 mb-6 z-[100]">
              <IOSNotification 
                senderName="Mama" 
                message="Hai să vorbim deschis. Îmi pasă de tine și vreau să te ascult."
              />
            </div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">
                Impactul nostru
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-stone-900 mb-6 font-serif">
              O grădină care crește în
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400"> fiecare zi</span>
            </h2>
          </div>

          <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 md:gap-12 gap-x-8 gap-y-8">
            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-300 shadow-sm border border-emerald-100/50">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>
                </svg>
              </div>
              <div className="text-4xl md:text-5xl font-bold tracking-tight text-stone-800 mb-2 flex items-baseline justify-center">
                {counterValues.messages.toLocaleString()}
              </div>
              <div className="text-sm md:text-base text-stone-500 font-medium mb-2">mesaje trimise</div>
              <div className="mt-2 scale-0 transition-transform duration-700 origin-bottom plant-grow text-emerald-400 group-hover:scale-100">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22V12"/>
                  <path d="M12 12c0-4-3-6-6-6 0 4 3 6 6 6z"/>
                  <path d="M12 12c0-4 3-6 6-6 0 4-3 6-6 6z"/>
                </svg>
              </div>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500 mb-6 group-hover:scale-110 group-hover:bg-pink-100 transition-all duration-300 shadow-sm border border-pink-100/50">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22V12"/>
                  <path d="M12 12c0-4-3-6-6-6 0 4 3 6 6 6z"/>
                  <path d="M12 12c0-4 3-6 6-6 0 4-3 6-6 6z"/>
                </svg>
              </div>
              <div className="text-4xl md:text-5xl font-bold tracking-tight text-stone-800 mb-2 flex items-baseline justify-center">
                {counterValues.plants.toLocaleString()}
              </div>
              <div className="text-sm md:text-base text-stone-500 font-medium mb-2">plante crescute</div>
              <div className="mt-2 scale-0 transition-transform duration-700 origin-bottom plant-grow text-pink-400 group-hover:scale-100">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300 shadow-sm border border-blue-100/50">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="8" r="3"/>
                  <circle cx="16" cy="8" r="3"/>
                  <path d="M2 20c0-3 3-5 6-5"/>
                  <path d="M22 20c0-3-3-5-6-5"/>
                </svg>
              </div>
              <div className="text-4xl md:text-5xl font-bold tracking-tight text-stone-800 mb-2 flex items-baseline justify-center">
                {counterValues.situations}
              </div>
              <div className="text-sm md:text-base text-stone-500 font-medium mb-2">situații emoționale</div>
              <div className="mt-2 scale-0 transition-transform duration-700 origin-bottom plant-grow text-blue-400 group-hover:scale-100">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 mb-6 group-hover:scale-110 group-hover:bg-orange-100 transition-all duration-300 shadow-sm border border-orange-100/50">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div className="text-4xl md:text-5xl font-bold tracking-tight text-stone-800 mb-2 flex items-baseline justify-center">
                {counterValues.days}
              </div>
              <div className="text-sm md:text-base text-stone-500 font-medium mb-2">zile active</div>
              <div className="mt-2 scale-0 transition-transform duration-700 origin-bottom plant-grow text-orange-400 group-hover:scale-100">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* ================= SVG WAVE FIXED AT BOTTOM ================= */}
<div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] pointer-events-none">
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 1440 320" 
    /* MODIFICĂRILE SUNT MAI JOS */
    className="w-[100%] h-[120px] block" 
    preserveAspectRatio="none"
  >
    <path 
      fill="#047857" 
      fillOpacity="1" 
      d="M0,128L18.5,112C36.9,96,74,64,111,90.7C147.7,117,185,203,222,245.3C258.5,288,295,288,332,261.3C369.2,235,406,181,443,144C480,107,517,85,554,74.7C590.8,64,628,64,665,101.3C701.5,139,738,213,775,213.3C812.3,213,849,139,886,133.3C923.1,128,960,192,997,224C1033.8,256,1071,256,1108,240C1144.6,224,1182,192,1218,160C1255.4,128,1292,96,1329,117.3C1366.2,139,1403,213,1422,250.7L1440,288L1440,320L1421.5,320C1403.1,320,1366,320,1329,320C1292.3,320,1255,320,1218,320C1181.5,320,1145,320,1108,320C1070.8,320,1034,320,997,320C960,320,923,320,886,320C849.2,320,812,320,775,320C738.5,320,702,320,665,320C627.7,320,591,320,554,320C516.9,320,480,320,443,320C406.2,320,369,320,332,320C295.4,320,258,320,222,320C184.6,320,148,320,111,320C73.8,320,37,320,18,320L0,320Z">
    </path>
  </svg>
</div>
      </section>

      {/* ================= 5. FOR WHOM ================= */}
      <section className="relative w-full">
        
        {/* The Wave Separator - Independent from Shrink Effect */}
        <div className="absolute top-0 left-0 w-full h-[120px] z-[100] pointer-events-none -mt-[1px]">
          <svg 
            className="w-full h-full rotate-180 block" 
            preserveAspectRatio="none" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 1440 320"
          >
            <path fill="#047857" fillOpacity="1" d="M0,128L18.5,112C36.9,96,74,64,111,90.7C147.7,117,185,203,222,245.3C258.5,288,295,288,332,261.3C369.2,235,406,181,443,144C480,107,517,85,554,74.7C590.8,64,628,64,665,101.3C701.5,139,738,213,775,213.3C812.3,213,849,139,886,133.3C923.1,128,960,192,997,224C1033.8,256,1071,256,1108,240C1144.6,224,1182,192,1218,160C1255.4,128,1292,96,1329,117.3C1366.2,139,1403,213,1422,250.7L1440,288L1440,320L1421.5,320C1403.1,320,1366,320,1329,320C1292.3,320,1255,320,1218,320C1181.5,320,1145,320,1108,320C1070.8,320,1034,320,997,320C960,320,923,320,886,320C849.2,320,812,320,775,320C738.5,320,702,320,665,320C627.7,320,591,320,554,320C516.9,320,480,320,443,320C406.2,320,369,320,332,320C295.4,320,258,320,222,320C184.6,320,148,320,111,320C73.8,320,37,320,18,320L0,320Z"></path>
          </svg>
        </div>

        {/* The Content with Shrink Effect */}
        <ScrollShrinkWrapper>
          <div className="max-w-7xl mx-auto px-6 pt-32 pb-16">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-center text-stone-900 mb-16 font-serif">
              O grădină pentru fiecare nevoie
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-3xl p-8 group hover:bg-orange-50 transition-colors flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 mb-6 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold tracking-tight text-stone-800 mb-3 font-serif">Pentru Părinți</h3>
                <p className="text-base text-stone-500 leading-relaxed max-w-[280px] mx-auto">
                  Construiește o relație bazată pe încredere și blândețe acasă, transformând conflictele în conversații.
                </p>
              </div>

              <div className="rounded-3xl p-8 group hover:bg-blue-50 transition-colors flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold tracking-tight text-stone-800 mb-3 font-serif">Pentru Profesori</h3>
                <p className="text-base text-stone-500 leading-relaxed max-w-[280px] mx-auto">
                  Gestionează dinamica clasei mai ușor. Oferă feedback constructiv care motivează, nu care descurajează.
                </p>
              </div>

              <div className="rounded-3xl p-8 group hover:bg-purple-50 transition-colors flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-6 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold tracking-tight text-stone-800 mb-3 font-serif">Pentru Școli</h3>
                <p className="text-base text-stone-500 leading-relaxed max-w-[280px] mx-auto">
                  Implementați un program unitar de wellbeing emoțional pentru a reduce bullying-ul și a crește performanța.
                </p>
              </div>
            </div>
          </div>
        </ScrollShrinkWrapper>

      </section>

      {/* ================= 6. FINAL CTA ================= */}
      <section className="py-24 relative z-10 overflow-hidden bg-emerald-700">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-12 -right-12 w-96 h-96 bg-emerald-400 rounded-full blur-[80px]" />
          <div className="absolute -bottom-12 -left-12 w-96 h-96 bg-emerald-900 rounded-full blur-[80px]" />
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-6 font-serif">
            Fiecare copil merită un cuvânt potrivit la momentul potrivit.
          </h2>
          <p className="text-xl text-emerald-100 mb-12 font-normal">
            Începe să cultivi încrederea astăzi. Este gratuit să începi.
          </p>
          <Link href="/login" className="inline-flex items-center bg-white text-emerald-800 px-10 py-5 rounded-full text-lg font-bold shadow-xl hover:bg-stone-100 hover:scale-105 transition-all duration-300">
            Intră în Grădină
          </Link>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-stone-900 text-stone-400 py-12 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-stone-200">
            <img src="/tabicon-rounded.png" alt="Logo" className="h-6 w-auto" />
            <span className="font-bold tracking-tight">Grădina cu Vorbe Bune</span>
          </div>
          <div className="text-sm font-medium">
            © 2026. Toate drepturile rezervate.
          </div>
        </div>
      </footer>
    </div>
  )
}