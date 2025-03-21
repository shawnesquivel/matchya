/**
 * Utility for tracking events with Google Analytics via GTM
 */

// Type definitions for event tracking
type EventCategory = 'outbound_link' | 'modal' | 'therapist_profile';
type EventAction = 'click' | 'open' | 'view';

interface TherapistData {
  id?: string;
  name?: string;
  linkType?: 'booking' | 'website';
  source?: 'results_panel' | 'modal' | 'permalink';
}

// Make sure dataLayer is initialized
declare global {
  interface Window {
    dataLayer: any[];
  }
}

// Initialize dataLayer if it doesn't exist
const initializeDataLayer = () => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
  }
};

// Send event to dataLayer for GTM
export const trackEvent = (
  category: EventCategory,
  action: EventAction,
  label: string,
  value?: number,
  additionalData?: Record<string, any>
) => {
  // Only execute in browser environment
  if (typeof window === 'undefined') return;
  
  // Initialize dataLayer if not already initialized
  initializeDataLayer();

  // Create the event data
  const eventData = {
    event: `${category}_${action}`,
    eventCategory: category,
    eventAction: action,
    eventLabel: label,
    ...(value !== undefined && { eventValue: value }),
    ...(additionalData && { eventData: additionalData }),
  };

  // Push to dataLayer
  console.log('Pushing to dataLayer:', eventData); // Add logging for debugging
  window.dataLayer.push(eventData);

  if (process.env.NODE_ENV !== 'production') {
    console.log(
      `[Analytics] Tracked event: ${category} - ${action} - ${label}${
        value ? ` - ${value}` : ''
      }`,
      additionalData
    );
  }
};

// Use debounce to prevent double tracking
let lastLinkClick = 0;

// Track outbound link clicks (booking/website)
export const trackOutboundLink = (
  url: string,
  therapistData: TherapistData
) => {
  const { id, name, linkType, source } = therapistData;
  
  // Simple debounce to prevent double clicks (within 500ms)
  const now = Date.now();
  if (now - lastLinkClick < 500) {
    console.log('Debounced outbound link event', url);
    return;
  }
  lastLinkClick = now;
  
  // Format data for GTM
  const eventData = {
    therapistId: id || 'unknown',
    therapistName: name || 'unknown',
    linkType: linkType || 'unknown',
    source: source || 'unknown',
    url: url
  };

  // Push directly to dataLayer with explicit event name
  if (typeof window !== 'undefined') {
    initializeDataLayer();
    console.log('Pushing outbound link click:', {
      event: 'outbound_link_click',
      eventData
    });
    window.dataLayer.push({
      event: 'outbound_link_click', // This must match the trigger name in GTM
      eventData
    });
  }
  
  trackEvent('outbound_link', 'click', url, undefined, therapistData);
};

// Track modal opens from results panel
export const trackModalOpen = (therapistData: TherapistData) => {
  const { id, name } = therapistData;
  
  // Format data for GTM
  const eventData = {
    therapistId: id || 'unknown',
    therapistName: name || 'unknown',
    source: 'results_panel'
  };

  // Push directly to dataLayer with explicit event name
  if (typeof window !== 'undefined') {
    initializeDataLayer();
    console.log('Pushing modal open:', {
      event: 'modal_open',
      eventData
    });
    window.dataLayer.push({
      event: 'modal_open', // This must match the trigger name in GTM
      eventData
    });
  }
  
  trackEvent('modal', 'open', name || 'unknown therapist', undefined, therapistData);
};

// Track therapist profile views
export const trackTherapistProfileView = (therapistData: TherapistData) => {
  const { id, name, source } = therapistData;
  
  console.log("trackTherapistProfileView called with:", therapistData);
  
  // Format data for GTM
  const eventData = {
    therapistId: id || 'unknown',
    therapistName: name || 'unknown',
    source: source || 'permalink'
  };

  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    console.log('Cannot track profile view: Not in browser environment');
    return;
  }

  // Push directly to dataLayer with explicit event name
  try {
    initializeDataLayer();
    console.log('Pushing profile view to dataLayer:', {
      event: 'therapist_profile_view',
      eventData
    });
    window.dataLayer.push({
      event: 'therapist_profile_view', // This must match the trigger name in GTM
      eventData
    });
    console.log('Successfully pushed profile view to dataLayer');
  } catch (error) {
    console.error('Error pushing profile view to dataLayer:', error);
  }
  
  trackEvent('therapist_profile', 'view', name || 'unknown therapist', undefined, therapistData);
}; 