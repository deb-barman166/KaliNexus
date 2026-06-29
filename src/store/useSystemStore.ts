import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppWindow {
  id: string;
  title: string;
  icon: string;
  component: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  x: number;
  y: number;
  width: number | string;
  height: number | string;
  instanceId?: string;
  props?: any;
}

interface SystemState {
  windows: AppWindow[];
  activeWindowId: string | null;
  highestZIndex: number;
  user: { name: string; pass: string };
  isAuthenticated: boolean;
  desktopIcons: Record<string, { x: number; y: number }>;
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  login: (pass: string) => boolean;
  logout: () => void;
  updateUser: (name: string, pass: string) => void;
  updateIconPosition: (id: string, x: number, y: number) => void;
  openWindow: (appId: string, title: string, icon: string, component: string, allowMultiple?: boolean, props?: any) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPosition: (id: string, x: number, y: number) => void;
  updateWindowSize: (id: string, width: number | string, height: number | string) => void;
}

export const useSystemStore = create<SystemState>()(
  persist(
    (set, get) => ({
      windows: [],
      activeWindowId: null,
      highestZIndex: 10,
      user: { name: 'kali', pass: 'kali' },
      isAuthenticated: true,
      desktopIcons: {},
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      setIsOnline: (isOnline) => set({ isOnline }),

      login: (pass) => {
        set({ isAuthenticated: true });
        return true;
      },

      logout: () => set({ isAuthenticated: true, windows: [] }),

      updateUser: (name, pass) => set({ user: { name, pass } }),

      updateIconPosition: (id, x, y) => set((state) => ({
        desktopIcons: { ...state.desktopIcons, [id]: { x, y } }
      })),

      openWindow: (appId, title, icon, component, allowMultiple = false, props = {}) => {
        const { windows, highestZIndex } = get();
        
        if (!allowMultiple) {
          const existingWindow = windows.find((w) => w.component === component);
          if (existingWindow) {
            set((state) => ({
              windows: state.windows.map((w) =>
                w.id === existingWindow.id ? { ...w, isMinimized: false, zIndex: state.highestZIndex + 1, props: { ...w.props, ...props } } : w
              ),
              activeWindowId: existingWindow.id,
              highestZIndex: state.highestZIndex + 1,
            }));
            return;
          }
        }

        const instanceId = allowMultiple ? `${appId}-${Date.now()}` : appId;

        const newWindow: AppWindow = {
          id: instanceId,
          title: allowMultiple ? `${title} (${windows.filter(w => w.component === component).length + 1})` : title,
          icon,
          component,
          isOpen: true,
          isMinimized: false,
          isMaximized: false,
          zIndex: highestZIndex + 1,
          x: 100 + (windows.length % 10) * 30,
          y: 100 + (windows.length % 10) * 30,
          width: 800,
          height: 500,
          instanceId,
          props,
        };

        set((state) => ({
          windows: [...state.windows, newWindow],
          activeWindowId: instanceId,
          highestZIndex: state.highestZIndex + 1,
        }));
      },

      closeWindow: (id) => {
        set((state) => ({
          windows: state.windows.filter((w) => w.id !== id),
          activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
        }));
      },

      minimizeWindow: (id) => {
        set((state) => {
          const activeWindowId = state.activeWindowId === id ? null : state.activeWindowId;
          return {
            windows: state.windows.map((w) => (w.id === id ? { ...w, isMinimized: true } : w)),
            activeWindowId,
          };
        });
      },

      maximizeWindow: (id) => {
        set((state) => ({
          windows: state.windows.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w)),
        }));
      },

      focusWindow: (id) => {
        set((state) => {
          if (state.activeWindowId === id) return state;
          return {
            windows: state.windows.map((w) =>
              w.id === id ? { ...w, zIndex: state.highestZIndex + 1, isMinimized: false } : w
            ),
            activeWindowId: id,
            highestZIndex: state.highestZIndex + 1,
          };
        });
      },

      updateWindowPosition: (id, x, y) => {
        set((state) => ({
          windows: state.windows.map((w) => (w.id === id ? { ...w, x, y } : w)),
        }));
      },

      updateWindowSize: (id, width, height) => {
        set((state) => ({
          windows: state.windows.map((w) => (w.id === id ? { ...w, width, height } : w)),
        }));
      },
    }),
    {
      name: 'kali-system-store',
      partialize: (state) => ({ user: state.user, desktopIcons: state.desktopIcons, isOnline: state.isOnline }),
    }
  )
);
