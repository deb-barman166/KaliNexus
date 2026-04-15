import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FileNode {
  name: string;
  type: 'file' | 'dir' | 'symlink';
  content?: string;
  target?: string;
  children?: Record<string, FileNode>;
  permissions: string;
  owner: string;
  group: string;
  size: number;
  modifiedAt: string;
}

interface FileSystemState {
  root: FileNode;
  currentPath: string;
  history: string[];
  historyIndex: number;
  getFile: (path: string, resolveSymlinks?: boolean) => FileNode | null;
  readDir: (path: string) => Record<string, FileNode> | null;
  readFile: (path: string) => string | null;
  writeFile: (path: string, content: string) => boolean;
  mkdir: (path: string) => boolean;
  rm: (path: string) => boolean;
  setCurrentPath: (path: string) => void;
  resolvePath: (path: string) => string;
  renameNode: (path: string, newName: string) => boolean;
  createSymlink: (targetPath: string, linkPath: string) => boolean;
  copyNode: (sourcePath: string, destPath: string) => boolean;
  moveNode: (sourcePath: string, destPath: string) => boolean;
}

const initialFileSystem: FileNode = {
  name: '/',
  type: 'dir',
  permissions: 'drwxr-xr-x',
  owner: 'root',
  group: 'root',
  size: 4096,
  modifiedAt: new Date().toISOString(),
  children: {
    home: {
      name: 'home',
      type: 'dir',
      permissions: 'drwxr-xr-x',
      owner: 'root',
      group: 'root',
      size: 4096,
      modifiedAt: new Date().toISOString(),
      children: {
        kali: {
          name: 'kali',
          type: 'dir',
          permissions: 'drwxr-xr-x',
          owner: 'kali',
          group: 'kali',
          size: 4096,
          modifiedAt: new Date().toISOString(),
          children: {
            Desktop: {
              name: 'Desktop',
              type: 'dir',
              permissions: 'drwxr-xr-x',
              owner: 'kali',
              group: 'kali',
              size: 4096,
              modifiedAt: new Date().toISOString(),
              children: {},
            },
            Documents: {
              name: 'Documents',
              type: 'dir',
              permissions: 'drwxr-xr-x',
              owner: 'kali',
              group: 'kali',
              size: 4096,
              modifiedAt: new Date().toISOString(),
              children: {
                'readme.txt': {
                  name: 'readme.txt',
                  type: 'file',
                  content: 'Welcome to Kali Web OS.\nThis is a simulated environment.',
                  permissions: '-rw-r--r--',
                  owner: 'kali',
                  group: 'kali',
                  size: 56,
                  modifiedAt: new Date().toISOString(),
                },
              },
            },
            Downloads: {
              name: 'Downloads',
              type: 'dir',
              permissions: 'drwxr-xr-x',
              owner: 'kali',
              group: 'kali',
              size: 4096,
              modifiedAt: new Date().toISOString(),
              children: {},
            },
          },
        },
      },
    },
    etc: {
      name: 'etc',
      type: 'dir',
      permissions: 'drwxr-xr-x',
      owner: 'root',
      group: 'root',
      size: 4096,
      modifiedAt: new Date().toISOString(),
      children: {
        passwd: {
          name: 'passwd',
          type: 'file',
          content: 'root:x:0:0:root:/root:/bin/bash\nkali:x:1000:1000:kali,,,:/home/kali:/bin/bash',
          permissions: '-rw-r--r--',
          owner: 'root',
          group: 'root',
          size: 78,
          modifiedAt: new Date().toISOString(),
        },
      },
    },
    var: {
      name: 'var',
      type: 'dir',
      permissions: 'drwxr-xr-x',
      owner: 'root',
      group: 'root',
      size: 4096,
      modifiedAt: new Date().toISOString(),
      children: {
        log: {
          name: 'log',
          type: 'dir',
          permissions: 'drwxr-xr-x',
          owner: 'root',
          group: 'root',
          size: 4096,
          modifiedAt: new Date().toISOString(),
          children: {},
        },
      },
    },
    bin: {
      name: 'bin',
      type: 'dir',
      permissions: 'drwxr-xr-x',
      owner: 'root',
      group: 'root',
      size: 4096,
      modifiedAt: new Date().toISOString(),
      children: {
        bash: { name: 'bash', type: 'file', content: '', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', size: 1024, modifiedAt: new Date().toISOString() },
        ls: { name: 'ls', type: 'file', content: '', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', size: 1024, modifiedAt: new Date().toISOString() },
        cat: { name: 'cat', type: 'file', content: '', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', size: 1024, modifiedAt: new Date().toISOString() },
      },
    },
  },
};

export const useFileSystemStore = create<FileSystemState>()(
  persist(
    (set, get) => ({
      root: initialFileSystem,
      currentPath: '/home/kali',
      history: ['/home/kali'],
      historyIndex: 0,

      resolvePath: (path: string) => {
        if (path.startsWith('/')) return path;
        const current = get().currentPath;
        if (current === '/') return `/${path}`;
        
        const parts = current.split('/').filter(Boolean);
        const newParts = path.split('/').filter(Boolean);
        
        for (const part of newParts) {
          if (part === '.') continue;
          if (part === '..') {
            parts.pop();
          } else {
            parts.push(part);
          }
        }
        
        return '/' + parts.join('/');
      },

      getFile: (path: string, resolveSymlinks = true) => {
        const resolvedPath = get().resolvePath(path);
        if (resolvedPath === '/') return get().root;

        const parts = resolvedPath.split('/').filter(Boolean);
        let current = get().root;

        for (const part of parts) {
          if (current.type !== 'dir' || !current.children || !current.children[part]) {
            return null;
          }
          current = current.children[part];
        }

        if (resolveSymlinks && current.type === 'symlink' && current.target) {
          return get().getFile(current.target, true);
        }

        return current;
      },

      readDir: (path: string) => {
        const node = get().getFile(path);
        if (node && node.type === 'dir') {
          return node.children || {};
        }
        return null;
      },

      readFile: (path: string) => {
        const node = get().getFile(path);
        if (node && node.type === 'file') {
          return node.content || '';
        }
        return null;
      },

      writeFile: (path: string, content: string) => {
        const resolvedPath = get().resolvePath(path);
        const parts = resolvedPath.split('/').filter(Boolean);
        const fileName = parts.pop();
        
        if (!fileName) return false;

        const dirPath = '/' + parts.join('/');
        let current = get().root;
        
        // Traverse to parent dir
        for (const part of parts) {
          if (current.type !== 'dir' || !current.children || !current.children[part]) {
            return false; // Parent dir doesn't exist
          }
          current = current.children[part];
        }

        if (!current.children) current.children = {};

        current.children[fileName] = {
          name: fileName,
          type: 'file',
          content,
          permissions: '-rw-r--r--',
          owner: 'kali',
          group: 'kali',
          size: content.length,
          modifiedAt: new Date().toISOString(),
        };

        set({ root: { ...get().root } });
        return true;
      },

      mkdir: (path: string) => {
        const resolvedPath = get().resolvePath(path);
        const parts = resolvedPath.split('/').filter(Boolean);
        const dirName = parts.pop();
        
        if (!dirName) return false;

        const parentPath = '/' + parts.join('/');
        let current = get().root;
        
        for (const part of parts) {
          if (current.type !== 'dir' || !current.children || !current.children[part]) {
            return false;
          }
          current = current.children[part];
        }

        if (!current.children) current.children = {};
        if (current.children[dirName]) return false; // Already exists

        current.children[dirName] = {
          name: dirName,
          type: 'dir',
          permissions: 'drwxr-xr-x',
          owner: 'kali',
          group: 'kali',
          size: 4096,
          modifiedAt: new Date().toISOString(),
          children: {},
        };

        set({ root: { ...get().root } });
        return true;
      },

      rm: (path: string) => {
        const resolvedPath = get().resolvePath(path);
        if (resolvedPath === '/') return false; // Cannot remove root

        const parts = resolvedPath.split('/').filter(Boolean);
        const targetName = parts.pop();
        
        if (!targetName) return false;

        let current = get().root;
        
        for (const part of parts) {
          if (current.type !== 'dir' || !current.children || !current.children[part]) {
            return false;
          }
          current = current.children[part];
        }

        if (!current.children || !current.children[targetName]) return false;

        delete current.children[targetName];
        set({ root: { ...get().root } });
        return true;
      },

      setCurrentPath: (path: string) => {
        const resolvedPath = get().resolvePath(path);
        const node = get().getFile(resolvedPath);
        
        if (node && node.type === 'dir') {
          set({ currentPath: resolvedPath });
        }
      },

      renameNode: (path: string, newName: string) => {
        const resolvedPath = get().resolvePath(path);
        if (resolvedPath === '/') return false; // Cannot rename root

        const parts = resolvedPath.split('/').filter(Boolean);
        const targetName = parts.pop();
        
        if (!targetName || !newName || targetName === newName) return false;

        let current = get().root;
        
        for (const part of parts) {
          if (current.type !== 'dir' || !current.children || !current.children[part]) {
            return false;
          }
          current = current.children[part];
        }

        if (!current.children || !current.children[targetName] || current.children[newName]) {
          return false;
        }

        const nodeToRename = current.children[targetName];
        nodeToRename.name = newName;
        current.children[newName] = nodeToRename;
        delete current.children[targetName];

        set({ root: { ...get().root } });
        return true;
      },

      createSymlink: (targetPath: string, linkPath: string) => {
        const resolvedLinkPath = get().resolvePath(linkPath);
        const parts = resolvedLinkPath.split('/').filter(Boolean);
        const linkName = parts.pop();
        
        if (!linkName) return false;

        let current = get().root;
        for (const part of parts) {
          if (current.type !== 'dir' || !current.children || !current.children[part]) return false;
          current = current.children[part];
        }

        if (!current.children) current.children = {};
        if (current.children[linkName]) return false;

        current.children[linkName] = {
          name: linkName,
          type: 'symlink',
          target: targetPath,
          permissions: 'lrwxrwxrwx',
          owner: 'kali',
          group: 'kali',
          size: targetPath.length,
          modifiedAt: new Date().toISOString(),
        };

        set({ root: { ...get().root } });
        return true;
      },

      copyNode: (sourcePath: string, destPath: string) => {
        const sourceNode = get().getFile(sourcePath);
        if (!sourceNode) return false;

        const resolvedDestPath = get().resolvePath(destPath);
        const parts = resolvedDestPath.split('/').filter(Boolean);
        const destName = parts.pop();
        
        if (!destName) return false;

        let current = get().root;
        for (const part of parts) {
          if (current.type !== 'dir' || !current.children || !current.children[part]) return false;
          current = current.children[part];
        }

        if (!current.children) current.children = {};
        if (current.children[destName]) return false;

        // Deep copy the node
        const copy = JSON.parse(JSON.stringify(sourceNode));
        copy.name = destName;
        current.children[destName] = copy;

        set({ root: { ...get().root } });
        return true;
      },

      moveNode: (sourcePath: string, destPath: string) => {
        const success = get().copyNode(sourcePath, destPath);
        if (success) {
          get().rm(sourcePath);
          return true;
        }
        return false;
      },
    }),
    {
      name: 'kali-web-fs',
    }
  )
);
