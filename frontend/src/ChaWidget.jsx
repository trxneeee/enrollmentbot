import { useEffect } from 'react';

const ChatWidget = () => {
  useEffect(() => {
    const script1 = document.createElement('script');
    script1.src = 'https://cdn.botpress.cloud/webchat/v2.4/inject.js';
    script1.async = true;

    const script2 = document.createElement('script');
    script2.src = 'https://files.bpcontent.cloud/2025/05/08/07/20250508074952-X2375DWT.js';
    script2.async = true;

    document.body.appendChild(script1);
    document.body.appendChild(script2);

    return () => {
      document.body.removeChild(script1);
      document.body.removeChild(script2);
    };
  }, []);

  return null; // No UI needed
};

export default ChatWidget;
