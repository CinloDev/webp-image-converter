import { useState, useEffect } from 'react'
import Converter from './components/Converter'
import { Image, Layers, Zap, Github, Languages, Globe } from 'lucide-react'
import { motion } from 'framer-motion'
import { translations } from './translations'

function App() {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('lang') || 'es'
  })

  const t = translations[lang]

  useEffect(() => {
    localStorage.setItem('lang', lang)
    document.documentElement.lang = lang
  }, [lang])

  return (
    <div className="flex flex-col w-full min-h-screen sm:px-4">
      <header className="w-full max-w-4xl mx-auto flex justify-between items-center py-6 mb-8 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-indigo-600/20 rounded-xl border border-indigo-500/30 w-14 h-14 flex items-center justify-center overflow-hidden shadow-lg shadow-indigo-500/10">
            <img src="/cat.svg" alt="Mascot" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-bold title-gradient">{t.title}</h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{t.by}</p>
          </div>
        </div>

        <nav className="flex gap-4 items-center">
          <button
            onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
            className="btn bg-white/5 border border-white/10 hover:border-white/20 py-2.5 px-4 text-xs flex items-center gap-2"
          >
            <Languages size={14} className="text-indigo-400" />
            {lang === 'en' ? 'Español' : 'English'}
          </button>
        </nav>
      </header>

      <main className="w-full max-w-4xl mx-auto">
        <section className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-black mb-6 title-gradient tracking-tighter"
          >
            {t.heroTitle}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            {t.heroSubtitle}
          </motion.p>
        </section>

        <Converter lang={lang} />

        <section className="mt-16 grid md:grid-cols-3 gap-8 pb-12">
          {t.features.map((feature, i) => {
            const icons = [<Zap className="text-amber-400" />, <Layers className="text-emerald-400" />, <Image className="text-blue-400" />]
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (i * 0.1) }}
                className="glass-card p-6"
              >
                <div className="p-3 bg-white/5 rounded-lg w-fit mb-4">
                  {icons[i]}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            )
          })}
        </section>
      </main>

      <footer className="w-full max-w-4xl mx-auto mt-16 py-8 border-t border-white/10 flex flex-col sm:flex-row sm:justify-between items-center text-slate-500 text-sm animate-fade-in">
        <div className="font-medium text-center sm:text-left">
          <span className="opacity-50">© {new Date().getFullYear()} </span>
          <span className="text-indigo-400 font-bold">CinloDev</span>
          <span className="opacity-50">. All rights reserved.</span>
        </div>

        <div className="flex items-center gap-6 mt-8 sm:mt-0">
          <a href="https://cinlodev.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-400 transition-all hover:scale-110">
            <Globe size={20} />
          </a>
          <a href="https://github.com/cinlodev" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-400 transition-all hover:scale-110">
            <Github size={20} />
          </a>
        </div>
      </footer>
    </div>
  )
}

export default App
