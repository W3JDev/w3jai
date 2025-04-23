import supabase from './supabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service for managing chat history
 */
class ChatHistoryService {
  /**
   * Get all chat sessions for a user
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} Chat sessions and error if any
   */
  async getChatSessions(userId) {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
      return { data: [], error };
    }
  }

  /**
   * Create a new chat session
   * @param {string} userId - The user ID
   * @param {string} title - The chat session title
   * @returns {Promise<Object>} Created chat session and error if any
   */
  async createChatSession(userId, title = 'New Chat') {
    try {
      const sessionId = uuidv4();
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          id: sessionId,
          user_id: userId,
          title,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating chat session:', error);
      return { data: null, error };
    }
  }

  /**
   * Update a chat session
   * @param {string} sessionId - The chat session ID
   * @param {Object} updates - The updates to apply
   * @returns {Promise<Object>} Updated chat session and error if any
   */
  async updateChatSession(sessionId, updates) {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating chat session:', error);
      return { data: null, error };
    }
  }

  /**
   * Delete a chat session
   * @param {string} sessionId - The chat session ID
   * @returns {Promise<Object>} Result of the delete operation
   */
  async deleteChatSession(sessionId) {
    try {
      // First delete all messages in the session
      const { error: messagesError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('session_id', sessionId);
      
      if (messagesError) throw messagesError;
      
      // Then delete the session
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting chat session:', error);
      return { error };
    }
  }

  /**
   * Get messages for a chat session
   * @param {string} sessionId - The chat session ID
   * @returns {Promise<Object>} Chat messages and error if any
   */
  async getChatMessages(sessionId) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      return { data: [], error };
    }
  }

  /**
   * Save a chat message
   * @param {string} sessionId - The chat session ID
   * @param {string} role - The message role (user, assistant)
   * @param {string} content - The message content
   * @param {Object} metadata - Additional message metadata
   * @returns {Promise<Object>} Saved message and error if any
   */
  async saveMessage(sessionId, role, content, metadata = {}) {
    try {
      const messageId = uuidv4();
      const timestamp = new Date().toISOString();
      
      // Update the session's updated_at timestamp
      await this.updateChatSession(sessionId, { updated_at: timestamp });
      
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          id: messageId,
          session_id: sessionId,
          role,
          content,
          metadata,
          created_at: timestamp
        })
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error saving chat message:', error);
      return { data: null, error };
    }
  }

  /**
   * Delete a chat message
   * @param {string} messageId - The message ID
   * @returns {Promise<Object>} Result of the delete operation
   */
  async deleteMessage(messageId) {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', messageId);
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting chat message:', error);
      return { error };
    }
  }

  /**
   * Generate a title for a chat session based on the first user message
   * @param {string} sessionId - The chat session ID
   * @param {string} aiProvider - The AI provider to use for title generation
   * @returns {Promise<Object>} Generated title and error if any
   */
  async generateSessionTitle(sessionId, aiProvider = 'openai') {
    try {
      // Get the first few messages
      const { data: messages } = await this.getChatMessages(sessionId);
      
      if (!messages || messages.length === 0) {
        return { data: 'New Chat', error: null };
      }
      
      // Extract the first user message
      const firstUserMessage = messages.find(msg => msg.role === 'user');
      
      if (!firstUserMessage) {
        return { data: 'New Chat', error: null };
      }
      
      // Generate a title based on the first user message
      // This could be done with a simple truncation or with an AI call
      let title = firstUserMessage.content.substring(0, 30);
      if (firstUserMessage.content.length > 30) {
        title += '...';
      }
      
      // Update the session title
      const { data, error } = await this.updateChatSession(sessionId, { title });
      
      if (error) throw error;
      return { data: title, error: null };
    } catch (error) {
      console.error('Error generating session title:', error);
      return { data: 'New Chat', error };
    }
  }
}

export default new ChatHistoryService();
