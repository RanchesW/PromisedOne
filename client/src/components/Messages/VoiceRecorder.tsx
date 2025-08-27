import React, { useState, useRef, useEffect } from 'react';

interface VoiceRecorderProps {
  onSendVoiceMessage: (audioBlob: Blob, duration: number) => void;
  onCancel: () => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onSendVoiceMessage,
  onCancel
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string>('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError('');

      // Start duration timer
      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      setError('Could not access microphone. Please check permissions.');
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsPaused(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
  };

  const handleSend = () => {
    if (audioBlob) {
      onSendVoiceMessage(audioBlob, duration);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const reset = () => {
    setDuration(0);
    setAudioBlob(null);
    setIsRecording(false);
    setIsPaused(false);
    setError('');
  };

  if (error) {
    return (
      <div className="bg-slate-800 rounded-lg p-4 border border-red-500">
        <div className="text-red-400 mb-3">{error}</div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              setError('');
              startRecording();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-600">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-4 h-4 rounded-full ${isRecording && !isPaused ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
          <span className="text-white font-medium">
            {audioBlob ? 'Recording Complete' : isRecording ? (isPaused ? 'Paused' : 'Recording...') : 'Voice Message'}
          </span>
        </div>
        <div className="text-white font-mono">
          {formatDuration(duration)}
        </div>
      </div>

      {/* Waveform Visualization (Placeholder) */}
      <div className="mb-4 h-12 bg-slate-700 rounded flex items-center justify-center">
        {isRecording && !isPaused ? (
          <div className="flex items-center space-x-1">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-blue-500 rounded animate-pulse"
                style={{
                  height: `${Math.random() * 32 + 8}px`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-slate-400 text-sm">
            {audioBlob ? '🎵 Voice message ready' : '🎤 Click record to start'}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-2">
        {!isRecording && !audioBlob && (
          <>
            <button
              onClick={onCancel}
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={startRecording}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <span>🎤</span>
              <span>Record</span>
            </button>
          </>
        )}

        {isRecording && (
          <>
            <button
              onClick={stopRecording}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              ⏹️ Stop
            </button>
            {!isPaused ? (
              <button
                onClick={pauseRecording}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                ⏸️ Pause
              </button>
            ) : (
              <button
                onClick={resumeRecording}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                ▶️ Resume
              </button>
            )}
          </>
        )}

        {audioBlob && (
          <>
            <button
              onClick={reset}
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              Re-record
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <span>📤</span>
              <span>Send</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;
