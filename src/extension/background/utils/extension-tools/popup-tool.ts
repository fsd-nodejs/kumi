import GeneralConfigModel from '../../model/general.config.model'
import { ChromeExtension } from './chrome-extension'

const APP_SIZE = {
  width: 360,
  height: 580,
  statusBarHeight: 60,
}

class PopupManager {
  async getPopupID(): Promise<number> {
    const popupIDConfig = await GeneralConfigModel.configs.get(
      'PopupManager_popupID',
    )
    const popupId = popupIDConfig?.value as number
    return popupId
  }

  private async setPopupID(num: number | undefined) {
    if (!!num) {
      await GeneralConfigModel.configs.put({
        key: 'PopupManager_popupID',
        value: num,
      })
    } else {
      GeneralConfigModel.configs.delete('PopupManager_popupID')
    }
  }

  constructor() {
    chrome.windows.onRemoved.addListener(async (windowId) => {
      const popupId = await this.getPopupID()
      if (windowId === popupId) {
        this.setPopupID(undefined)
      }
    })
  }
  private async getPopupWindow() {
    try {
      const popupId = (await this.getPopupID()) ?? 0
      const popupWindow = await ChromeExtension.getWindow(popupId)
      if (popupWindow.type !== 'popup') {
        return undefined
      }
      return popupWindow
    } catch {
      return undefined
    }
  }

  showPopup = async (url: string): Promise<chrome.windows.Window> => {
    let left = 0
    let top = 0
    try {
      const lastFocused = await ChromeExtension.getLastFocusedWindow()
      top = lastFocused.top as number
      left =
        (lastFocused.left as number) +
        (lastFocused.width as number) -
        APP_SIZE.width
    } catch (_) {
      const { screenX, screenY, outerWidth } = window
      top = Math.max(screenY, 0)
      left = Math.max(screenX + (outerWidth - APP_SIZE.width), 0)
    }
    let popupWindow = await this.getPopupWindow()

    if (popupWindow && popupWindow.id) {
      await ChromeExtension.focusWindow(popupWindow.id).catch()
    } else {
      // create new notification popup
      popupWindow = await ChromeExtension.openWindow({
        url: url,
        type: 'popup',
        width: APP_SIZE.width,
        height: APP_SIZE.height + APP_SIZE.statusBarHeight,
        left,
        top,
      })
      this.setPopupID(popupWindow.id)
    }

    // Firefox currently ignores left/top for create, but it works for update
    if (popupWindow.left !== left && popupWindow.state !== 'fullscreen') {
      await ChromeExtension.updateWindowPosition(
        popupWindow.id as number,
        left,
        top,
      )
    }
    return popupWindow
  }

  closeAllPopup = async () => {
    const popupId = await this.getPopupID()
    chrome.windows.remove(popupId)
    this.setPopupID(undefined)
  }
}

export const DefaultPopupManager = new PopupManager()
