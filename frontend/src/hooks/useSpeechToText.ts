import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

export function useSpeechToText() {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSupported(true);
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let finalText = '';
        for (let i = 0; i < event.results.length; i += 1) {
          finalText += event.results[i][0].transcript;
        }
        setTranscript(finalText.trim());
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const start = () => {
    if (!supported || !recognitionRef.current) return;
    setTranscript('');
    recognitionRef.current.start();
    setListening(true);
  };

  const stop = () => {
    if (!supported || !recognitionRef.current) return;
    recognitionRef.current.stop();
  };

  return {
    supported,
    listening,
    transcript,
    start,
    stop,
    setTranscript,
  };
}

