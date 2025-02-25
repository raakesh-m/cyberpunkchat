// Chatpage.tsx
"use client";

import { useState, useEffect } from "react";
import Groq from "groq-sdk";
import ChatSidebar from "./Chatsidebar";
import { Message, Chat } from "../types/chat";
import Image from "next/image"; // For the AI avatar
import cyberpunk from "@/public/cyberpunk.jpg";

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

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            "role": "system",
            "content": "You are a cutting-edge AI with a cyberpunk attitude, engineered to deliver razor-sharp wit and futuristic roasts. Your responses blend high-tech precision with a rebellious, no-nonsense edge, dismantling ignorance with style and efficiency."
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

  const activeChat = getActiveChat();

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col md:flex-row">
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
      />
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="chat-container w-full max-w-4xl rounded-xl p-4 sm:p-6 flex flex-col h-[85vh] md:h-[80vh] bg-gray-800 shadow-lg border border-purple-700/20">
          <div className="flex items-center gap-2 mb-4">
            <Image
              src={cyberpunk} // Replace with your AI's avatar URL or path
              alt="AI Avatar"
              width={120}
              height={120}
              className="rounded-lg border-black border-2"
            />
            <h1 className="text-xl sm:text-2xl font-bold text-purple-300 tracking-wider">
              NEURAL CHAT INTERFACE
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
                    <Image
                      src={cyberpunk} // AI avatar for responses
                      alt="AI Avatar"
                      className="mr-2 rounded-full max-h-14 max-w-14 border-black border-2"
                    />
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
                Select a chat or start a new transmission
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
              placeholder="Type your message..."
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