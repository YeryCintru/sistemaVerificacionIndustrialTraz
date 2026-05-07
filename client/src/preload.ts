import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Aquí se expondrán las APIs seguras en el futuro.
});
