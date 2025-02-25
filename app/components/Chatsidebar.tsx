// Chatsidebar.tsx
"use client";

import { useState } from "react";
import { Chat } from "../types/chat";
import { Trash2, Plus } from "lucide-react";

interface ChatSidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
}

export default function ChatSidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
}: ChatSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-20 bg-purple-500 text-white p-2 rounded-xl hover:bg-purple-600 transition-colors"
      >
        {isOpen ? "Close" : "Chats"}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed md:static inset-y-0 left-0 w-64 bg-gray-800 dark:bg-gray-900 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out z-10 flex flex-col shadow-lg border-r border-purple-700/20`}
      >
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold text-purple-300">Chat History</h2>
          <button
            onClick={onNewChat}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-700 text-white py-2 rounded-xl hover:from-purple-600 hover:to-purple-800 transition-all duration-200"
          >
            <Plus size={18} />
            New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`p-2 mb-2 rounded-xl cursor-pointer flex justify-between items-center transition-all duration-200 ${
                chat.id === activeChatId
                  ? "bg-purple-700/20 border-purple-600"
                  : "bg-gray-700 hover:bg-gray-600"
              } border border-transparent`}
              onClick={() => onSelectChat(chat.id)}
            >
              <span className="text-gray-200 truncate flex-1">
                {chat.title}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash2 size={18} />
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