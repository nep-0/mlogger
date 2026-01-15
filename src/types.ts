export interface Session {
  id: string;
  timestamp: number;
  duration: number;
  rating?: number;
  notes?: string;
}

export interface NewSession {
  date: string;
  time: string;
  duration: number;
  rating: number;
  notes: string;
}

export type Tab = 'log' | 'stats' | 'calendar' | 'history';

export type StatsScope = 'week' | 'month' | 'year';

export interface StatsPoint {
  name: string;
  count: number;
  avg: number;
  fullDate?: string;
}
