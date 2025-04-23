import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import chatHistoryService from '../services/chatHistoryService';
import menuService from '../services/menuService';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const { user, preferences } = useAuth();
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [menuData, setMenuData] = useState(null);
  const [menuDataLoading, setMenuDataLoading] = useState(false);

  // Load menu data on mount
  useEffect(() => {
    loadMenuData();
  }, []);

  // Create or load a session when user logs in
  useEffect(() => {
    if (user) {
      initializeSession();
    } else {
      // Clear session when user logs out
      setCurrentSessionId(null);
      setMessages([]);
    }
  }, [user]);

  // Load messages when session changes
  useEffect(() => {
    if (currentSessionId) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [currentSessionId]);

  const loadMenuData = async () => {
    setMenuDataLoading(true);
    try {
      const { data, error } = await menuService.getMenuDataForAI();
      if (error) throw error;
      setMenuData(data);
    } catch (err) {
      console.error('Error loading menu data:', err);
      // Don't set the error message to prevent it from being displayed to users
      // Instead, log it for debugging purposes only
    } finally {
      setMenuDataLoading(false);
    }
  };

  const initializeSession = async () => {
    try {
      // Get the most recent session or create a new one
      const { data: sessions } = await chatHistoryService.getChatSessions(user.id);

      if (sessions && sessions.length > 0) {
        setCurrentSessionId(sessions[0].id);
      } else {
        const { data: newSession } = await chatHistoryService.createChatSession(user.id);
        setCurrentSessionId(newSession.id);
      }
    } catch (err) {
      console.error('Error initializing session:', err);
      setError('Failed to initialize chat session');
    }
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await chatHistoryService.getChatMessages(currentSessionId);
      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load chat messages');
    } finally {
      setLoading(false);
    }
  };

  const createNewSession = async () => {
    try {
      const { data, error } = await chatHistoryService.createChatSession(user.id);
      if (error) throw error;
      setCurrentSessionId(data.id);
      setMessages([]);
      return data.id;
    } catch (err) {
      console.error('Error creating new session:', err);
      setError('Failed to create new chat');
      return null;
    }
  };

  const selectSession = async (sessionId) => {
    setCurrentSessionId(sessionId);
  };

  const addMessage = async (role, content, metadata = {}) => {
    try {
      // If no session exists, create one
      if (!currentSessionId) {
        const newSessionId = await createNewSession();
        if (!newSessionId) throw new Error('Failed to create session');
      }

      // Add message to UI immediately for better UX
      const tempMessage = {
        id: `temp-${Date.now()}`,
        session_id: currentSessionId,
        role,
        content,
        metadata,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, tempMessage]);

      // Save message to database
      const { data, error } = await chatHistoryService.saveMessage(
        currentSessionId,
        role,
        content,
        metadata
      );

      if (error) throw error;

      // Replace temp message with saved message
      setMessages(prev =>
        prev.map(msg => msg.id === tempMessage.id ? data : msg)
      );

      // If this is the first user message, generate a title
      if (role === 'user' && messages.length === 0) {
        await chatHistoryService.generateSessionTitle(currentSessionId);
      }

      return data;
    } catch (err) {
      console.error('Error adding message:', err);
      setError('Failed to save message');
      return null;
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      const { error } = await chatHistoryService.deleteMessage(messageId);
      if (error) throw error;

      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (err) {
      console.error('Error deleting message:', err);
      setError('Failed to delete message');
    }
  };

  const clearMessages = async () => {
    try {
      // Create a new session instead of clearing the current one
      await createNewSession();
    } catch (err) {
      console.error('Error clearing messages:', err);
      setError('Failed to clear messages');
    }
  };

  const value = {
    currentSessionId,
    messages,
    loading,
    error,
    menuData,
    menuDataLoading,
    createNewSession,
    selectSession,
    addMessage,
    deleteMessage,
    clearMessages,
    setError
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatContext;
