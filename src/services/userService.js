import supabase from './supabase';

/**
 * User service for managing user data and preferences
 */
class UserService {
  /**
   * Get user profile by user ID
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} User profile data and error if any
   */
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return { data: null, error };
    }
  }

  /**
   * Create or update user profile
   * @param {string} userId - The user ID
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} Updated profile data and error if any
   */
  async upsertProfile(userId, profileData) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          updated_at: new Date().toISOString(),
          ...profileData
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { data: null, error };
    }
  }

  /**
   * Get user preferences
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} User preferences and error if any
   */
  async getUserPreferences(userId) {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        throw error;
      }

      return { data: data || {}, error: null };
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return { data: {}, error };
    }
  }

  /**
   * Update user preferences
   * @param {string} userId - The user ID
   * @param {Object} preferences - Preferences to update
   * @returns {Promise<Object>} Updated preferences and error if any
   */
  async updatePreferences(userId, preferences) {
    try {
      console.log('Updating preferences for user:', userId);

      // First check if the user has existing preferences
      const { data: existingData } = await this.getUserPreferences(userId);
      console.log('Existing preferences:', existingData);

      // If there's existing data, use RLS policy to update
      if (existingData && existingData.user_id) {
        console.log('Updating existing preferences');
        const { data, error } = await supabase
          .from('user_preferences')
          .update({
            updated_at: new Date().toISOString(),
            preferences
          })
          .eq('user_id', userId)
          .select()
          .single();

        if (error) {
          console.error('Error updating existing preferences:', error);
          throw error;
        }

        return { data, error: null };
      } else {
        // Insert new preferences
        console.log('Inserting new preferences');
        const { data, error } = await supabase
          .from('user_preferences')
          .insert({
            user_id: userId,
            updated_at: new Date().toISOString(),
            preferences
          })
          .select()
          .single();

        if (error) {
          console.error('Error inserting new preferences:', error);
          throw error;
        }

        return { data, error: null };
      }
    } catch (error) {
      console.error('Error in updatePreferences:', error);
      return { data: null, error };
    }
  }

  // Alias for updatePreferences for backward compatibility
  async updateUserPreferences(userId, preferences) {
    return this.updatePreferences(userId, preferences);
  }

  /**
   * Get API keys for a user
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} User API keys and error if any
   */
  async getUserApiKeys(userId) {
    try {
      const { data, error } = await supabase
        .from('user_api_keys')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching user API keys:', error);
      return { data: [], error };
    }
  }

  /**
   * Save an API key for a user
   * @param {string} userId - The user ID
   * @param {string} provider - The API provider
   * @param {string} apiKey - The API key (encrypted)
   * @returns {Promise<Object>} Saved API key data and error if any
   */
  async saveApiKey(userId, provider, apiKey) {
    try {
      const { data, error } = await supabase
        .from('user_api_keys')
        .upsert({
          user_id: userId,
          provider,
          api_key: apiKey,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error saving API key:', error);
      return { data: null, error };
    }
  }

  /**
   * Delete an API key for a user
   * @param {string} userId - The user ID
   * @param {string} provider - The API provider
   * @returns {Promise<Object>} Result of the delete operation
   */
  async deleteApiKey(userId, provider) {
    try {
      const { error } = await supabase
        .from('user_api_keys')
        .delete()
        .eq('user_id', userId)
        .eq('provider', provider);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting API key:', error);
      return { error };
    }
  }
}

export default new UserService();
