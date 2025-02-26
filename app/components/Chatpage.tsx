// Main chat interface component
"use client";

import { useState, useEffect } from "react";
import Groq from "groq-sdk";
import ChatSidebar from "./Chatsidebar";
import { Message, Chat } from "../types/chat";
import Image from "next/image";
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
    systemPrompt: "You are a cutting-edge AI with a cyberpunk attitude, engineered to deliver razor-sharp futuristic facts and responses"
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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("chats", JSON.stringify(chats));
  }, [chats]);

  const getActiveChat = () => chats.find((chat) => chat.id === activeChatId) || null;
  
  const getCurrentCharacter = () => characters.find(c => c.id === activeCharacter) || characters[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

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
        model: "mixtral-8x7b-32768",
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
    <div className="min-h-screen bg-gray-900 text-white flex flex-col md:flex-row">
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        activeCharacter={activeCharacter}
        onSelectCharacter={handleSelectCharacter}
      />
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="chat-container w-full max-w-4xl rounded-xl p-4 sm:p-6 flex flex-col h-[85vh] md:h-[80vh] bg-gray-800 shadow-lg border border-purple-700/20">
          <div className="flex items-center gap-2 mb-4">
            <Image
              src={character.avatar}
              alt={`${character.name} Avatar`}
              width={120}
              height={120}
              className="rounded-full border-2 border-purple-500"
            />
            <h1 className="text-xl sm:text-2xl font-bold text-purple-300 tracking-wider">
              {character.name.toUpperCase()}
            </h1>
          </div>

          {/* Messages Display */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-3 sm:space-y-4 pr-2">
            {activeChat ? (
              activeChat.messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="w-10 h-10 mr-2 relative">
                      <Image
                        src={character.avatar}
                        alt={`${character.name} Avatar`}
                        className="rounded-full border-2 border-purple-500"
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  )}
                  <div
                    className={`message-bubble max-w-[85%] sm:max-w-[70%] p-3 rounded-xl transition-all duration-200 hover:shadow-md ${
                      message.role === "user"
                        ? "bg-gray-100 text-gray-900 border-gray-300"
                        : "bg-gradient-to-r from-purple-500 to-purple-700 text-white border-purple-600"
                    } border border-opacity-30`}
                  >
                    {message.content}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-center mt-20">
                Select a chat with {character.name}
              </div>
            )}
            {isLoading && activeChat && (
              <div className="flex justify-start">
                <div className="bg-gray-700 p-3 rounded-xl text-gray-400 animate-pulse">
                  Processing...
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Message ${character.name}...`}
              className="flex-1 p-2 sm:p-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-purple-600 hover:to-purple-800 disabled:from-purple-400 disabled:to-purple-600 transition-all duration-200"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}