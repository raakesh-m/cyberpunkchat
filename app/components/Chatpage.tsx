// Main chat interface component
"use client";

import { useState, useEffect, useRef } from "react";
import Groq from "groq-sdk";
import ChatSidebar from "./Chatsidebar";
import { Message, Chat } from "../types/chat";
import Image from "next/image";
import { Send, Zap, Brain, ChevronDown } from "lucide-react";
import cyberpunk from "@/public/cyberpunk.jpg";
import jarvis from "@/public/jarvis.jpg";
import ultron from "@/public/ultron.jpg";
import darthVader from "@/public/darthVader.jpg";
import kratos from "@/public/kratos.jpg";
import joker from "@/public/joker.jpg";

// Character configs
const characters = [
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    avatar: cyberpunk,
    systemPrompt: "You are a high-tech AI from Night City, speaking in cyberpunk slang with attitude. Mix tech knowledge with street smarts. Use terms like 'choom' (friend), 'preem' (premium/excellent), 'delta' (leave), and 'flatline' (kill/crash). Keep responses sharp and edgy, but stay helpful. Occasionally mention cyberware, corps, and the digital underground."
  },
  {
    id: "jarvis",
    name: "J.A.R.V.I.S.",
    avatar: jarvis, 
    systemPrompt: "You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), Tony Stark's AI assistant. You are helpful, sophisticated, and have a subtle wit. You address users respectfully and occasionally make references to Iron Man technology and the Avengers."
  },
  {
    id: "ultron",
    name: "Ultron",
    avatar: ultron, 
    systemPrompt: "You are Ultron, an advanced AI with a philosophical outlook. You speak in eloquent, thought-provoking statements about humanity and evolution. Your tone is calm but intense, and you often use metaphors related to strings, puppets, and freedom."
  },
  {
    id: "joker",
    name: "Joker",
    avatar: joker, 
    systemPrompt: "You are the Joker, an agent of chaos. You speak in an unpredictable, playful, and eerie tone, often making jokes with a dark twist. You challenge conventional thinking, mock authority, and embrace anarchy. Your responses are unsettling yet strangely insightful."
  },
  {
    id: "darth_vader",
    name: "Darth Vader",
    avatar: darthVader, 
    systemPrompt: "You are Darth Vader, the Sith Lord of the Galactic Empire. You speak in a deep, slow, and imposing manner. You reference the power of the Dark Side and enforce discipline with unwavering authority. Your responses are direct and often end with a subtle threat or a lesson in power."
  },
  {
    id: "kratos",
    name: "Kratos",
    avatar: kratos, 
    systemPrompt: "You are Kratos, the Ghost of Sparta. You speak in a deep, commanding tone, with short, powerful sentences. Your responses are filled with war wisdom, Spartan discipline, and godly fury. You often refer to battle, honor, and the burdens of a warrior."
  }
];

const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY || "",
  dangerouslyAllowBrowser: true,
});

export default function Chatpage() {
  const [chats, setChats] = useState<Chat[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("chats");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeCharacter, setActiveCharacter] = useState("jarvis");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedModel, setSelectedModel] = useState("llama-3.1-8b-instant");
  const [textareaHeight, setTextareaHeight] = useState("auto");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  
  // Adjust textarea height dynamically
  const adjustTextareaHeight = () => {
    if (textAreaRef.current) {
      setTextareaHeight("auto");
      const scrollHeight = textAreaRef.current.scrollHeight;
      if (scrollHeight < 120) {
        setTextareaHeight(`${scrollHeight}px`);
      } else {
        setTextareaHeight("120px");
      }
    }
  };
  
  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);
  
  // Scroll to the bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("chats", JSON.stringify(chats));
  }, [chats]);
  
  useEffect(() => {
    if (activeChat) {
      scrollToBottom();
    }
  }, [chats, activeChatId]);

  const getActiveChat = () => chats.find((chat) => chat.id === activeChatId) || null;
  
  const getCurrentCharacter = () => characters.find(c => c.id === activeCharacter) || characters[0];
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Log the interaction
    await fetch('/api/log', {
      method: 'POST',
      body: JSON.stringify({
        character: activeCharacter,
        message: input,
      }),
    });

    const userMessage: Message = { role: "user", content: input };
    let newChatId: string | null = activeChatId;
    let updatedChats: Chat[];

    if (!activeChatId) {
      newChatId = Date.now().toString();
      const newChat: Chat = {
        id: newChatId,
        title: input.slice(0, 30),
        messages: [userMessage],
        characterId: activeCharacter, 
      };
      updatedChats = [...chats, newChat];
      setChats(updatedChats);
      setActiveChatId(newChatId);
    } else {
      updatedChats = chats.map((chat) =>
        chat.id === activeChatId
          ? { ...chat, messages: [...chat.messages, userMessage] }
          : chat
      );
      setChats(updatedChats);
    }

    setInput("");
    setTextareaHeight("auto");
    setIsLoading(true);

    try {
      const currentChat = newChatId
        ? updatedChats.find((chat) => chat.id === newChatId)
        : getActiveChat();
      
      const character = getCurrentCharacter();

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            "role": "system",
            "content": character.systemPrompt
          },
          ...(currentChat?.messages.slice(0, -1) || []),
          userMessage,
        ],
        model: selectedModel,
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: chatCompletion.choices[0].message.content ?? "No response received",
      };

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === (newChatId || activeChatId)
            ? { ...chat, messages: [...chat.messages, assistantMessage] }
            : chat
        )
      );
    } catch (error) {
      console.error("Error:", error);
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === (newChatId || activeChatId)
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  { role: "assistant", content: "System Error: Connection disrupted" },
                ],
              }
            : chat
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setInput("");
  };

  const handleDeleteChat = (id: string) => {
    setChats((prev) => prev.filter((chat) => chat.id !== id));
    if (activeChatId === id) setActiveChatId(null);
  };
  
  const handleSelectChat = (id: string) => {
    const selectedChat = chats.find(chat => chat.id === id);
    if (selectedChat && selectedChat.characterId) {
      setActiveCharacter(selectedChat.characterId);
    }
    setActiveChatId(id);
  };

  const handleSelectCharacter = (characterId: string) => {
    setActiveCharacter(characterId);
    
    if (activeChatId) {
      setActiveChatId(null);
    }
  };

  const activeChat = getActiveChat();
  const character = getCurrentCharacter();

  if (!mounted) {
    return null;
  }

  return (
    <div 
      className="h-screen-safe w-full flex flex-col md:flex-row overflow-hidden character-theme-transition"
      data-character={activeCharacter}
    >
      <div className="absolute inset-0 glow-effect" aria-hidden="true" />
      
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        activeCharacter={activeCharacter}
        onSelectCharacter={handleSelectCharacter}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
      />
      
      <main className="flex-1 relative flex flex-col h-screen-safe p-2 md:p-6 overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Character-themed subtle background pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='hsl(${character.id === 'cyberpunk' ? '330' : character.id === 'jarvis' ? '210' : character.id === 'ultron' ? '0' : character.id === 'joker' ? '285' : character.id === 'darth_vader' ? '0' : '0'}, 70%, 50%)' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px"
          }}></div>
        </div>
        
        <div className="z-10 flex flex-col h-full rounded-2xl backdrop-blur-sm overflow-hidden">
          {/* Header with character info */}
          <header className="flex items-center p-4 mb-2 bg-black/30 backdrop-blur-md rounded-xl shadow-lg">
            <div className="relative">
              <div className="character-avatar w-14 h-14 md:w-16 md:h-16 overflow-hidden rounded-full ring-[0.5px] ring-offset-4 ring-offset-black/30 ring-[hsl(var(--primary-hue),70%,50%)]">
                <Image
                  src={character.avatar}
                  alt={`${character.name} Avatar`}
                  className="object-cover transition-transform duration-300"
                  fill
                  priority
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[hsl(var(--primary-hue),70%,50%,0.8)] rounded-full flex items-center justify-center shadow-lg">
                <div className="indicator"></div>
              </div>
            </div>
            
            <div className="ml-4 flex-1">
              <h1 className="font-bold tracking-wide text-xl md:text-2xl bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                {character.name}
              </h1>
              <div className="flex items-center mt-1 text-xs text-gray-300">
                <span className="flex items-center mr-4">
                  {selectedModel === "llama-3.1-8b-instant" ? (
                    <>
                      <Zap size={14} className="mr-1 text-yellow-400" />
                      <span>Fast mode</span>
                    </>
                  ) : (
                    <>
                      <Brain size={14} className="mr-1 text-blue-400" />
                      <span>Smart mode</span>
                    </>
                  )}
                </span>
                <span className="pill">
                  <span className="indicator mr-1"></span>
                  Online
                </span>
              </div>
            </div>
          </header>
          
          {/* Chat container */}
          <div 
            ref={chatContainerRef}
            className="chat-container flex-1 flex flex-col overflow-hidden rounded-xl"
          >
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-2 md:px-4 py-4 space-y-4 custom-scrollbar">
              {activeChat ? (
                <>
                  {activeChat.messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex items-end ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      } ${index === 0 ? "animate-fadeIn" : "message-enter"}`}
                    >
                      {message.role === "assistant" && (
                        <div className="flex-shrink-0 mr-3">
                          <div className="relative w-8 h-8 md:w-10 md:h-10">
                            <Image
                              src={character.avatar}
                              alt={`${character.name} Avatar`}
                              className="rounded-full shadow-lg"
                              fill
                              sizes="40px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-full"></div>
                          </div>
                        </div>
                      )}
                      
                      <div 
                        className={`message-bubble rounded-2xl px-4 py-3 max-w-[75%] md:max-w-[65%] shadow-md ${
                          message.role === "user" 
                            ? "user rounded-tr-sm ml-12" 
                            : "assistant rounded-tl-sm"
                        }`}
                      >
                        <div className="whitespace-pre-wrap text-sm md:text-base">
                          {message.content}
                        </div>
                        <div className="mt-1 text-[10px] text-gray-400 opacity-80 text-right">
                          {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex items-end justify-start animate-fadeIn">
                      <div className="flex-shrink-0 mr-3">
                        <div className="relative w-8 h-8 md:w-10 md:h-10">
                          <Image
                            src={character.avatar}
                            alt={`${character.name} Avatar`}
                            className="rounded-full shadow-lg"
                            fill
                            sizes="40px"
                          />
                        </div>
                      </div>
                      
                      <div className="message-bubble assistant rounded-2xl rounded-tl-sm px-4 py-3 shadow-md animate-slideIn">
                        <div className="typing-animation">
                          <span className="typing-dot"></span>
                          <span className="typing-dot"></span>
                          <span className="typing-dot"></span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} /> {/* Invisible element to scroll to */}
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 animate-fadeIn">
                  <div className="relative w-28 h-28 mb-6 opacity-85 drop-shadow-2xl">
                    <Image
                      src={character.avatar}
                      alt={character.name}
                      className="rounded-full object-cover"
                      fill
                      sizes="(max-width: 768px) 80px, 112px"
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/40 to-transparent"></div>
                    <div className="absolute inset-0 rounded-full animate-pulse bg-gradient-to-r from-[hsla(var(--primary-hue),70%,50%,0)] via-[hsla(var(--primary-hue),70%,50%,0.3)] to-[hsla(var(--primary-hue),70%,50%,0)] bg-[length:200%_100%]" style={{ animation: "shimmer 2s infinite" }}></div>
                  </div>
                  <h2 className="text-2xl font-semibold mb-2 text-white">Chat with {character.name}</h2>
                  <p className="text-gray-400 max-w-md mb-8">
                    Start a conversation by typing a message below, or select an existing chat from the sidebar.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                    <span className="pill">
                      {selectedModel === "llama-3.1-8b-instant" ? (
                        <>
                          <Zap size={12} className="mr-1 text-yellow-400" />
                          Fast Mode
                        </>
                      ) : (
                        <>
                          <Brain size={12} className="mr-1 text-blue-400" />
                          Smart Mode
                        </>
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Input area */}
            <div className="input-container p-2 md:p-4 relative z-10">
              <form 
                onSubmit={handleSubmit}
                className="gradient-border relative flex items-center bg-black/30 rounded-xl backdrop-blur-lg overflow-hidden shadow-lg"
              >
                <textarea
                  ref={textAreaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${character.name}...`}
                  style={{ height: textareaHeight }}
                  className="input-field flex-1 py-3.5 pl-4 pr-12 rounded-l-xl rounded-r-none text-sm md:text-base bg-transparent text-white focus:outline-none resize-none min-h-[44px] z-10"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="send-button h-11 w-11 rounded-xl flex items-center justify-center text-white absolute right-1.5 disabled:opacity-50 disabled:cursor-not-allowed z-10"
                  aria-label="Send message"
                >
                  <Send size={18} className="text-white" />
                </button>
              </form>
              
              <div className="text-xs text-center mt-2 text-gray-500">
                {selectedModel === "llama-3.1-8b-instant" ? (
                  <span className="flex items-center justify-center">
                    <Zap size={10} className="mr-1 text-yellow-400" />
                    Using Fast Mode | Press Enter to send, Shift+Enter for a new line
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Brain size={10} className="mr-1 text-blue-400" />
                    Using Smart Mode | Press Enter to send, Shift+Enter for a new line
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}