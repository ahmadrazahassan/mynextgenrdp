"use client";

import { useEffect } from 'react';

declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
  }
}

const TawkToChat = () => {
  useEffect(() => {
    // Only run on client-side
    if (typeof window !== 'undefined') {
      // Reset any existing Tawk configuration to prevent duplicates
      window.Tawk_API = window.Tawk_API || {};
      window.Tawk_LoadStart = new Date();

      // Define an event handler to fix the positioning
      const fixTawkPosition = () => {
        // Make sure Tawk_API is available
        if (window.Tawk_API && typeof window.Tawk_API.maximize === 'function') {
          try {
            // Try to access the widget iframe to modify its CSS directly
            // This is more reliable than the API settings
            setTimeout(() => {
              // Position chat button above WhatsApp button (vertically stacked)
              const chatIframe = document.getElementById('tawkchat-minified-iframe');
              if (chatIframe) {
                const chatContainer = chatIframe.parentElement;
                if (chatContainer) {
                  // Position in bottom right but much higher than WhatsApp
                  chatContainer.style.right = '20px';
                  chatContainer.style.left = 'auto'; 
                  chatContainer.style.bottom = '160px'; // Very large gap to ensure they never touch
                  
                  // Add some styling to make it look better
                  chatContainer.style.zIndex = '99';
                  chatContainer.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  
                  // If we can find the iframe and edit its style inside, make it match WhatsApp style
                  try {
                    const iframeDocument = (chatIframe as HTMLIFrameElement).contentWindow?.document;
                    if (iframeDocument) {
                      // Add some CSS to iframe document to match WhatsApp style
                      const styleElement = iframeDocument.createElement('style');
                      styleElement.textContent = `
                        .theme-background-color {
                          background: linear-gradient(to right, #4f46e5, #7e22ce) !important;
                          border-radius: 9999px !important;
                        }
                        .icon-text {
                          font-weight: bold !important;
                        }
                      `;
                      iframeDocument.head.appendChild(styleElement);
                    }
                  } catch (styleError) {
                    // Iframe styling failed, but that's okay - security restrictions may prevent this
                    console.log("Could not style Tawk iframe content due to security restrictions");
                  }
                }
              }
              
              // Also modify the maximized chat to avoid overlap
              const maxIframe = document.getElementById('tawkchat-maximized-iframe');
              if (maxIframe) {
                const maxContainer = maxIframe.parentElement;
                if (maxContainer) {
                  // When maximized, use a similar position 
                  maxContainer.style.right = '20px';
                  maxContainer.style.left = 'auto';
                  maxContainer.style.bottom = '160px';
                  maxContainer.style.zIndex = '99';
                }
              }
            }, 2000); // Wait 2 seconds to ensure elements are loaded
          } catch (error) {
            console.error("Error modifying Tawk widget position:", error);
          }
        }
      };

      // Configure Tawk API
      window.Tawk_API = {
        ...window.Tawk_API,
        onLoad: function() {
          // First attempt: use API to set position (sometimes doesn't work)
          window.Tawk_API.customStyle = {
            visibility: {
              desktop: {
                position: 'br', // bottom right
                xOffset: 20,
                yOffset: 160  // Very high position to avoid WhatsApp
              },
              mobile: {
                position: 'br', 
                xOffset: 20,
                yOffset: 160
              }
            },
            zIndex: 99
          };
          
          // Call our custom fix
          fixTawkPosition();
        },
        onChatMaximized: function() {
          // Fix position again when chat is maximized
          fixTawkPosition();
        },
        onChatMinimized: function() {
          // Fix position again when chat is minimized
          fixTawkPosition();
        }
      };

      // Load the Tawk.to script
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://embed.tawk.to/6829d04c5a6f8a1913039d53/1irhlbas4';
      script.charset = 'UTF-8';
      script.setAttribute('crossorigin', '*');
      
      // Add event listener to handle after script loads
      script.onload = fixTawkPosition;
      
      // Append script to document
      const firstScript = document.getElementsByTagName('script')[0];
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
      } else {
        document.head.appendChild(script);
      }

      // Also set a resize event listener to ensure positioning remains correct
      window.addEventListener('resize', fixTawkPosition);

      // Cleanup function
      return () => {
        // Remove resize event listener
        window.removeEventListener('resize', fixTawkPosition);
        
        // Remove the script element if it exists
        if (script && script.parentNode) {
          script.parentNode.removeChild(script);
        }
        
        // Remove any Tawk instances
        if (window.Tawk_API && window.Tawk_API.endChat) {
          window.Tawk_API.endChat();
        }
      };
    }
  }, []);

  // This component doesn't render anything visible
  return null;
};

export default TawkToChat; 