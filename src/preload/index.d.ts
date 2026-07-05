import type { ElectronAPI } from '@electron-toolkit/preload'
import type { HoudApi } from './index'

declare global {
  interface Window {
    electron: ElectronAPI
    houd: HoudApi
  }
}
