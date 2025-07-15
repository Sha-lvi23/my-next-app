'use client';

import { useState, useRef } from 'react';
import styles from './page.module.css';

// Types for the API response
interface AnalysisResult {
  scores: {
    greeting: number;
    professionalism: number;
    empathy: number;
    problemResolution: number;
    clarity: number;
    collectionUrgency: number;
    compliance: number;
    overallEffectiveness: number;
  };
  overallFeedback: string;
  observation: string;
  transcription: string;
}

export default function Home() {
  // State management
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Handle file drop or selection
  const handleFileSelect = (file: File) => {
    if (file && (file.type === 'audio/mpeg' || file.type === 'audio/wav')) {
      setSelectedFile(file);
      setResults(null);
    } else {
      alert('Please select a valid .mp3 or .wav file.');
    }
  };

  // Drag & Drop Handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Send audio file to the backend API
  const analyzeAudio = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('audio', selectedFile);

      const res = await fetch('/api/analyze-call', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to process audio');

      const data: AnalysisResult = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
      alert('Something went wrong while processing your audio.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Compute color class for score value
  const getScoreColor = (score: number, max: number) => {
    const pct = (score / max) * 100;
    if (pct >= 80) return 'excellent';
    if (pct >= 60) return 'good';
    return 'poor';
  };

  const scoreMetrics = [
    { key: 'greeting', name: 'Greeting', max: 10 },
    { key: 'professionalism', name: 'Professionalism', max: 15 },
    { key: 'empathy', name: 'Empathy', max: 15 },
    { key: 'problemResolution', name: 'Problem Resolution', max: 20 },
    { key: 'clarity', name: 'Clarity', max: 10 },
    { key: 'collectionUrgency', name: 'Collection Urgency', max: 15 },
    { key: 'compliance', name: 'Compliance', max: 10 },
    { key: 'overallEffectiveness', name: 'Overall Effectiveness', max: 25 },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Call Analysis System</h1>
        <p className={styles.subtitle}>
          Upload a call recording for transcription and analysis.
        </p>
      </header>

      {/* Upload Area */}
      <div
        className={`${styles.uploadSection} ${dragOver ? styles.dragOver : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className={styles.uploadIcon}>🎵</div>
        <div className={styles.uploadText}>
          {selectedFile ? selectedFile.name : 'Drop your audio file here'}
        </div>
        <div className={styles.uploadSubtext}>
          Supports .mp3 and .wav • Click to browse
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".mp3,.wav,audio/mpeg,audio/wav"
          onChange={handleFileInputChange}
          className={styles.fileInput}
          title="Upload audio file"
          placeholder="Select an audio file"
        />
      </div>

      {/* Audio Preview */}
      {selectedFile && (
        <div className={styles.audioSection}>
          <div className={styles.fileName}>🎧 {selectedFile.name}</div>
          <audio
            ref={audioRef}
            controls
            className={styles.audioPlayer}
            src={URL.createObjectURL(selectedFile)}
          >
            Your browser does not support the audio tag.
          </audio>
          <button
            onClick={analyzeAudio}
            disabled={isProcessing}
            className={styles.processButton}
          >
            {isProcessing ? 'Processing...' : 'Analyze Call'}
          </button>
          {isProcessing && (
            <p className={styles.loadingText}>
              Transcribing and analyzing your call...
            </p>
          )}
        </div>
      )}

      {/* Results */}
      {results && (
        <div className={styles.resultsSection}>
          <h2 className={styles.resultsTitle}>📊 Analysis Results</h2>

          <div className={styles.scoresGrid}>
            {scoreMetrics.map(({ key, name, max }) => (
              <div key={key} className={styles.scoreCard}>
                <div className={styles.scoreName}>{name}</div>
                <div
                  className={`${styles.scoreValue} ${styles[
                    getScoreColor(results.scores[key as keyof typeof results.scores], max)
                  ]}`}
                >
                  {results.scores[key as keyof typeof results.scores]}
                </div>
                <div className={styles.scoreMax}>/ {max}</div>
              </div>
            ))}
          </div>

          <div className={styles.feedbackSection}>
            <div className={styles.feedbackCard}>
              <h3 className={styles.feedbackTitle}>📝 Overall Feedback</h3>
              <p className={styles.feedbackText}>
                {results.overallFeedback}
              </p>
            </div>
            <div className={styles.feedbackCard}>
              <h3 className={styles.feedbackTitle}>🔍 Key Observations</h3>
              <p className={styles.feedbackText}>
                {results.observation}
              </p>
            </div>
          </div>

          <div className={styles.transcriptionSection}>
            <h3 className={styles.transcriptionTitle}>📄 Call Transcription</h3>
            <p className={styles.transcriptionText}>
              {results.transcription}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
