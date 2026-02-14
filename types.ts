
export interface AgentIdentity {
  name: string;
  voice: string;
  personality: string;
}

export interface MemoryEntry {
  id: string;
  content: string;
  timestamp: number;
  category: 'user_preference' | 'fact' | 'instruction' | 'note' | 'code_snippet' | 'learning' | 'motivation' | 'file_index';
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: 'business' | 'personal' | 'coding';
  dueDate?: number;
}

export interface LocalFolder {
  name: string;
  handle: FileSystemDirectoryHandle;
  indexedAt: number;
}

export interface DeviceState {
  power?: boolean;
  level?: number;
  label?: string;
}

export interface NetworkDevice {
  id: string;
  name: string;
  type: 'laptop' | 'smartphone' | 'iot' | 'speaker';
  status: 'online' | 'offline';
  connection: 'wifi' | 'bluetooth';
  state?: DeviceState;
}

export interface WorkspaceService {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  lastSync?: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  attachment?: {
    type: 'image' | 'file';
    data: string;
    mimeType: string;
  };
}
