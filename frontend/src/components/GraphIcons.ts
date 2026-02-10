import {
    Server,
    Database,
    Zap,
    ShieldCheck,
    Layout,
    MessageSquare,
    Cpu,
    HardDrive,
    Activity
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const nodeIcons: Record<string, LucideIcon> = {
    service: Server,
    database: Database,
    cache: Zap,
    gateway: ShieldCheck,
    frontend: Layout,
    queue: MessageSquare,
    backend: Cpu,
    worker: Activity,
    storage: HardDrive,
};

export const nodeColors: Record<string, string> = {
    service: '#3b82f6', // blue-500
    database: '#10b981', // green-500
    cache: '#f59e0b', // amber-500
    gateway: '#8b5cf6', // purple-500
    frontend: '#ec4899', // pink-500
    queue: '#06b6d4', // cyan-500
    backend: '#6366f1', // indigo-500
    worker: '#f97316', // orange-500
    storage: '#64748b', // slate-500
};
