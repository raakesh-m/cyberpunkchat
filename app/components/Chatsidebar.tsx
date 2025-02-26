// Sidebar with chat history and character selection
"use client";

import { useState } from "react";
import { Chat } from "../types/chat";
import { Trash2, Plus, Menu, X } from "lucide-react";
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
}

export default function ChatSidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  activeCharacter = "jarvis",
  onSelectCharacter,
}: ChatSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCharacters, setShowCharacters] = useState(false);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-20 p-2 bg-gray-800 rounded-md text-white"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button> 

      {/* Sidebar */}
      <div
        className={`fixed md:static inset-y-0 left-0 w-72 bg-gray-800 dark:bg-gray-900 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out z-10 flex flex-col shadow-lg border-r border-purple-700/20`}
      >
        {/* Character Selector */}
        <div className="p-4 border-b mt-12 md:mt-0 border-gray-700">
          <div className="relative">
            <button 
              onClick={() => setShowCharacters(!showCharacters)}
              className="w-full flex items-center justify-between gap-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white py-3 px-4 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 border border-purple-500/20"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 relative rounded-full overflow-hidden ring-2 ring-purple-500 ring-offset-2 ring-offset-gray-800">
                  <Image 
                    src={characters.find(c => c.id === activeCharacter)?.avatar || cyberpunk} 
                    alt="Character" 
                    fill 
                    className="object-cover"
                  />
                </div>
                <div className="text-left">
                  <span className="block text-sm font-medium">
                    {characters.find(c => c.id === activeCharacter)?.name}
                  </span>
                  <span className="block text-xs text-gray-400">Select Character</span>
                </div>
              </div>
              <X 
                size={16} 
                className={`transform transition-transform duration-200 ${showCharacters ? 'rotate-180' : 'rotate-0'}`} 
              />
            </button>
            
            {/* Character List Dropdown */}
            {showCharacters && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-xl overflow-hidden border border-purple-500/20 shadow-xl z-50 transform transition-all duration-200 ease-out">
                {characters.map(character => (
                  <div 
                    key={character.id}
                    onClick={() => {
                      onSelectCharacter(character.id);
                      setShowCharacters(false);
                    }}
                    className={`flex items-center gap-3 p-3 cursor-pointer transition-colors duration-200 ${
                      activeCharacter === character.id 
                        ? 'bg-purple-600/20' 
                        : 'hover:bg-gray-700'
                    }`}
                  >
                    <div className="w-10 h-10 relative rounded-full overflow-hidden ring-2 ring-purple-500/50">
                      <Image 
                        src={character.avatar} 
                        alt={character.name} 
                        fill 
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <span className="block font-medium text-white">
                        {character.name}
                      </span>
                      <span className="block text-xs text-gray-400">
                        {character.description}
                      </span>
                    </div>
                    {activeCharacter === character.id && (
                      <div className="text-purple-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <h2 className="text-lg mt-6 font-bold text-purple-300">Chat History</h2>
          <button
            onClick={onNewChat}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-700 text-white py-3 rounded-xl hover:from-purple-600 hover:to-purple-800 transition-all duration-200"
          >
            <Plus size={18} />
            New Chat
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`p-3 mb-2 rounded-xl cursor-pointer flex items-center gap-2 transition-all duration-200 ${
                chat.id === activeChatId
                  ? "bg-purple-700/20 border-purple-600"
                  : "bg-gray-700 hover:bg-gray-600"
              } border border-transparent`}
            >
              {/* Character avatar for each chat */}
              <div className="w-8 h-8 relative rounded-full overflow-hidden ring-1 ring-purple-500/50 flex-shrink-0">
                <Image 
                  src={characters.find(c => c.id === chat.characterId)?.avatar || cyberpunk} 
                  alt="Character" 
                  fill 
                  className="object-cover"
                />
              </div>
              
              <div className="flex-1">
                <span className="text-gray-200 truncate block">
                  {chat.title}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(parseInt(chat.id)).toLocaleDateString()}
                </span>
              </div>
              
              <span className="px-2 py-1 text-xs bg-purple-600/30 rounded-full">
                {chat.messages.length} msgs
              </span>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
                className="text-red-400 hover:text-red-300 transition-colors p-1 rounded hover:bg-red-400/10"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {chats.length === 0 && (
            <p className="text-gray-400 p-2 text-center">No chats yet. Start a new one!</p>
          )}
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}