import React, { useState, useRef } from 'react'
import axios from 'axios'
import { Send, FileText, Image as ImageIcon, Music, Loader2, Paperclip, ChevronRight, Info } from 'lucide-react'

function App() {
  const [query, setQuery] = useState('')
  const [files, setFiles] = useState([])
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!query.trim() && files.length === 0) return

    const userMessage = {
      role: 'user',
      content: query || (files.length > 0 ? "[Uploaded Files]" : ""),
      files: files.map(f => f.name)
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setQuery('')
    setFiles([])

    const formData = new FormData()
    formData.append('query', query)
    files.forEach(file => {
      formData.append('files', file)
    })

    try {
      const response = await axios.post('/api/process', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000  // 30 seconds timeout to give enough time for Groq
      })

      const agentMessage = {
        role: 'agent',
        content: response.data.agent_response,
        extractedText: response.data.extracted_text,
        reasoning: response.data.reasoning,
        status: response.data.status,
        estimatedCost: response.data.estimated_cost,
        toolCalls: response.data.tool_calls
      }

      setMessages(prev => [...prev, agentMessage])
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'agent',
        content: `Error: ${error.response?.data?.detail || error.message}`,
        status: 'error'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen text-gray-900 font-sans relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="abstract-shape w-[500px] h-[500px] bg-blue-400 -top-20 -left-20 rounded-full"></div>
      <div className="abstract-shape w-[400px] h-[400px] bg-purple-400 top-1/2 -right-20 rounded-full" style={{ animationDelay: '-5s' }}></div>
      <div className="abstract-shape w-[300px] h-[300px] bg-pink-400 bottom-10 left-1/4 rounded-full" style={{ animationDelay: '-10s' }}></div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">DSW</div>
          <h1 className="text-xl font-bold tracking-tight">DataSmith Wala</h1>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div> System Online</span>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto w-full relative z-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="p-6 bg-white/50 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20">
              <div className="p-4 bg-blue-600 rounded-2xl inline-block mb-4 shadow-lg shadow-blue-200">
                <Info size={48} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Welcome to DataSmith Wala</h2>
              <p className="text-gray-600 max-w-md mt-2 text-lg">Your intelligent companion for processing multi-modal data. Upload files and let's get started!</p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
            <div className={`max-w-[85%] rounded-3xl p-5 shadow-lg backdrop-blur-sm ${
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-blue-200' 
                : 'bg-white/80 border border-white/40 text-gray-800 shadow-gray-100'
            }`}>
              {/* User Message */}
              {msg.role === 'user' && (
                <div className="space-y-2">
                  <p className="text-lg">{msg.content}</p>
                  {msg.files && msg.files.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {msg.files.map((f, idx) => (
                        <span key={idx} className="bg-blue-500/30 px-2 py-1 rounded text-xs flex items-center gap-1">
                          <Paperclip size={12} /> {f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Agent Message */}
              {msg.role === 'agent' && (
                <div className="space-y-4">
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap text-base leading-relaxed">{msg.content}</p>
                  </div>
                  
                  {msg.extractedText && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <details className="group">
                        <summary className="text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer flex items-center gap-1 hover:text-gray-600 transition-colors">
                          <ChevronRight size={14} className="group-open:rotate-90 transition-transform" />
                          Extracted Content
                        </summary>
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                          {msg.extractedText}
                        </div>
                      </details>
                    </div>
                  )}

                  {msg.reasoning && (
                    <div className="pt-2">
                      <details className="group">
                        <summary className="text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer flex items-center gap-1 hover:text-gray-600 transition-colors">
                          <ChevronRight size={14} className="group-open:rotate-90 transition-transform" />
                          Plan Trace {msg.estimatedCost !== undefined && msg.estimatedCost > 0 && (
                            <span className="ml-auto text-blue-500 lowercase font-normal">
                              Est. Cost: ${msg.estimatedCost.toFixed(4)}
                            </span>
                          )}
                        </summary>
                        
                        {/* Tool Call Visualization (Bonus) */}
                        {msg.toolCalls && (
                          <div className="mt-3 mb-4 space-y-2">
                            <h4 className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-2">Tool Execution Timeline</h4>
                            <div className="relative border-l-2 border-gray-100 ml-2 pl-4 space-y-4">
                              {msg.toolCalls.map((tc, idx) => (
                                <div key={idx} className="relative">
                                  <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white ${
                                    tc.status === 'success' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 
                                    tc.status === 'running' ? 'bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 
                                    tc.status === 'warning' ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]' :
                                    'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                                  }`}></div>
                                  <div className="flex flex-col">
                                    <span className="text-[11px] font-bold text-gray-700">{tc.tool}</span>
                                    <span className="text-[10px] text-gray-400 italic">{tc.output}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <ul className="mt-2 space-y-1">
                          {msg.reasoning.map((step, idx) => (
                            <li key={idx} className="text-xs text-gray-500 flex items-start gap-2">
                              <span className="mt-1 w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></span>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </details>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <Loader2 className="animate-spin text-blue-600" size={20} />
              <span className="text-gray-500 text-sm italic">Agent is thinking and processing...</span>
            </div>
          </div>
        )}
      </main>

      {/* Input Area */}
      <footer className="bg-white/60 backdrop-blur-lg border-t p-4 pb-8 sticky bottom-0 z-10">
        <div className="max-w-4xl mx-auto space-y-4">
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 px-2">
              {files.map((file, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-sm border border-blue-100 px-3 py-1.5 rounded-xl flex items-center gap-2 text-sm text-blue-700 shadow-sm animate-in zoom-in duration-300">
                  {file.type.includes('image') ? <ImageIcon size={14} /> : 
                   file.type.includes('pdf') ? <FileText size={14} /> : 
                   <Music size={14} />}
                  <span className="truncate max-w-[150px] font-medium">{file.name}</span>
                  <button 
                    onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}
                    className="hover:text-red-500 ml-1 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-white border border-gray-200 shadow-xl rounded-3xl p-2 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-300">
            <button 
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="p-3 text-gray-400 hover:text-blue-600 transition-colors rounded-2xl hover:bg-blue-50"
            >
              <Paperclip size={24} />
            </button>
            <input 
              type="file" 
              multiple 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.mp3,.wav,.m4a"
            />
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
              placeholder="Ask me anything about your files..."
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3 text-base min-h-[50px] max-h-[200px]"
              rows="1"
            />
            <button 
              type="submit"
              disabled={isLoading || (!query.trim() && files.length === 0)}
              className={`p-3 rounded-2xl transition-all shadow-lg ${
                isLoading || (!query.trim() && files.length === 0)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-blue-200 hover:scale-105 active:scale-95'
              }`}
            >
              <Send size={24} />
            </button>
          </form>
          <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest font-semibold">
            Powered by Gemini-3-Flash-Preview & OpenAI GPT-4o
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
