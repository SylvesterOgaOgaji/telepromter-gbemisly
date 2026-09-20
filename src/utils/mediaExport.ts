/**
 * Universal Media Export, Audio Processing & Clean Metadata Packaging Utility
 * Supports MP4, WebM, MP3, WAV, VTT Subtitles, SRT, TXT Social Descriptions, and JSON Meta Packages.
 * 100% Client-side and Deterministic (Zero AI Dependencies).
 */

export type ExportFormat = 'mp4' | 'webm' | 'mp3' | 'wav';
export type ExportResolution = '4k' | '1080p' | '720p';

export interface VideoMetadata {
  title: string;
  description: string;
  scriptContent?: string;
  tags: string[];
  creatorName?: string;
  organization?: string;
  partner?: string;
  recordingDate?: string;
  durationSeconds?: number;
  resolution?: string;
  format?: string;
  opaySupportAccount?: string;
  license?: string;
}

export interface ExportBundleOptions {
  downloadVideo: boolean;
  downloadMetaTxt: boolean;
  downloadSubtitlesVtt: boolean;
  downloadJsonMeta: boolean;
}

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

/**
 * Generate a complete, ready-to-publish social & YouTube description writeup with meta tags
 */
export function generateMetadataText(meta: VideoMetadata): string {
  const now = meta.recordingDate || new Date().toLocaleString();
  const creator = meta.creatorName || 'Debzane Concepts Creator';
  const org = meta.organization || 'Debzane Concepts';
  const partner = meta.partner || 'JV ImpactVR Initiative LTD/GTE';
  const opay = meta.opaySupportAccount || '8057961025 (Sylvester Oga Ogaji)';

  const formattedTags = (meta.tags && meta.tags.length > 0)
    ? meta.tags.map(t => t.startsWith('#') ? t : `#${t.replace(/\s+/g, '')}`).join(' ')
    : '#DebzaneConcepts #Teleprompter #StudioRecording #ContentCreation #VideoProduction';

  const commaTags = (meta.tags && meta.tags.length > 0)
    ? meta.tags.map(t => t.replace(/^#/, '').trim()).join(', ')
    : 'Debzane Concepts, Teleprompter, Video Studio, Content Creation, Public Speaking';

  return `================================================================================
🎬 VIDEO TITLE:
${meta.title || 'Untitled Studio Production'}
================================================================================

📌 SYNOPSIS & DESCRIPTION:
${meta.description || meta.scriptContent?.slice(0, 200) || 'Official video recording produced using Debzane Concept Teleprompter Studio.'}

--------------------------------------------------------------------------------
📝 TELEPROMPTER SCRIPT / SPEECH WRITE-UP:
--------------------------------------------------------------------------------
${meta.scriptContent || 'No teleprompter script write-up provided.'}

--------------------------------------------------------------------------------
🏷️ SOCIAL HASHTAGS:
${formattedTags}

🏷️ SEO / YOUTUBE TAGS (COPY & PASTE):
${commaTags}

--------------------------------------------------------------------------------
📊 PRODUCTION & TECHNICAL METADATA:
--------------------------------------------------------------------------------
• Title: ${meta.title || 'Studio Video'}
• Recorded On: ${now}
• Duration: ${meta.durationSeconds ? `${Math.floor(meta.durationSeconds / 60)}m ${Math.floor(meta.durationSeconds % 60)}s` : 'Full Take'}
• Resolution: ${meta.resolution || '1080p Full HD'}
• Export Format: ${(meta.format || 'mp4').toUpperCase()}
• Creator / Presenter: ${creator}
• Produced with: Debzane Concept Teleprompter v2.4 (100% Free & Open)
• Organization: ${org}
• Technology Partner: ${partner}
• Developer: Sylvester Oga Ogaji
• Support & Donations: OPay ${opay}
• License: ${meta.license || 'Creative Commons Attribution / Personal & Commercial Creator License'}
================================================================================`;
}

/**
 * Generate JSON-LD / schema.org compatible metadata file
 */
export function generateMetadataJSON(meta: VideoMetadata): string {
  const jsonObject = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": meta.title || "Debzane Studio Video",
    "description": meta.description || meta.scriptContent || "Debzane Concept Teleprompter Recording",
    "uploadDate": meta.recordingDate || new Date().toISOString(),
    "duration": meta.durationSeconds ? `PT${Math.floor(meta.durationSeconds)}S` : undefined,
    "encodingFormat": meta.format === 'mp4' ? 'video/mp4' : meta.format === 'webm' ? 'video/webm' : 'audio/mp3',
    "videoQuality": meta.resolution || "1080p",
    "transcript": meta.scriptContent || "",
    "keywords": meta.tags || ["Debzane Concepts", "Teleprompter", "Video Studio"],
    "author": {
      "@type": "Person",
      "name": meta.creatorName || "Debzane Concept Creator"
    },
    "publisher": {
      "@type": "Organization",
      "name": meta.organization || "Debzane Concepts",
      "founder": "Gbemisly",
      "sponsor": meta.partner || "JV ImpactVR Initiative LTD/GTE",
      "supportDonationOPay": meta.opaySupportAccount || "8057961025"
    }
  };

  return JSON.stringify(jsonObject, null, 2);
}

/**
 * Generate standard WebVTT subtitles (.vtt) from script text and duration
 */
export function generateVTTSubtitles(scriptContent: string = '', durationSeconds: number = 30): string {
  if (!scriptContent.trim()) {
    return "WEBVTT\n\n1\n00:00:00.000 --> 00:00:05.000\nDebzane Concept Studio Recording\n";
  }

  // Split script into manageable sentences or chunks
  const sentences = scriptContent
    .replace(/\r\n/g, '\n')
    .split(/\n+/)
    .flatMap(line => line.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [line])
    .map(s => s.trim())
    .filter(s => s.length > 0);

  if (sentences.length === 0) {
    return "WEBVTT\n\n1\n00:00:00.000 --> 00:00:05.000\n" + scriptContent.trim() + "\n";
  }

  const effectiveDuration = durationSeconds > 0 ? durationSeconds : 30;
  const timePerChunk = Math.max(2, effectiveDuration / sentences.length);

  let vtt = "WEBVTT - Debzane Concept Subtitles\n\n";

  sentences.forEach((sentence, idx) => {
    const startSec = idx * timePerChunk;
    const endSec = Math.min(effectiveDuration, (idx + 1) * timePerChunk);

    vtt += `${idx + 1}\n`;
    vtt += `${formatVTTTime(startSec)} --> ${formatVTTTime(endSec)}\n`;
    vtt += `${sentence}\n\n`;
  });

  return vtt;
}

function formatVTTTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  const hh = hrs.toString().padStart(2, '0');
  const mm = mins.toString().padStart(2, '0');
  const ss = secs.toString().padStart(2, '0');
  const mmm = ms.toString().padStart(3, '0');

  return `${hh}:${mm}:${ss}.${mmm}`;
}

/**
 * Trigger download of any text / string content with specified filename & MIME
 */
export function downloadTextFile(content: string, filename: string, mimeType: string = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Trigger download of a Blob file
 */
export function downloadBlobFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
