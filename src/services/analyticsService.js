import { v4 as uuidv4 } from 'uuid';
import supabase from './supabase';

/**
 * Service for tracking anonymous usage analytics
 */
class AnalyticsService {
  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.userId = null;
    this.isEnabled = true;
    this.queue = [];
    this.isProcessing = false;
    this.flushInterval = null;
    
    // Start the flush interval
    this.startFlushInterval();
  }
  
  /**
   * Initialize the analytics service with user ID if available
   * @param {string} userId - The authenticated user ID
   */
  init(userId = null) {
    this.userId = userId;
    
    // Flush any queued events now that we have a user ID
    if (userId) {
      this.flush();
    }
  }
  
  /**
   * Enable or disable analytics tracking
   * @param {boolean} enabled - Whether analytics should be enabled
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    
    // Store the preference
    try {
      localStorage.setItem('analytics_enabled', JSON.stringify(enabled));
    } catch (error) {
      console.error('Error storing analytics preference:', error);
    }
    
    // If disabled, clear the queue
    if (!enabled) {
      this.queue = [];
      this.stopFlushInterval();
    } else {
      this.startFlushInterval();
    }
  }
  
  /**
   * Get or create a unique session ID
   * @returns {string} Session ID
   */
  getOrCreateSessionId() {
    let sessionId;
    
    try {
      sessionId = sessionStorage.getItem('analytics_session_id');
      
      if (!sessionId) {
        sessionId = uuidv4();
        sessionStorage.setItem('analytics_session_id', sessionId);
      }
    } catch (error) {
      // If sessionStorage is not available, generate a new ID
      sessionId = uuidv4();
    }
    
    return sessionId;
  }
  
  /**
   * Track a user event
   * @param {string} eventName - Name of the event
   * @param {Object} properties - Additional event properties
   */
  track(eventName, properties = {}) {
    if (!this.isEnabled) return;
    
    const event = {
      id: uuidv4(),
      event_name: eventName,
      user_id: this.userId,
      session_id: this.sessionId,
      properties: properties,
      timestamp: new Date().toISOString(),
      url: window.location.pathname,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent
    };
    
    // Add to queue
    this.queue.push(event);
    
    // If queue is getting large, flush immediately
    if (this.queue.length >= 10) {
      this.flush();
    }
  }
  
  /**
   * Track a page view
   * @param {string} pageName - Name of the page
   * @param {Object} properties - Additional properties
   */
  trackPageView(pageName, properties = {}) {
    this.track('page_view', {
      page_name: pageName,
      ...properties
    });
  }
  
  /**
   * Track a chat message
   * @param {string} role - Message role (user/assistant)
   * @param {number} messageLength - Length of the message
   * @param {Object} properties - Additional properties
   */
  trackChatMessage(role, messageLength, properties = {}) {
    this.track('chat_message', {
      role,
      message_length: messageLength,
      ...properties
    });
  }
  
  /**
   * Track an error
   * @param {string} errorType - Type of error
   * @param {string} errorMessage - Error message
   * @param {Object} properties - Additional properties
   */
  trackError(errorType, errorMessage, properties = {}) {
    this.track('error', {
      error_type: errorType,
      error_message: errorMessage,
      ...properties
    });
  }
  
  /**
   * Track a feature usage
   * @param {string} featureName - Name of the feature
   * @param {Object} properties - Additional properties
   */
  trackFeatureUsage(featureName, properties = {}) {
    this.track('feature_usage', {
      feature_name: featureName,
      ...properties
    });
  }
  
  /**
   * Start the flush interval
   */
  startFlushInterval() {
    if (this.flushInterval) return;
    
    // Flush the queue every 30 seconds
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 30000);
  }
  
  /**
   * Stop the flush interval
   */
  stopFlushInterval() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }
  
  /**
   * Flush the event queue to the server
   */
  async flush() {
    if (!this.isEnabled || this.queue.length === 0 || this.isProcessing) return;
    
    this.isProcessing = true;
    const eventsToSend = [...this.queue];
    this.queue = [];
    
    try {
      // Send events to Supabase
      const { error } = await supabase
        .from('analytics_events')
        .insert(eventsToSend);
      
      if (error) {
        console.error('Error sending analytics events:', error);
        // Put the events back in the queue
        this.queue = [...eventsToSend, ...this.queue];
      }
    } catch (error) {
      console.error('Error flushing analytics queue:', error);
      // Put the events back in the queue
      this.queue = [...eventsToSend, ...this.queue];
    } finally {
      this.isProcessing = false;
    }
  }
}

// Create a singleton instance
const analyticsService = new AnalyticsService();

export default analyticsService;
