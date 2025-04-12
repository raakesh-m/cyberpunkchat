import { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  ChevronDown, 
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Filter
} from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

type Character = {
  id: string;
  name: string;
  avatar: string;
};

const characters: Character[] = [
  { id: 'cyberpunk', name: 'Cyberpunk', avatar: '/avatars/cyberpunk.jpg' },
  { id: 'jarvis', name: 'Jarvis', avatar: '/avatars/jarvis.jpg' },
  { id: 'ultron', name: 'Ultron', avatar: '/avatars/ultron.jpg' },
  { id: 'joker', name: 'Joker', avatar: '/avatars/joker.jpg' },
  { id: 'darth_vader', name: 'Darth Vader', avatar: '/avatars/darth_vader.jpg' },
  { id: 'kratos', name: 'Kratos', avatar: '/avatars/kratos.jpg' },
];

type Chat = {
  id: string;
  title: string;
  timestamp: Date;
  character: string;
  preview: string;
};

// Example chats data
const exampleChats: Chat[] = [
  {
    id: '1',
    title: 'Project Brainstorming',
    timestamp: new Date(2023, 5, 15),
    character: 'jarvis',
    preview: 'I think we should focus on the AI integration first...'
  },
  {
    id: '2',
    title: 'Game Design Ideas',
    timestamp: new Date(2023, 5, 14),
    character: 'cyberpunk',
    preview: 'The cyberpunk aesthetic could work well with...'
  },
  {
    id: '3',
    title: 'Philosophical Questions',
    timestamp: new Date(2023, 5, 12),
    character: 'ultron',
    preview: 'The meaning of consciousness in an interconnected...'
  },
  {
    id: '4',
    title: 'Comedy Writing',
    timestamp: new Date(2023, 5, 10),
    character: 'joker',
    preview: 'The punchline needs more impact, maybe try...'
  },
  {
    id: '5',
    title: 'Leadership Strategy',
    timestamp: new Date(2023, 5, 8),
    character: 'darth_vader',
    preview: 'A strong leader must command respect through...'
  }
];

type SidebarProps = {
  currentCharacter: string;
  setCurrentCharacter: (character: string) => void;
  currentChat: string | null;
  setCurrentChat: (chatId: string | null) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
};

export const Sidebar = ({
  currentCharacter,
  setCurrentCharacter,
  currentChat,
  setCurrentChat,
  isMobileOpen,
  setIsMobileOpen
}: SidebarProps) => {
  const [isCharacterDropdownOpen, setIsCharacterDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredChats, setFilteredChats] = useState(exampleChats);
  const [activeTab, setActiveTab] = useState<'chats' | 'explore'>('chats');
  
  // Handle sidebar mode interaction
  const toggleCharacterDropdown = () => {
    setIsCharacterDropdownOpen(!isCharacterDropdownOpen);
    if (isUserMenuOpen) setIsUserMenuOpen(false);
  };
  
  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    if (isCharacterDropdownOpen) setIsCharacterDropdownOpen(false);
  };
  
  // Filter chats based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredChats(exampleChats);
    } else {
      const lowercaseSearch = searchTerm.toLowerCase();
      const filtered = exampleChats.filter(
        chat => chat.title.toLowerCase().includes(lowercaseSearch) || 
                chat.preview.toLowerCase().includes(lowercaseSearch)
      );
      setFilteredChats(filtered);
    }
  }, [searchTerm]);
  
  // Get current character info
  const getCurrentCharacter = () => {
    return characters.find(char => char.id === currentCharacter) || characters[0];
  };

  // Format chat time
  const formatChatTime = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: "-100%", opacity: 0 }
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar container */}
      <motion.aside
        className="sidebar fixed top-0 left-0 z-30 h-full w-80 flex flex-col lg:relative"
        variants={sidebarVariants}
        initial={false}
        animate={isMobileOpen ? "open" : "closed"}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
      >
        {/* Sidebar header with character selector and user menu */}
        <div className="sidebar-header flex items-center justify-between p-4">
          <div
            className="character-selector flex items-center gap-2 p-2 rounded-lg cursor-pointer"
            onClick={toggleCharacterDropdown}
          >
            <div className="character-avatar h-10 w-10 rounded-full overflow-hidden border-2 border-white/10">
              <Image
                src={getCurrentCharacter().avatar}
                alt={getCurrentCharacter().name}
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium">{getCurrentCharacter().name}</h3>
              <p className="text-xs text-gray-400">AI Character</p>
            </div>
            <ChevronDown 
              size={16} 
              className={`text-gray-400 transition-transform duration-200 ${isCharacterDropdownOpen ? 'rotate-180' : ''}`} 
            />
          </div>
          
          <div className="flex gap-1">
            <button 
              onClick={toggleUserMenu}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <User size={20} className="text-gray-400" />
            </button>
            <button 
              className="p-2 rounded-full hover:bg-white/5 transition-colors lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Character selection dropdown */}
        <AnimatePresence>
          {isCharacterDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden px-2"
            >
              <div className="character-grid">
                {characters.map((character) => (
                  <div
                    key={character.id}
                    className={`character-option ${currentCharacter === character.id ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentCharacter(character.id);
                      setIsCharacterDropdownOpen(false);
                    }}
                  >
                    <Image
                      src={character.avatar}
                      alt={character.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-1 z-10">
                      <p className="text-xs text-center text-white font-medium truncate">
                        {character.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User menu dropdown */}
        <AnimatePresence>
          {isUserMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="dropdown-menu absolute top-16 right-4 w-48 py-1 z-50"
            >
              <button className="dropdown-item w-full text-left px-4 py-2 flex items-center gap-2">
                <User size={16} className="text-gray-400" />
                <span>Profile</span>
              </button>
              <button className="dropdown-item w-full text-left px-4 py-2 flex items-center gap-2">
                <Settings size={16} className="text-gray-400" />
                <span>Settings</span>
              </button>
              <div className="border-t border-white/5 my-1"></div>
              <button className="dropdown-item w-full text-left px-4 py-2 flex items-center gap-2 text-red-400">
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab navigation */}
        <div className="sidebar-tabs flex border-b border-white/5 mt-1">
          <button
            className={`tab-item flex-1 py-3 text-sm font-medium ${activeTab === 'chats' ? 'active text-white' : 'text-gray-400 hover:text-gray-200'}`}
            onClick={() => setActiveTab('chats')}
          >
            Chats
          </button>
          <button
            className={`tab-item flex-1 py-3 text-sm font-medium ${activeTab === 'explore' ? 'active text-white' : 'text-gray-400 hover:text-gray-200'}`}
            onClick={() => setActiveTab('explore')}
          >
            Explore
          </button>
        </div>

        {/* Search section */}
        <div className="search-container flex items-center gap-2">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="search-input bg-transparent border-none text-sm w-full focus:outline-none text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Chats list */}
        {activeTab === 'chats' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-2">
              <button
                className="w-full flex items-center gap-2 p-3 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 transition-colors mb-2"
                onClick={() => {
                  setCurrentChat(null);
                  setIsMobileOpen(false);
                }}
              >
                <Plus size={18} />
                <span>New Chat</span>
              </button>
              
              {searchTerm && filteredChats.length === 0 ? (
                <div className="mt-4 text-center p-4">
                  <p className="text-sm text-gray-400">No chats found matching &quot;{searchTerm}&quot;</p>
                </div>
              ) : (
                filteredChats.map(chat => {
                  const chatCharacter = characters.find(c => c.id === chat.character);
                  return (
                    <div
                      key={chat.id}
                      className={`chat-item flex items-center gap-3 p-3 cursor-pointer ${currentChat === chat.id ? 'active' : ''}`}
                      onClick={() => {
                        setCurrentChat(chat.id);
                        setCurrentCharacter(chat.character);
                        setIsMobileOpen(false);
                      }}
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                        {chatCharacter && (
                          <Image
                            src={chatCharacter.avatar}
                            alt={chatCharacter.name}
                            width={32}
                            height={32}
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="text-sm font-medium truncate">{chat.title}</h3>
                          <span className="text-xs text-gray-400 flex-shrink-0 ml-1">{formatChatTime(chat.timestamp)}</span>
                        </div>
                        <p className="text-xs text-gray-400 truncate">{chat.preview}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Explore section */}
        {activeTab === 'explore' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-white/90 flex items-center gap-2">
                <Filter size={14} />
                Popular Prompts
              </h3>
              
              {['Creative Writing', 'Code Generation', 'Life Advice', 'Story Ideas', 'Learning Concepts'].map((category, index) => (
                <div 
                  key={index}
                  className="p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <h4 className="text-sm font-medium mb-1">{category}</h4>
                  <p className="text-xs text-gray-400">
                    Explore popular prompts for {category.toLowerCase()}
                  </p>
                </div>
              ))}
              
              <h3 className="text-sm font-medium text-white/90 flex items-center gap-2 mt-4">
                <Filter size={14} />
                Trending Topics
              </h3>
              
              <div className="flex flex-wrap gap-2">
                {['#AI', '#Creativity', '#Coding', '#Science', '#Philosophy', '#Games', '#Writing', '#Productivity'].map((tag, i) => (
                  <span key={i} className="pill">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sidebar footer */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="pill flex items-center gap-1">
                <span className="indicator"></span>
                <span>Free Plan</span>
              </span>
            </div>
            <button className="p-2 rounded-full hover:bg-white/5 transition-colors">
              <Settings size={18} className="text-gray-400" />
            </button>
          </div>
        </div>
      </motion.aside>
      
      {/* Mobile hamburger button */}
      <button
        className="fixed bottom-6 left-6 z-10 p-3 bg-gray-800/90 backdrop-blur-md rounded-full shadow-lg lg:hidden"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu size={20} />
      </button>
    </>
  );
}; 