import { useState, useRef } from 'react'
import { Code2, Copy, Check, Trash2, FileCode, Upload } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { translations } from '../translations'

export default function SvgToCode({ lang }) {
  const [svgCode, setSvgCode] = useState('')
  const [isCopied, setIsCopied] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)
  const t = translations[lang].svgTool

  const handleFile = async (file) => {
    if (file && file.type === 'image/svg+xml') {
      const text = await file.text()
      // Basic cleanup: remove XML declaration and comments
      const clean = text
        .replace(/<\?xml.*?\?>/g, '')
        .replace(/<!--.*?-->/g, '')
        .trim()
      setSvgCode(clean)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(svgCode)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <section className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 title-gradient tracking-tight">{t.title}</h2>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">{t.subtitle}</p>
      </section>

      {!svgCode ? (
        <motion.div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`drop-zone py-20 ${isDragging ? 'active border-indigo-500 bg-indigo-500/5' : ''}`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => handleFile(e.target.files[0])} 
            accept=".svg" 
            className="hidden" 
          />
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20">
              <Upload size={32} />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-200">{t.dropzone}</p>
              <p className="text-sm text-slate-500 mt-2">SVG files only</p>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-0 overflow-hidden border-indigo-500/30"
        >
          <div className="flex items-center justify-between p-4 bg-white/5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <FileCode className="text-indigo-400" size={20} />
              <span className="text-sm font-medium text-slate-300">SVG Source</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={copyToClipboard}
                className={`btn flex items-center gap-2 py-1.5 px-4 text-xs font-bold transition-all ${
                  isCopied ? 'bg-emerald-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {isCopied ? <Check size={14} /> : <Copy size={14} />}
                {isCopied ? translations[lang].svgTool.copied : translations[lang].svgTool.copyBtn}
              </button>
              <button 
                onClick={() => setSvgCode('')}
                className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                title={translations[lang].svgTool.clean}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
          <div className="relative group">
            <textarea
              readOnly
              value={svgCode}
              className="w-full h-[400px] bg-slate-950/50 p-6 font-mono text-sm text-indigo-200/80 outline-none resize-none custom-scrollbar leading-relaxed"
            />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/20 to-transparent opacity-50" />
          </div>
        </motion.div>
      )}

      {/* Feature cards for SVG */}
      <div className="grid md:grid-cols-2 gap-6 mt-12">
        <div className="glass-card p-6 border-white/5">
          <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400 mb-4">
            <Code2 size={20} />
          </div>
          <h4 className="text-lg font-bold mb-2">React Ready</h4>
          <p className="text-sm text-slate-400">Perfectly cleaned code ready to be used as a React component or inline SVG.</p>
        </div>
        <div className="glass-card p-6 border-white/5">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400 mb-4">
            <Zap size={20} />
          </div>
          <h4 className="text-lg font-bold mb-2">Auto Clean</h4>
          <p className="text-sm text-slate-400">Automatically removes XML headers and design software metadata for minimum file size.</p>
        </div>
      </div>
    </div>
  )
}
