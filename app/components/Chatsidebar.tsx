// Sidebar with chat history and character selection
"use client";

import { useState, useEffect, useRef } from "react";
import { Chat } from "../types/chat";
import { Trash2, Plus, Menu, X, Zap, MessageCircle, Brain, Search, ChevronDown, LayoutGrid } from "lucide-react";
import Image from "next/image";
import cyberpunk from "@/public/cyberpunk.jpg";
import jarvis from "@/public/jarvis.jpg";
import ultron from "@/public/ultron.jpg";
import joker from "@/public/joker.jpg";
import darthVader from "@/public/darthVader.jpg";
import kratos from "@/public/kratos.jpg";

// Available AI characters
const characters = [
  { 
    id: "cyberpunk", 
    name: "Cyberpunk AI", 
    avatar: cyberpunk,
    description: "A cutting-edge AI with attitude and style"
  },
  { 
    id: "jarvis", 
    name: "J.A.R.V.I.S.", 
    avatar: jarvis,
    description: "Tony Stark's sophisticated AI assistant"
  },
  { 
    id: "ultron", 
    name: "Ultron", 
    avatar: ultron,
    description: "An advanced AI with philosophical depth"
  },
  { 
    id: "joker", 
    name: "Joker", 
    avatar: joker,
    description: "An unpredictable agent of chaos with dark humor"
  },
  { 
    id: "darth_vader", 
    name: "Darth Vader", 
    avatar: darthVader,
    description: "The imposing Sith Lord of the Galactic Empire"
  },
  { 
    id: "kratos", 
    name: "Kratos", 
    avatar: kratos,
    description: "The Ghost of Sparta with wisdom of war and battle"
  }
];

interface ChatSidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  activeCharacter: string;
  onSelectCharacter: (characterId: string) => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
}

export default function ChatSidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  activeCharacter = "jarvis",
  onSelectCharacter,
  selectedModel,
  onSelectModel,
}: ChatSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCharacters, setShowCharacters] = useState(false);
  const [showModels, setShowModels] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'chats' | 'characters'>('chats');
  
  const characterMenuRef = useRef<HTMLDivElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);
  
  // Filter chats based on search term
  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Close sidebar on mobile when a chat is selected
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  }, [activeChatId]);
  
  // Handle clicks outside dropdown menus
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (characterMenuRef.current && !characterMenuRef.current.contains(event.target as Node)) {
        setShowCharacters(false);
      }
      if (modelMenuRef.current && !modelMenuRef.current.contains(event.target as Node)) {
        setShowModels(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-6 right-6 z-30 p-2 bg-black/30 rounded-xl backdrop-blur-md text-white hover:bg-black/40 transition-all"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button> 

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen-safe w-[300px] sidebar-gradient transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-all duration-300 ease-in-out z-20 flex flex-col shadow-2xl md:shadow-none overflow-hidden`}
      >
        <div className="relative h-full flex flex-col backdrop-blur-sm">
          {/* Glowing effect for the sidebar */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -inset-[100px] opacity-50" 
                style={{
                  background: `radial-gradient(circle at 50% 40%, 
                    hsla(var(--primary-hue), 70%, 40%, 0.8) 0%, 
                    hsla(var(--primary-hue), 70%, 30%, 0) 50%
                  )`
                }}>
            </div>
          </div>
          
          {/* Sidebar Header */}
          <header className="relative p-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsla(var(--primary-hue),70%,50%,0.8)] to-[hsla(var(--primary-hue),70%,30%,0.8)] flex items-center justify-center shadow-lg">
                <MessageCircle size={18} className="text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-white">AI Companion</h1>
                <p className="text-xs text-gray-300 opacity-80">Powered by LLMs</p>
              </div>
            </div>
          </header>
          
          {/* Character Selector - Always visible at the top */}
          <div ref={characterMenuRef} className="relative px-4 pt-5 pb-3">
            <div 
              onClick={() => setShowCharacters(!showCharacters)}
              className="character-selector flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all shadow-md"
            >
              <div className="w-12 h-12 relative rounded-full overflow-hidden ring-1 ring-white/20 shadow-inner">
                <Image 
                  src={characters.find(c => c.id === activeCharacter)?.avatar || cyberpunk} 
                  alt="Character" 
                  fill 
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-white truncate">
                    {characters.find(c => c.id === activeCharacter)?.name}
                  </span>
                  <ChevronDown 
                    size={16} 
                    className={`text-gray-400 transform transition-transform duration-300 ${
                      showCharacters ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  {characters.find(c => c.id === activeCharacter)?.description}
                </p>
              </div>
            </div>
            
            {/* Character dropdown */}
            {showCharacters && (
              <div className="dropdown-menu absolute left-4 right-4 mt-2 py-2 bg-[hsla(var(--primary-hue),20%,15%,0.97)] backdrop-blur-lg rounded-xl border border-white/10 shadow-xl z-50 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="px-3 py-2 border-b border-white/10 mb-2">
                  <h3 className="text-sm font-medium text-white">Select Character</h3>
                </div>
                {characters.map(character => (
                  <div 
                    key={character.id}
                    onClick={() => {
                      onSelectCharacter(character.id);
                      setShowCharacters(false);
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 mx-2 my-1 rounded-lg cursor-pointer transition-all ${
                      activeCharacter === character.id 
                        ? 'bg-[hsla(var(--primary-hue),60%,50%,0.2)]' 
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="w-10 h-10 relative rounded-lg overflow-hidden ring-1 ring-white/20 shadow-lg">
                      <Image 
                        src={character.avatar} 
                        alt={character.name} 
                        fill 
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-white truncate">
                        {character.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {character.description}
                      </p>
                    </div>
                    {activeCharacter === character.id && (
                      <div className="text-[hsla(var(--primary-hue),70%,60%,1)]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex justify-center border-b border-white/10 px-4 pt-1">
            <button
              onClick={() => setActiveTab('chats')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
                activeTab === 'chats'
                  ? 'border-[hsla(var(--primary-hue),70%,60%,1)] text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <MessageCircle size={16} />
              Chats
            </button>
            <button
              onClick={() => setActiveTab('characters')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
                activeTab === 'characters'
                  ? 'border-[hsla(var(--primary-hue),70%,60%,1)] text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <LayoutGrid size={16} />
              Characters
            </button>
          </div>
          
          {/* Search and New Chat */}
          {activeTab === 'chats' && (
            <div className="flex items-center gap-2 p-4">
              <div className="search-container relative flex-1 rounded-lg overflow-hidden">
                <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search chats"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input w-full h-10 py-2.5 pl-9 pr-3 text-sm text-white placeholder-gray-400 focus:ring-1 focus:ring-[hsla(var(--primary-hue),70%,60%,0.5)] bg-black/20 relative z-10"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                onClick={onNewChat}
                className="sidebar-button p-2.5 rounded-lg text-white hover:shadow-lg"
                title="New Chat"
              >
                <Plus size={16} className="text-white" />
              </button>
            </div>
          )}
          
          {/* Chat List or Character Grid */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1">
            {activeTab === 'chats' ? (
              <>
                {filteredChats.length > 0 ? (
                  <div className="space-y-2">
                    {filteredChats.map((chat) => (
                      <div
                        key={chat.id}
                        onClick={() => onSelectChat(chat.id)}
                        className={`group p-3 rounded-xl cursor-pointer border transition-all ${
                          chat.id === activeChatId
                            ? "bg-[hsla(var(--primary-hue),60%,50%,0.15)] border-[hsla(var(--primary-hue),70%,50%,0.3)] shadow-[0_0_10px_rgba(var(--primary-hue),70%,50%,0.1)]"
                            : "bg-white/5 border-white/10 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Character avatar for each chat */}
                          <div className="w-9 h-9 relative rounded-full overflow-hidden flex-shrink-0 shadow-md">
                            <Image 
                              src={characters.find(c => c.id === chat.characterId)?.avatar || cyberpunk} 
                              alt="Character" 
                              fill 
                              className="object-cover"
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-white truncate">
                                {chat.title}
                              </span>
                              <span className="pill text-xs">
                                {chat.messages.length}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-gray-400">
                                {new Date(parseInt(chat.id)).toLocaleDateString()}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteChat(chat.id);
                                }}
                                className="text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-white/10"
                                aria-label="Delete chat"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchTerm ? (
                  <div className="text-center py-10 px-2">
                    <Search size={36} className="mx-auto text-gray-600 mb-3" />
                    <p className="text-gray-400 text-sm">No chats found matching &quot;{searchTerm}&quot;</p>
                    <button 
                      onClick={() => setSearchTerm("")}
                      className="mt-3 text-xs text-[hsla(var(--primary-hue),70%,60%,1)] hover:underline"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-12 px-2">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center shadow-inner">
                      <MessageCircle size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-white font-medium text-lg mb-2">No conversations yet</h3>
                    <p className="text-gray-400 text-sm mb-6">Start a new chat to begin talking with an AI character</p>
                    <button
                      onClick={onNewChat}
                      className="sidebar-button px-5 py-2.5 rounded-lg text-white flex items-center justify-center gap-2 mx-auto shadow-xl"
                    >
                      <Plus size={16} />
                      New Chat
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {characters.map(character => (
                  <div 
                    key={character.id}
                    onClick={() => {
                      onSelectCharacter(character.id);
                      setActiveTab('chats');
                      onNewChat();
                    }}
                    className={`character-selector p-3 rounded-xl cursor-pointer transition-all ${
                      activeCharacter === character.id && activeChatId === null
                        ? "bg-[hsla(var(--primary-hue),60%,50%,0.15)] border-[hsla(var(--primary-hue),70%,50%,0.3)]"
                        : "hover:bg-white/10"
                    }`}
                  >
                    <div className="relative w-full h-28 rounded-lg overflow-hidden mb-2 shadow-lg">
                      <Image 
                        src={character.avatar} 
                        alt={character.name} 
                        fill 
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/0"></div>
                      <div className="absolute bottom-2 left-2">
                        <span className="text-xs font-medium text-white bg-black/50 rounded-full px-2 py-0.5 backdrop-blur-sm">
                          {character.name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Model Selector and Settings */}
          <div ref={modelMenuRef} className="relative mt-auto border-t border-white/10 p-4">
            <div className="flex justify-between items-center">
              <div 
                onClick={() => setShowModels(!showModels)}
                className="flex items-center gap-2 cursor-pointer group"
              >
                {selectedModel === "llama-3.1-8b-instant" ? (
                  <div className="p-1.5 rounded-lg bg-yellow-500/10">
                    <Zap size={16} className="text-yellow-400" />
                  </div>
                ) : (
                  <div className="p-1.5 rounded-lg bg-blue-500/10">
                    <Brain size={16} className="text-blue-400" />
                  </div>
                )}
                <div className="text-sm text-white group-hover:text-[hsla(var(--primary-hue),70%,80%,1)] transition-colors">
                  {selectedModel === "llama-3.1-8b-instant" ? "Fast Mode" : "Smart Mode"}
                </div>
                <ChevronDown 
                  size={14} 
                  className={`text-gray-400 group-hover:text-white transition-all ${
                    showModels ? 'rotate-180' : ''
                  }`}
                />
              </div>
              
              
            </div>
            
            {/* Model dropdown */}
            {showModels && (
              <div className="dropdown-menu absolute bottom-full left-0 right-0 mb-2 py-2 bg-[hsla(var(--primary-hue),20%,15%,0.97)] backdrop-blur-lg rounded-xl border border-white/10 shadow-xl z-50">
                <div className="px-3 py-2 border-b border-white/10 mb-1">
                  <h3 className="text-sm font-medium text-white">Select Model</h3>
                </div>
                <div 
                  onClick={() => {
                    onSelectModel("llama-3.1-8b-instant");
                    setShowModels(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 mx-2 my-1 rounded-lg cursor-pointer transition-all ${
                    selectedModel === "llama-3.1-8b-instant" 
                      ? 'bg-[hsla(var(--primary-hue),60%,50%,0.2)]' 
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-yellow-500/10">
                    <Zap size={18} className="text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-white">
                      Fast Mode
                    </p>
                    <p className="text-xs text-gray-400">
                      llama-3.1-8b-instant - Quicker responses
                    </p>
                  </div>
                  {selectedModel === "llama-3.1-8b-instant" && (
                    <div className="text-[hsla(var(--primary-hue),70%,60%,1)]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <div 
                  onClick={() => {
                    onSelectModel("llama-3.3-70b-versatile");
                    setShowModels(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 mx-2 my-1 rounded-lg cursor-pointer transition-all ${
                    selectedModel === "llama-3.3-70b-versatile" 
                      ? 'bg-[hsla(var(--primary-hue),60%,50%,0.2)]' 
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-blue-500/10">
                    <Brain size={18} className="text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-white">
                      Smart Mode
                    </p>
                    <p className="text-xs text-gray-400">
                      llama-3.3-70b-versatile - More advanced
                    </p>
                  </div>
                  {selectedModel === "llama-3.3-70b-versatile" && (
                    <div className="text-[hsla(var(--primary-hue),70%,60%,1)]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm md:hidden z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}