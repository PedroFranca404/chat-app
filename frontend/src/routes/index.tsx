import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/')({
  component: App,
})

import React, { useState, useEffect, useRef } from 'react'
import {
  Send,
  Hash,
  Search,
  Settings,
  MoreVertical,
  Heart,
  CircleUserRound,
  CheckCheck,
  LogOut,
  Code,
} from 'lucide-react'

type UserStatus = 'online' | 'busy' | 'offline' | string

interface User {
  id: number
  name: string
  handle: string
  status: UserStatus
  avatar: string | null
  isGroup?: boolean
}

interface Message {
  id: number
  text: string
  sender: string
  time: string
  read: boolean
}

type ChatMap = Record<number, Message[]>

interface ChatAppProps {
  onLogout: () => void
}

const USERS: User[] = [
  {
    id: 1,
    name: 'Sarah Engineer',
    handle: '@sarah_dev',
    status: 'online',
    avatar: 'assets/images/profile_pic_1.jpg',
  },
  {
    id: 2,
    name: 'Alex Frontend',
    handle: '@alex_css',
    status: 'busy',
    avatar: 'assets/images/profile_pic_2.jpg',
  },
  {
    id: 3,
    name: 'Design Team',
    handle: '#design-sys',
    status: 'offline',
    isGroup: true,
    avatar: null,
  },
  {
    id: 4,
    name: 'Rogue AI',
    handle: '@bot_01',
    status: 'online',
    avatar: 'assets/images/profile_pic_3.jpg',
  },
]

const MOCK_CHATS: ChatMap = {
  1: [
    {
      id: 1,
      text: 'França, já fizeste os helpers?',
      sender: '1',
      time: '10:23 AM',
      read: true,
    },
    {
      id: 2,
      text: 'Ainda não, mas está quase...',
      sender: 'me',
      time: '10:24 AM',
      read: true,
    },
    {
      id: 3,
      text: 'Okk, então depois manda prod.',
      sender: '1',
      time: '10:45 AM',
      read: true,
    },
  ],
  2: [
    {
      id: 1,
      text: 'Hey, teste de mensagem multi-user.',
      sender: '2',
      time: '09:00 AM',
      read: true,
    },
  ],
  3: [
    {
      id: 1,
      text: '20 dias restantes para o desafio.',
      sender: '1',
      time: '14:00 PM',
      read: false,
    },
    {
      id: 2,
      text: 'Auth e DB já estão feitos.',
      sender: '2',
      time: '14:00 PM',
      read: false,
    },
  ],
}

export default function App() {
  const [activeChat, setActiveChat] = useState<number>(1)
  const [messages, setMessages] = useState<ChatMap>(MOCK_CHATS)
  const [inputText, setInputText] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const activeUser = USERS.find((u) => u.id === activeChat)
  const currentMessages = messages[activeChat] || []

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentMessages, activeChat])

  // TODO:
  const onLogout = () => {}

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    const newMessage: Message = {
      id: Date.now(),
      text: inputText,
      sender: 'me',
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      read: false,
    }

    setMessages((prev) => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), newMessage],
    }))
    setInputText('')
  }

  if (!activeUser) return null

  return (
    <div className="flex h-screen w-full bg-[#050505] text-zinc-200 font-sans overflow-hidden selection:bg-indigo-500/30">
      <aside className="w-80 flex flex-col border-r border-white/5 bg-zinc-900/20 backdrop-blur-md">
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-[0_0_15px_-3px_rgba(79,70,229,0.5)]">
              <Code size={16} />
            </div>
            <span className="font-semibold tracking-tight text-white">
              Chat App
            </span>
          </div>
          <button
            onClick={onLogout}
            className="text-zinc-500 hover:text-red-400 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>

        <div className="px-5 mb-6">
          <div className="relative group">
            <Search className="absolute left-3 top-2.5 text-zinc-600 w-4 h-4 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              placeholder="Ctrl+P to search..."
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-indigo-500/50 focus:bg-zinc-800/50 transition-all placeholder:text-zinc-600 font-mono"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-1 scrollbar-hide">
          <h3 className="text-[10px] font-mono uppercase text-zinc-600 px-3 mb-2 tracking-widest">
            Direct Messages
          </h3>
          {USERS.map((user) => (
            <button
              key={user.id}
              onClick={() => setActiveChat(user.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group border border-transparent ${
                activeChat === user.id
                  ? 'bg-white/5 border-white/5 shadow-inner'
                  : 'hover:bg-white/5 hover:border-white/5'
              }`}
            >
              <div className="relative">
                {user.isGroup ? (
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-700">
                    <Hash size={18} />
                  </div>
                ) : (
                  <img
                    src={user.avatar || ''}
                    alt={user.name}
                    className="w-10 h-10 rounded-xl grayscale group-hover:grayscale-0 transition-all border border-zinc-800"
                  />
                )}
                {!user.isGroup && (
                  <div
                    className={`absolute -bottom-1 -right-1 w-3 h-3 border-2 border-black rounded-full ${
                      user.status === 'online'
                        ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                        : user.status === 'busy'
                          ? 'bg-amber-500'
                          : 'bg-zinc-600'
                    }`}
                  />
                )}
              </div>

              <div className="flex-1 text-left">
                <div className="flex justify-between items-center mb-0.5">
                  <span
                    className={`text-sm font-medium ${
                      activeChat === user.id
                        ? 'text-white'
                        : 'text-zinc-400 group-hover:text-zinc-200'
                    }`}
                  >
                    {user.name}
                  </span>
                  {activeChat !== user.id && Math.random() > 0.7 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                  )}
                </div>
                <div className="text-xs font-mono text-zinc-600 truncate">
                  {user.handle}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-white/5 bg-zinc-900/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 border border-white/10" />
            <div className="flex-1">
              <div className="text-sm text-white font-medium">Me</div>
              <div className="text-[10px] text-emerald-500 font-mono">
                ● Online
              </div>
            </div>
            <Settings className="w-4 h-4 text-zinc-500 hover:text-white cursor-pointer" />
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative bg-[#050505]">
        <div className="absolute top-4 left-4 right-4 h-16 bg-zinc-900/60 backdrop-blur-xl border border-white/5 rounded-2xl flex items-center justify-between px-6 z-20 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="text-lg font-medium text-white">
              {activeUser.name}
            </div>
            <div className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-mono text-zinc-400">
              {activeUser.isGroup ? 'GROUP' : 'DM'}
            </div>
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <Heart className="w-5 h-5 hover:text-indigo-400 cursor-pointer transition-colors" />
            <CircleUserRound className="w-5 h-5 hover:text-indigo-400 cursor-pointer transition-colors" />
            <MoreVertical className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pt-24 pb-4">
          {currentMessages.map((msg) => {
            const isMe = msg.sender === 'me'
            const senderUser = USERS.find((u) => u.id.toString() === msg.sender)

            return (
              <div
                key={msg.id}
                className={`flex w-full mb-6 ${
                  isMe ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`flex items-end gap-3 ${
                    isMe ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {!isMe && activeUser.isGroup && (
                    <div className="w-5 h-5 rounded-full overflow-hidden border border-zinc-800 flex-none">
                      {senderUser?.avatar ? (
                        <img
                          src={senderUser.avatar}
                          alt={senderUser.name}
                          className="w-full h-full object-cover grayscale"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500">
                          <Hash size={12} />
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    className={`flex flex-col ${
                      isMe ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`
                  relative px-6 py-3.5 rounded-2xl text-sm leading-relaxed
                  ${
                    isMe
                      ? 'bg-zinc-800/50 border border-indigo-500/20 text-indigo-50 rounded-tr-sm shadow-[0_4px_20px_-5px_rgba(99,102,241,0.1)]'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-sm'
                  }
                 `}
                    >
                      {msg.text}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      {!isMe && (
                        <>
                          {activeUser.isGroup && (
                            <span className="text-[10px] font-mono text-zinc-600">
                              {senderUser?.name}
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-zinc-600">
                            {msg.time}
                          </span>
                        </>
                      )}
                      {isMe && (
                        <CheckCheck
                          size={12}
                          className={
                            msg.read ? 'text-emerald-500' : 'text-zinc-600'
                          }
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 mb-2">
          <form
            onSubmit={handleSendMessage}
            className="relative flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-2 px-4 focus-within:border-indigo-500/30 focus-within:bg-zinc-900/80 transition-all shadow-lg backdrop-blur-sm"
          >
            <span className="text-zinc-600 font-mono select-none">{'>'}</span>
            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-transparent border-none focus:outline-none text-zinc-200 placeholder:text-zinc-600 h-10 font-light"
              placeholder="Write a message..."
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className={`p-2 rounded-xl transition-all ${
                inputText.trim()
                  ? 'bg-indigo-600 text-white shadow-[0_0_15px_-3px_rgba(79,70,229,0.5)]'
                  : 'bg-transparent text-zinc-700'
              }`}
            >
              <Send size={18} />
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-zinc-700 font-mono">
              PRESS ENTER TO SEND
            </span>
          </div>
        </div>
      </main>

      <aside className="w-72 bg-[#050505] border-l border-white/5 hidden xl:flex flex-col">
        <div className="p-6 flex flex-col items-center border-b border-white/5">
          <div className="w-24 h-24 rounded-2xl p-1 border border-white/10 mb-4 bg-zinc-900/50">
            {activeUser.isGroup ? (
              <div className="w-full h-full bg-zinc-800 rounded-xl flex items-center justify-center">
                <Hash className="text-zinc-500" />
              </div>
            ) : (
              <img
                src={activeUser.avatar || ''}
                className="w-full h-full rounded-xl object-cover grayscale"
                alt="profile"
              />
            )}
          </div>
          <h2 className="text-lg font-medium text-white">{activeUser.name}</h2>
          <p className="text-sm font-mono text-zinc-500 mt-1">
            {activeUser.handle}
          </p>

          <div className="flex gap-4 mt-6 w-full">
            <button className="flex-1 py-2 bg-blackred hover:bg-darkred border border-red-900 rounded-lg text-xs font-mono text-zinc-300 transition-colors">
              BLOCK
            </button>
            <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-mono text-zinc-300 transition-colors">
              MUTE
            </button>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-auto">
          <h3 className="text-[10px] font-mono uppercase text-zinc-600 mb-4 tracking-widest">
            Properties
          </h3>

          <div className="space-y-4 ">
            <div className="flex justify-between items-center group">
              <span className="text-sm text-zinc-500">User ID</span>
              <span className="text-xs font-mono text-zinc-300 bg-zinc-900 px-2 py-1 rounded border border-zinc-800 group-hover:border-zinc-700 transition-colors">
                #{activeUser.id * 8392}
              </span>
            </div>
            <div className="flex justify-between items-center group">
              <span className="text-sm text-zinc-500">Status</span>
              <span
                className={`text-xs font-mono px-2 py-1 rounded border border-white/5 ${
                  activeUser.status === 'online'
                    ? 'text-emerald-400 bg-emerald-400/10'
                    : activeUser.status === 'busy'
                      ? 'text-amber-400 bg-amber-400/10'
                      : 'text-zinc-400 bg-zinc-800'
                }`}
              >
                {activeUser.status
                  ? activeUser.status.toUpperCase()
                  : 'UNKNOWN'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-500">Joined</span>
              <span className="text-xs font-mono text-zinc-300">
                Oct 24, 2025
              </span>
            </div>
          </div>

          <h3 className="text-[10px] font-mono uppercase text-zinc-600 mt-10 mb-4 tracking-widest">
            Activity Map
          </h3>
          <div className="grid grid-cols-7 gap-1">
            {[...Array(35)].map((_, i) => (
              <div
                key={i}
                className={`aspect-square rounded-sm ${
                  Math.random() > 0.7
                    ? 'bg-indigo-500/40 shadow-[0_0_5px_rgba(99,102,241,0.2)]'
                    : 'bg-zinc-800/50'
                }`}
              />
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-white/5">
            <h3 className="text-[10px] font-mono uppercase text-zinc-600 mb-3 tracking-widest">
              Shared Media
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-zinc-900 rounded-lg border border-white/5 hover:border-white/20 transition-colors cursor-pointer"
                />
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
