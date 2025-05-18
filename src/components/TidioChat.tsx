"use client";

import { useEffect } from 'react';

const TidioChat = () => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Prevent duplicate script injection
      if (document.getElementById('tidio-chat-script')) return;
      const script = document.createElement('script');
      script.src = '//code.tidio.co/wdpcci9ylzow4uya6ayrfsikgodvh4am.js';
      script.async = true;
      script.id = 'tidio-chat-script';
      document.body.appendChild(script);
      // No cleanup needed, Tidio manages its own lifecycle
    }
  }, []);
  return null;
};

export default TidioChat; 