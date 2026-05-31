import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'

const DEFAULT_WIDTH = 380
const DEFAULT_HEIGHT = 520
const MIN_WIDTH = 300
const MIN_HEIGHT = 360
const MAX_WIDTH = 560
const MAX_HEIGHT = 720
const BUTTON_SIZE = 52
const BUTTON_MARGIN = 24
const PANEL_GAP = 12

const WELCOME_MESSAGE =
  "Hi! I'm your RoadWatch assistant. Click on any road segment or ask me about road conditions and projects."



function clampPosition(x, y, width, height) {
  const maxX = Math.max(0, window.innerWidth - width)
  const maxY = Math.max(0, window.innerHeight - height)
  return {
    x: Math.min(Math.max(0, x), maxX),
    y: Math.min(Math.max(0, y), maxY),
  }
}

function getDefaultPosition(width, height) {
  return clampPosition(
    window.innerWidth - width - BUTTON_MARGIN,
    window.innerHeight - height - BUTTON_MARGIN - BUTTON_SIZE - PANEL_GAP,
    width,
    height
  )
}

function formatTime(date) {
  if (!date) return ''
  if (typeof date === 'string') return date
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ChatBot({ sidebarOpen }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [position, setPosition] = useState(() => getDefaultPosition(DEFAULT_WIDTH, DEFAULT_HEIGHT))
  const [size, setSize] = useState({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT })

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const dragRef = useRef(null)
  const resizeRef = useRef(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false)
      requestAnimationFrame(() => setIsVisible(true))
      setPosition(getDefaultPosition(size.width, size.height))
      setMessages([{ role: 'assistant', text: WELCOME_MESSAGE, time: new Date() }])
      setTimeout(() => inputRef.current?.focus(), 220)
    } else {
      setIsVisible(false)
    }
  }, [isOpen])

  function handleClose() {
    setIsClosing(true)
    setIsVisible(false)
    setTimeout(() => {
      setIsOpen(false)
      setIsClosing(false)
      setMessages([])
      setInput('')
      setIsTyping(false)
    }, 200)
  }

  function handleToggle() {
    if (isOpen) handleClose()
    else setIsOpen(true)
  }

  function handleInputChange(e) {
    setInput(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    const lineHeight = 20
    const maxHeight = lineHeight * 3 + 16
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`
  }

  async function sendMessage(userText) {
    if (!userText.trim()) return

    // Add user message
    setMessages(prev => [...prev, {
      role: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }])
    setInput('')
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }
    setIsTyping(true)

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 300,
          messages: [
            {
              role: 'system',
              content: `You are RoadWatch AI, an intelligent assistant for a road defect monitoring platform in India. 
You help users understand road conditions, ongoing projects, defect reports, and maintenance status on National Highways.
Be concise, helpful, and professional. Keep responses under 100 words unless detail is specifically requested.
If asked about specific road data you don't have, suggest the user click on a road segment on the map for live data.`
            },
            // pass last 6 messages as context
            ...messages.slice(-6).map(m => ({
              role: m.role === 'user' ? 'user' : 'assistant',
              content: m.text
            })),
            {
              role: 'user',
              content: userText
            }
          ]
        })
      })

      const data = await response.json()
      const reply = data.choices?.[0]?.message?.content || "I couldn't get a response. Please try again."

      setMessages(prev => [...prev, {
        role: 'assistant',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }])

    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: "Connection error. Please check your network and try again.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }])
    } finally {
      setIsTyping(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  function startDrag(e) {
    if (e.target.closest('button')) return
    e.preventDefault()

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: position.x,
      originY: position.y,
    }

    function onMove(ev) {
      const dx = ev.clientX - dragRef.current.startX
      const dy = ev.clientY - dragRef.current.startY
      setPosition(clampPosition(dragRef.current.originX + dx, dragRef.current.originY + dy, size.width, size.height))
    }

    function onUp() {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      dragRef.current = null
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  function startResize(e) {
    e.preventDefault()
    e.stopPropagation()

    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: position.x,
      originY: position.y,
      originW: size.width,
      originH: size.height,
    }

    function onMove(ev) {
      const dx = ev.clientX - resizeRef.current.startX
      const dy = ev.clientY - resizeRef.current.startY

      let newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, resizeRef.current.originW - dx))
      let newHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, resizeRef.current.originH + dy))
      let newX = resizeRef.current.originX + (resizeRef.current.originW - newWidth)

      const clamped = clampPosition(newX, resizeRef.current.originY, newWidth, newHeight)
      setSize({ width: newWidth, height: newHeight })
      setPosition(clamped)
    }

    function onUp() {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      resizeRef.current = null
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  return (
    <>
      <div
        className={`fixed bottom-6 z-[10002] transition-all duration-300 ${
          sidebarOpen ? 'right-[374px]' : 'right-6'
        }`}
      >
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-green-600/30 animate-chat-pulse pointer-events-none" />
        )}
        <button
          onClick={handleToggle}
          aria-label={isOpen ? 'Close chat' : 'Open chat assistant'}
          className="relative flex items-center justify-center w-[52px] h-[52px] rounded-full bg-green-500/80 backdrop-blur-md border-2 border-green-400/50 hover:border-green-400/80 text-white shadow-lg transition-all duration-150 ease-out hover:scale-105 hover:shadow-xl active:scale-95"
        >
          {isOpen ? (
            <X size={22} strokeWidth={2} />
          ) : (
            <MessageCircle size={22} strokeWidth={2} />
          )}
        </button>
      </div>

      {/* Chat panel */}
      {isOpen && (
        <div
          className={`fixed z-[10002] flex flex-col bg-white/10 backdrop-blur-2xl border border-white/15 rounded-xl shadow-2xl overflow-hidden transition-[transform,opacity] duration-200 ease-out ${
            isVisible && !isClosing ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          style={{
            left: position.x,
            top: position.y,
            width: size.width,
            height: size.height,
            transformOrigin: 'bottom right',
          }}
        >
          {/* Header — drag handle */}
          <div
            onMouseDown={startDrag}
            className="shrink-0 flex items-center justify-between px-4 py-3 bg-white/8 backdrop-blur-xl border-b border-white/10 cursor-grab active:cursor-grabbing select-none"
          >
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-sm font-semibold text-zinc-900 tracking-tight drop-shadow-sm">RoadWatch AI</span>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 text-zinc-700/60 hover:text-zinc-900 hover:bg-white/15 rounded-md transition-all duration-150"
            >
              <X size={16} strokeWidth={2} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col justify-end gap-3 min-h-0">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed backdrop-blur-sm ${
                    msg.role === 'user'
                      ? 'bg-green-500/70 text-white rounded-2xl rounded-br-sm'
                      : 'bg-white/15 text-zinc-900 rounded-2xl rounded-bl-sm drop-shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-xs text-zinc-700/50 mt-1 px-1 drop-shadow-sm">{formatTime(msg.time)}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex flex-col items-start">
                <div className="bg-white/15 backdrop-blur-sm text-zinc-700 rounded-2xl rounded-bl-sm px-4 py-3 text-sm">
                  <span className="inline-flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 flex items-end gap-2 px-3 py-3 border-t border-white/10 bg-white/5 backdrop-blur-md">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask about roads, projects, defects…"
              rows={1}
              className="flex-1 resize-none px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-700/50 bg-white/10 border border-white/15 rounded-lg outline-none focus:border-green-400/40 focus:ring-2 focus:ring-green-400/20 transition-all duration-150 leading-5 backdrop-blur-sm"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              className="shrink-0 p-2.5 bg-green-500/80 backdrop-blur-md border border-green-400/30 hover:bg-green-600/80 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-150 active:scale-95"
            >
              <Send size={16} strokeWidth={2} />
            </button>
          </div>

          {/* Resize handle — bottom-left */}
          <div
            onMouseDown={startResize}
            className="absolute bottom-0 left-0 w-5 h-5 cursor-nesw-resize flex items-end justify-start p-0.5 text-zinc-300 hover:text-zinc-500 transition-colors duration-150"
            title="Resize"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <path d="M0 10L10 10L0 0Z" />
            </svg>
          </div>
        </div>
      )}
    </>
  )
}
