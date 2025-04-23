import { useState, useEffect } from 'react';
import chatHistoryService from '../../services/chatHistoryService';
import { PlusCircle, Trash2, Edit, MessageSquare } from 'lucide-react';

const ChatSessionsList = ({ 
  userId, 
  onSelectSession, 
  onNewSession, 
  currentSessionId,
  className = ''
}) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    if (userId) {
      loadSessions();
    }
  }, [userId]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const { data, error } = await chatHistoryService.getChatSessions(userId);
      if (error) throw error;
      setSessions(data || []);
    } catch (err) {
      console.error('Error loading chat sessions:', err);
      setError('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async () => {
    try {
      const { data, error } = await chatHistoryService.createChatSession(userId);
      if (error) throw error;
      setSessions([data, ...sessions]);
      onNewSession(data.id);
    } catch (err) {
      console.error('Error creating chat session:', err);
      setError('Failed to create new chat');
    }
  };

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this chat?')) return;
    
    try {
      const { error } = await chatHistoryService.deleteChatSession(sessionId);
      if (error) throw error;
      setSessions(sessions.filter(session => session.id !== sessionId));
      
      // If the deleted session was the current one, create a new session
      if (sessionId === currentSessionId) {
        handleCreateSession();
      }
    } catch (err) {
      console.error('Error deleting chat session:', err);
      setError('Failed to delete chat');
    }
  };

  const handleEditClick = (session, e) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditTitle(session.title);
  };

  const handleEditSubmit = async (sessionId, e) => {
    e.preventDefault();
    try {
      const { data, error } = await chatHistoryService.updateChatSession(sessionId, { title: editTitle });
      if (error) throw error;
      
      setSessions(sessions.map(session => 
        session.id === sessionId ? { ...session, title: editTitle } : session
      ));
      
      setEditingSessionId(null);
    } catch (err) {
      console.error('Error updating chat session:', err);
      setError('Failed to update chat title');
    }
  };

  if (loading && sessions.length === 0) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">Chat History</h2>
          <button
            onClick={handleCreateSession}
            className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
            title="New Chat"
          >
            <PlusCircle size={20} />
          </button>
        </div>
        <div className="animate-pulse space-y-2">
          <div className="h-10 bg-gray-700/50 rounded"></div>
          <div className="h-10 bg-gray-700/50 rounded"></div>
          <div className="h-10 bg-gray-700/50 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-white">Chat History</h2>
        <button
          onClick={handleCreateSession}
          className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
          title="New Chat"
        >
          <PlusCircle size={20} />
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
          {error}
        </div>
      )}
      
      {sessions.length === 0 ? (
        <div className="text-center py-6">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-500 mb-2" />
          <p className="text-gray-400">No chat history yet</p>
          <button
            onClick={handleCreateSession}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start a new chat
          </button>
        </div>
      ) : (
        <ul className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
          {sessions.map(session => (
            <li key={session.id}>
              {editingSessionId === session.id ? (
                <form onSubmit={(e) => handleEditSubmit(session.id, e)} className="flex">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-l-lg text-white text-sm focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
                  >
                    Save
                  </button>
                </form>
              ) : (
                <div
                  onClick={() => onSelectSession(session.id)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    currentSessionId === session.id
                      ? 'bg-blue-600/20 border border-blue-500/30'
                      : 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50'
                  }`}
                >
                  <div className="flex-1 truncate">
                    <span className="text-sm text-gray-200">{session.title || 'New Chat'}</span>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(session.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={(e) => handleEditClick(session, e)}
                      className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChatSessionsList;
