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

// Send event to dataLayer for GTM
export const trackEvent = (
  category: EventCategory,
  action: EventAction,
  label: string,
  value?: number,
  additionalData?: Record<string, any>
) => {
  if (typeof window === 'undefined' || !window.dataLayer) {
    // Create dataLayer if it doesn't exist
    window.dataLayer = window.dataLayer || [];
  }

  // Push the event to the dataLayer
  window.dataLayer.push({
    event: 'custom_event',
    event_category: category,
    event_action: action,
    event_label: label,
    event_value: value,
    ...additionalData
  });

  if (process.env.NODE_ENV !== 'production') {
    console.log(
      `[Analytics] Tracked event: ${category} - ${action} - ${label}${
        value ? ` - ${value}` : ''
      }`,
      additionalData
    );
  }
};

// Track outbound link clicks (booking/website)
export const trackOutboundLink = (
  url: string,
  therapistData: TherapistData
) => {
  const linkType = therapistData.linkType || 'unknown';
  const source = therapistData.source || 'unknown';
  
  trackEvent(
    'outbound_link',
    'click',
    `${linkType}_link_${source}`,
    undefined,
    {
      destination_url: url,
      therapist_id: therapistData.id,
      therapist_name: therapistData.name,
      link_type: linkType,
      source_component: source
    }
  );
};

// Track modal opens from results panel
export const trackModalOpen = (therapistData: TherapistData) => {
  trackEvent(
    'modal',
    'open',
    'therapist_modal',
    undefined,
    {
      therapist_id: therapistData.id,
      therapist_name: therapistData.name,
      source_component: 'results_panel'
    }
  );
};

// Track therapist profile views
export const trackTherapistProfileView = (therapistData: TherapistData) => {
  trackEvent(
    'therapist_profile',
    'view',
    'permalink_page',
    undefined,
    {
      therapist_id: therapistData.id,
      therapist_name: therapistData.name
    }
  );
};

// Fix TypeScript global window type
declare global {
  interface Window {
    dataLayer: any[];
  }
} 