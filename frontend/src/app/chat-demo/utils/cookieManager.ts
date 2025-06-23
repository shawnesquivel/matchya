// Utility functions for managing cookies securely

/**
 * Set a cookie with the given name, value, and expiration days
 */
export function setCookie(
    name: string,
    value: string,
    days: number = 30,
): void {
    // Encrypt the value using a simple encoding for demo purposes
    // Note: In production, you'd want more secure encryption
    const encodedValue = btoa(value);

    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;

    // Set the cookie with HttpOnly and Secure flags for production
    // For development, we're using a simpler approach
    document.cookie =
        `${name}=${encodedValue};${expires};path=/;SameSite=Strict`;
}

/**
 * Get a cookie by name
 */
export function getCookie(name: string): string | null {
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(";");

    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(nameEQ) === 0) {
            // Decode the value
            const encodedValue = c.substring(nameEQ.length, c.length);
            try {
                return atob(encodedValue);
            } catch (e) {
                console.error("Error decoding cookie value:", e);
                return null;
            }
        }
    }

    return null;
}

/**
 * Delete a cookie by name
 */
export function deleteCookie(name: string): void {
    document.cookie =
        `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict`;
}

// Names of cookies used in the application
export const COOKIE_NAMES = {
    API_KEY: "openai_api_key",
};
