import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase';

export interface SiteSettings {
  heroImageUrl?: string;
  // Add more settings as needed
}

// Default settings
const defaultSettings: SiteSettings = {
  heroImageUrl: undefined
};

// Create store
export const siteSettings = writable<SiteSettings>(defaultSettings);

// Functions to manage settings
export const settingsService = {
  async load(): Promise<SiteSettings> {
    try {
      // For now, we'll store settings in localStorage
      // Later you can move this to Supabase database if needed
      const stored = localStorage.getItem('site_settings');
      if (stored) {
        const settings = JSON.parse(stored);
        siteSettings.set({ ...defaultSettings, ...settings });
        return settings;
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    
    siteSettings.set(defaultSettings);
    return defaultSettings;
  },

  async save(settings: Partial<SiteSettings>): Promise<void> {
    try {
      // Update store
      siteSettings.update(current => ({ ...current, ...settings }));
      
      // Save to localStorage
      const currentSettings = await this.get();
      localStorage.setItem('site_settings', JSON.stringify(currentSettings));
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  },

  async get(): Promise<SiteSettings> {
    return new Promise((resolve) => {
      const unsubscribe = siteSettings.subscribe(value => {
        resolve(value);
        unsubscribe();
      });
    });
  },

  async updateHeroImage(imageUrl: string): Promise<void> {
    await this.save({ heroImageUrl: imageUrl });
  }
};
