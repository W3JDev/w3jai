import { describe, it, expect } from 'vitest';
import { validateFile, validateText, validateApiKey, validateUrl, sanitizeInput } from './validation';

describe('Validation Utilities', () => {
  describe('validateFile', () => {
    it('validates allowed file types', () => {
      const textFile = { type: 'text/plain', size: 1024 };
      const imageFile = { type: 'image/jpeg', size: 1024 };
      const pdfFile = { type: 'application/pdf', size: 1024 };
      
      expect(validateFile(textFile).isValid).toBe(true);
      expect(validateFile(imageFile).isValid).toBe(true);
      expect(validateFile(pdfFile).isValid).toBe(true);
    });
    
    it('rejects disallowed file types', () => {
      const exeFile = { type: 'application/x-msdownload', size: 1024 };
      const result = validateFile(exeFile);
      
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Invalid file type');
    });
    
    it('rejects files that exceed the size limit', () => {
      const largeFile = { type: 'text/plain', size: 20 * 1024 * 1024 }; // 20MB
      const result = validateFile(largeFile);
      
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('File too large');
    });
    
    it('accepts custom options', () => {
      const csvFile = { type: 'text/csv', size: 5 * 1024 * 1024 }; // 5MB
      const options = {
        allowedTypes: ['text/csv'],
        maxSize: 6 * 1024 * 1024 // 6MB
      };
      
      expect(validateFile(csvFile, options).isValid).toBe(true);
    });
  });
  
  describe('validateText', () => {
    it('validates text within length limits', () => {
      const text = 'This is a valid text';
      expect(validateText(text).isValid).toBe(true);
    });
    
    it('rejects empty text', () => {
      const result = validateText('');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Text cannot be empty');
    });
    
    it('allows empty text when specified', () => {
      const result = validateText('', { allowEmpty: true });
      expect(result.isValid).toBe(true);
    });
    
    it('rejects text exceeding max length', () => {
      const longText = 'a'.repeat(5000);
      const result = validateText(longText);
      
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Text too long');
    });
  });
  
  describe('validateApiKey', () => {
    it('validates non-empty API keys', () => {
      const apiKey = 'sk-1234567890abcdef';
      expect(validateApiKey(apiKey).isValid).toBe(true);
    });
    
    it('rejects empty API keys', () => {
      const result = validateApiKey('');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('API key cannot be empty');
    });
    
    it('validates OpenAI API keys', () => {
      const validKey = 'sk-1234567890abcdef';
      const invalidKey = 'invalid-key';
      
      expect(validateApiKey(validKey, 'openai').isValid).toBe(true);
      
      const result = validateApiKey(invalidKey, 'openai');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Invalid OpenAI API key format');
    });
  });
  
  describe('validateUrl', () => {
    it('validates proper URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://localhost:3000',
        'https://api.example.com/v1/endpoint'
      ];
      
      validUrls.forEach(url => {
        expect(validateUrl(url).isValid).toBe(true);
      });
    });
    
    it('rejects invalid URLs', () => {
      const invalidUrls = [
        '',
        'not-a-url',
        'http:/example.com',
        'example.com'
      ];
      
      invalidUrls.forEach(url => {
        const result = validateUrl(url);
        expect(result.isValid).toBe(false);
      });
    });
  });
  
  describe('sanitizeInput', () => {
    it('sanitizes HTML special characters', () => {
      const input = '<script>alert("XSS")</script>';
      const sanitized = sanitizeInput(input);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('&lt;script&gt;');
    });
    
    it('handles empty input', () => {
      expect(sanitizeInput('')).toBe('');
      expect(sanitizeInput(null)).toBe('');
      expect(sanitizeInput(undefined)).toBe('');
    });
  });
});
