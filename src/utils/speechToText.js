// غلاف بسيط حول Web Speech API لتحويل ملاحظات المفتش الصوتية إلى نص عربي

export function isSpeechRecognitionSupported() {
  return typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function createSpeechRecognizer({ lang = 'ar-EG', onResult, onEnd, onError } = {}) {
  const SpeechRecognitionImpl = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognitionImpl) return null;

  const recognizer = new SpeechRecognitionImpl();
  recognizer.lang = lang;
  recognizer.continuous = true;
  recognizer.interimResults = true;

  let finalTranscript = '';

  recognizer.onresult = (event) => {
    let interimTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
      } else {
        interimTranscript += transcript;
      }
    }
    onResult && onResult({ final: finalTranscript.trim(), interim: interimTranscript.trim() });
  };

  recognizer.onerror = (e) => onError && onError(e);
  recognizer.onend = () => onEnd && onEnd(finalTranscript.trim());

  return recognizer;
}
