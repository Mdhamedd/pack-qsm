import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { createSpeechRecognizer, isSpeechRecognitionSupported } from '../../utils/speechToText.js';

export default function VoiceNoteButton({ onTranscript }) {
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState('');
  const recognizerRef = useRef(null);
  const supported = isSpeechRecognitionSupported();

  useEffect(() => () => {
    if (recognizerRef.current) recognizerRef.current.stop();
  }, []);

  const start = () => {
    const recognizer = createSpeechRecognizer({
      lang: 'ar-EG',
      onResult: ({ final, interim }) => setInterimText(interim),
      onEnd: (finalText) => {
        setIsRecording(false);
        setInterimText('');
        if (finalText) onTranscript(finalText);
      },
      onError: () => {
        setIsRecording(false);
        setInterimText('');
      }
    });
    if (!recognizer) return;
    recognizerRef.current = recognizer;
    recognizer.start();
    setIsRecording(true);
  };

  const stop = () => {
    recognizerRef.current && recognizerRef.current.stop();
    setIsRecording(false);
  };

  if (!supported) {
    return <p className="text-xs text-steel-500">الإملاء الصوتي غير مدعوم في هذا المتصفح</p>;
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={isRecording ? stop : start}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
          isRecording ? 'bg-danger-600 text-white animate-pulse' : 'btn-secondary'
        }`}
      >
        {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        {isRecording ? 'إيقاف التسجيل' : 'إملاء صوتي للملاحظات'}
      </button>
      {isRecording && interimText && <span className="text-xs text-steel-400 italic truncate max-w-[200px]">{interimText}</span>}
    </div>
  );
}
