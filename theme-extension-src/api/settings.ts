// API client for fetching belt wizard settings

export interface BeltWizardSettings {
  backgroundColor: string;
  fontFamily: string;
  fontColor: string;
}

const DEFAULT_SETTINGS: BeltWizardSettings = {
  backgroundColor: '#291c12',
  fontFamily: 'Arial, sans-serif',
  fontColor: '#ffffff',
};

/**
 * Fetches belt wizard settings from the app's API endpoint
 * @param shop - The shop domain (e.g., 'example.myshopify.com')
 * @returns Promise resolving to settings object
 */
export async function fetchBeltWizardSettings(shop: string): Promise<BeltWizardSettings> {
  try {
    const url = `https://${shop}/apps/custom-belt-builder/api/settings`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn('[Settings API] Failed to fetch, using defaults. Status:', response.status);
      return DEFAULT_SETTINGS;
    }

    const settings = await response.json();
    
    return {
      backgroundColor: settings.backgroundColor || DEFAULT_SETTINGS.backgroundColor,
      fontFamily: settings.fontFamily || DEFAULT_SETTINGS.fontFamily,
      fontColor: settings.fontColor || DEFAULT_SETTINGS.fontColor,
    };
  } catch (error) {
    console.error('[Settings API] Error fetching settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Applies belt wizard settings as CSS custom properties on the document root
 * @param settings - The settings to apply
 */
export function applySettingsToDOM(settings: BeltWizardSettings): void {
  document.documentElement.style.setProperty('--belt-wizard-bg-color', settings.backgroundColor);
  document.documentElement.style.setProperty('--belt-wizard-font-family', settings.fontFamily);
  document.documentElement.style.setProperty('--belt-wizard-font-color', settings.fontColor);
}
