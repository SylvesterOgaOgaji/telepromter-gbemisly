export interface Script {
  id: string;
  title: string;
  content: string;
  category?: string;
  createdAt: number;
  updatedAt: number;
  favorite?: boolean;
}

export interface PrompterSettings {
  speed: number; // 1 to 100
  fontSize: number; // in px (18 to 96)
  lineHeight: number; // 1.2 to 2.5
  letterSpacing: number; // -1 to 5
  maxWidthPercent: number; // 40% to 100%
  mirrorH: boolean;
  mirrorV: boolean;
  textColor: string;
  backgroundColor: string;
  highlightColor: string;
  cueLineVisible: boolean;
  cueLinePositionPercent: number; // 20% to 80% from top
  countdownSeconds: number; // 0, 3, 5, 10
  fontFamily: 'Inter' | 'Lexend' | 'Space Grotesk' | 'Monospace' | 'Serif';
  autoReverseOnEnd: boolean;
}

export const DEFAULT_SETTINGS: PrompterSettings = {
  speed: 24,
  fontSize: 42,
  lineHeight: 1.6,
  letterSpacing: 0.5,
  maxWidthPercent: 80,
  mirrorH: false,
  mirrorV: false,
  textColor: '#ffffff',
  backgroundColor: '#030914',
  highlightColor: '#eab308',
  cueLineVisible: true,
  cueLinePositionPercent: 35,
  countdownSeconds: 3,
  fontFamily: 'Lexend',
  autoReverseOnEnd: false,
};

export interface FeedbackComment {
  id: string;
  userName: string;
  rating: number;
  message: string;
  date: string;
  country?: string;
}

export type VideoFilter = 'none' | 'beauty' | 'cinematic' | 'matrix' | 'monochrome' | 'vibrant' | 'sepia';
export type StudioLayoutMode = 'solo-camera' | 'split' | 'pip' | 'solo-media';
export type ExportFormat = 'mp4' | 'webm' | 'mp3' | 'wav';
export type ExportResolution = '4k' | '1080p' | '720p';

export interface StudioOverlayConfig {
  showTicker: boolean;
  tickerText: string;
  tickerSpeed: number; // 1 to 5
  tickerBgColor: string;
  tickerTextColor: string;
  showLogo: boolean;
  logoUrl: string;
  logoPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  filter: VideoFilter;
  layout: StudioLayoutMode;
  mediaSwapped: boolean;
}
