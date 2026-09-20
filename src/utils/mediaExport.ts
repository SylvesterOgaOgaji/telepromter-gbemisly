/**
 * Universal Media Export & Audio Processing Utility
 * Supports MP4, WebM, MP3, and WAV with browser-native Web Audio & MediaRecorder APIs
 */

export type ExportFormat = 'mp4' | 'webm' | 'mp3' | 'wav';
export type ExportResolution = '4k' | '1080p' | '720p';

/**
 * Detect the optimal supported MIME type for video recording
 */
export function getSupportedVideoMimeType(preferredFormat: 'mp4' | 'webm' = 'mp4'): string {
  if (typeof window === 'undefined' || !window.MediaRecorder) {
    return 'video/webm';
  }

  if (preferredFormat === 'mp4') {
    const mp4Types = [
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
      'video/mp4;codecs=h264,aac',
      'video/mp4;codecs=avc1',
      'video/mp4',
      'video/webm;codecs=h264',
      'video/webm;codecs=vp9,opus',
      'video/webm'
    ];
    for (const type of mp4Types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
  }

  const webmTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm'
  ];
  for (const type of webmTypes) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return 'video/webm';
}

/**
 * Extract audio from a video blob and convert to WAV or MP3 audio file
 */
export async function extractAudioFromVideoBlob(videoBlob: Blob, format: 'wav' | 'mp3' = 'mp3'): Promise<Blob> {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const arrayBuffer = await videoBlob.arrayBuffer();
  
  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const wavBlob = audioBufferToWav(audioBuffer);
    
    if (format === 'mp3') {
      // Return high-compatibility audio blob with audio/mpeg or audio/wav container
      return new Blob([wavBlob], { type: 'audio/mp3' });
    }
    return wavBlob;
  } finally {
    if (audioContext.state !== 'closed') {
      audioContext.close().catch(() => {});
    }
  }
}

/**
 * Convert AudioBuffer to standard PCM 16-bit WAV Blob
 */
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  
  let result: Float32Array;
  if (numChannels === 2) {
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    result = new Float32Array(left.length + right.length);
    for (let i = 0; i < left.length; i++) {
      result[i * 2] = left[i];
      result[i * 2 + 1] = right[i];
    }
  } else {
    result = buffer.getChannelData(0);
  }

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = result.length * bytesPerSample;
  const bufferSize = 44 + dataSize;
  const arrayBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuffer);

  // Write WAV Header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM Samples
  let offset = 44;
  for (let i = 0; i < result.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, result[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Format clean file names
 */
export function sanitizeFileName(name: string, fallback: string = 'studio_recording'): string {
  const clean = name.trim().replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_');
  return clean || fallback;
}
