import { useState, useCallback, useRef } from 'react'
import { Upload, FileUp, CheckCircle2, Download, X, Settings2, Loader2, Zap, Image as ImageIcon, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import JSZip from 'jszip'
import { translations } from '../translations'

const PRESETS = {
  ui: { key: 'ui', quality: 0.82, maxWidth: 1000 },
  web: { key: 'web', quality: 0.75, maxWidth: 1200 },
  high: { key: 'high', quality: 0.90, maxWidth: null },
}

export default function Converter({ lang }) {
  const [files, setFiles] = useState([])
  const [preset, setPreset] = useState('ui')
  const [isProcessing, setIsProcessing] = useState(false)
  const [convertedFiles, setConvertedFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const t = translations[lang]

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    addFiles(selectedFiles)
  }

  const addFiles = (newFiles) => {
    const validFiles = newFiles.filter(f => f.type.startsWith('image/'))
    setFiles(prev => [...prev, ...validFiles.map(f => ({
      id: Math.random().toString(36).substr(2, 9),
      file: f,
      status: 'pending'
    }))])
  }

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const processImages = async () => {
    setIsProcessing(true)
    setConvertedFiles([])
    
    const results = []
    const config = PRESETS[preset]

    for (const item of files) {
      try {
        const converted = await convertToWebP(item.file, config)
        results.push({
          id: item.id,
          name: item.file.name.replace(/\.[^/.]+$/, "") + ".webp",
          url: converted.url,
          size: converted.blob.size,
          originalSize: item.file.size
        })
      } catch (err) {
        console.error("Error converting:", err)
      }
    }

    setConvertedFiles(results)
    setIsProcessing(false)
  }

  const convertToWebP = (file, config) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          if (config.maxWidth && width > config.maxWidth) {
            const ratio = config.maxWidth / width
            width = config.maxWidth
            height = height * ratio
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          canvas.toBlob((blob) => {
            if (!blob) return reject('Blob creation failed')
            resolve({
              blob,
              url: URL.createObjectURL(blob)
            })
          }, 'image/webp', config.quality)
        }
        img.onerror = reject
        img.src = e.target.result
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const downloadAll = async () => {
    const zip = new JSZip()
    for (const file of convertedFiles) {
      const response = await fetch(file.url)
      const blob = await response.blob()
      zip.file(file.name, blob)
    }
    const content = await zip.generateAsync({ type: "blob" })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(content)
    link.download = "webp-images.zip"
    link.click()
  }

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="glass-card">
        {/* Presets Selection */}
        <div className="flex flex-wrap gap-4 mb-8">
          {Object.entries(PRESETS).map(([key, config]) => {
            const presetData = t.presets[key]
            return (
              <button
                key={key}
                onClick={() => setPreset(key)}
                className={`flex-1 min-w-[150px] p-4 rounded-xl border transition-all text-left group ${
                  preset === key 
                  ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]' 
                  : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <Settings2 size={18} className={preset === key ? 'text-indigo-400' : 'text-slate-500'} />
                  {preset === key && <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />}
                </div>
                <h4 className={`font-bold ${preset === key ? 'text-white' : 'text-slate-300'}`}>{presetData.name}</h4>
                <p className="text-xs text-slate-500 mt-1">{presetData.desc}</p>
              </button>
            )
          })}
        </div>

        {/* Drop Zone */}
        <div 
          onClick={() => fileInputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragging(false)
            addFiles(Array.from(e.dataTransfer.files))
          }}
          className={`drop-zone ${isDragging ? 'active' : ''}`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            multiple 
            accept="image/png,image/jpeg,image/jpg" 
          />
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-indigo-600/10 rounded-full text-indigo-400">
              <Upload size={32} />
            </div>
            <div>
              <p className="text-lg font-semibold">{t.dropzone.title}</p>
              <p className="text-sm text-slate-500 mt-1">{t.dropzone.subtitle}</p>
            </div>
            <button className="btn btn-primary mt-2">
              <FileUp size={18} />
              {t.dropzone.browse}
            </button>
          </div>
        </div>

        {/* File List */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-16 space-y-8"
            >
              <div className="flex justify-between items-end px-4 mb-6">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">{files.length} {t.filesSelected}</h3>
                <button 
                  onClick={() => setFiles([])}
                  className="flex items-center gap-2 text-red-500/50 hover:text-red-400 transition-all group"
                >
                  <span className="text-[10px] font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">{t.clearAll}</span>
                  <Trash2 size={18} />
                </button>
              </div>
              
              <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2.5 custom-scrollbar">
                {files.map((item) => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center justify-between p-3.5 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-indigo-500/20 hover:bg-white/[0.05] transition-all group"
                  >
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="p-2.5 bg-slate-800/40 rounded-xl group-hover:bg-indigo-500/10 transition-colors border border-white/5">
                        <ImageIcon size={20} className="text-slate-500 group-hover:text-indigo-400" />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-bold text-slate-300 truncate group-hover:text-white transition-colors">{item.file.name}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{formatSize(item.file.size)}</p>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeFile(item.id); }}
                      className="p-2 text-red-500/40 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </motion.div>
                ))}
              </div>
              
              <button 
                onClick={processImages}
                disabled={isProcessing}
                className="btn btn-primary w-full py-6 text-xl shadow-2xl shadow-indigo-900/40 mt-6"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin" />
                    {t.processing}
                  </>
                ) : (
                  <>
                    <Zap size={20} />
                    {t.convertBtn}
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results */}
      <AnimatePresence>
        {convertedFiles.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card border-emerald-500/30 mt-12"
          >
            <div className="flex justify-between items-start mb-8 relative">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <CheckCircle2 className="text-emerald-500" size={32} />
                  <motion.div 
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 12 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                    className="absolute -top-6 -left-6 w-14 h-14 rounded-xl border-2 border-white/20 shadow-xl overflow-hidden bg-white rotate-12"
                  >
                    <img src="/mascot.webp" alt="Mascot" className="w-full h-full object-cover scale-110" />
                  </motion.div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{t.complete}</h3>
                  <p className="text-xs text-emerald-500/60 font-medium">{t.footer}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => { setConvertedFiles([]); setFiles([]); }}
                  className="p-2.5 text-slate-500 hover:text-red-400 transition-colors bg-white/5 rounded-xl border border-white/5 hover:bg-red-500/10 hover:border-red-500/20"
                  title={t.clearAll}
                >
                  <Trash2 size={20} />
                </button>
                <button 
                  onClick={downloadAll}
                  className="btn bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20"
                >
                  <Download size={18} />
                  {t.downloadAll}
                </button>
              </div>
            </div>

            <div className="grid gap-6">
              {convertedFiles.map((file) => {
                const savings = Math.round((1 - file.size / file.originalSize) * 100)
                return (
                  <div key={file.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 overflow-hidden border border-emerald-500/20">
                        <img src={file.url} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{file.name}</p>
                        <div className="flex gap-3 items-center mt-2">
                          <span className="text-xs text-slate-500">{formatSize(file.size)}</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                            -{savings}% {t.savings}
                          </span>
                        </div>
                      </div>
                    </div>
                    <a 
                      href={file.url} 
                      download={file.name}
                      className="p-2 text-slate-400 hover:text-emerald-400 transition-colors"
                    >
                      <Download size={20} />
                    </a>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
