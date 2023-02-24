function checkForError() {
  const { lastError } = chrome?.runtime
  if (!lastError) {
    return undefined
  }
  if (lastError.message) {
    return lastError
  }
  return new Error(lastError.message)
}

export const ChromeExtension = {
  openExtensionInBrowser(path?: string) {
    let extensionURL = chrome.runtime.getURL('index.html')
    if (path) {
      extensionURL += `#${path}`
    }
    ChromeExtension.openTab({ url: extensionURL })
  },
  async checkIsOpenByExtensionIcon() {
    try {
      await ChromeExtension.getCurrentTab()
      return false
    } catch (error) {
      return true
    }
  },
  async checkIsPopup() {
    try {
      const isOpenByExtensionIcon =
        await ChromeExtension.checkIsOpenByExtensionIcon()
      const currentWindow = await ChromeExtension.getCurrentWindow()
      return isOpenByExtensionIcon || currentWindow.type === 'popup'
    } catch (error) {
      return false
    }
  },
  openTab(options: chrome.tabs.CreateProperties): Promise<chrome.tabs.Tab> {
    return new Promise((resolve, reject) => {
      chrome.tabs.create(options, (newTab) => {
        if (newTab) {
          return resolve(newTab)
        }
        const error = checkForError()
        return reject(error)
      })
    })
  },
  getCurrentTab(): Promise<chrome.tabs.Tab> {
    return new Promise<chrome.tabs.Tab>((resolve, reject) => {
      chrome.tabs.getCurrent((tab) => {
        if (tab) {
          return resolve(tab)
        }
        return reject()
      })
    })
  },
  getCurrentWindow(): Promise<chrome.windows.Window> {
    return chrome.windows.getCurrent()
  },
  getAllWindows(): Promise<chrome.windows.Window[]> {
    return new Promise((resolve, reject) => {
      chrome.windows.getAll((windows) => {
        const error = checkForError()
        if (error) {
          return reject(error)
        }
        return resolve(windows)
      })
    })
  },
  async focusWindow(
    windowId: number,
    url?: string,
  ): Promise<chrome.windows.Window> {
    const chromeWindow = (await ChromeExtension.getWindow(windowId)) || {}
    await new Promise((resolve, reject) => {
      chrome.windows.update(windowId, { focused: true }, () => {
        const error = checkForError()
        if (error) {
          reject(error)
        } else {
          resolve(chromeWindow)
        }
      })
    })
    return new Promise((resolve, reject) => {
      if (chromeWindow.tabs?.length) {
        const tab = chromeWindow.tabs[0]
        chrome.tabs.update(tab.id as number, { active: true, url }, () => {
          const error = checkForError()
          if (error) {
            reject(error)
          } else {
            resolve(chromeWindow)
          }
        })
      } else {
        resolve(chromeWindow)
      }
    })
  },
  async getLastFocusedWindow(): Promise<chrome.windows.Window> {
    return new Promise((resolve, reject) => {
      chrome.windows.getLastFocused((windowObject) => {
        const error = checkForError()
        if (error) {
          return reject(error)
        }
        return resolve(windowObject)
      })
    })
  },
  getWindow(windowId: number): Promise<chrome.windows.Window> {
    return new Promise<chrome.windows.Window>((resolve, reject) => {
      try {
        chrome.windows.get(windowId, (chromeWindow) => {
          if (chromeWindow) {
            return resolve(chromeWindow)
          }
          const error = checkForError()
          return reject(error)
        })
      } catch (e) {
        reject(e)
      }
    })
  },
  openWindow(
    options: chrome.windows.CreateData,
  ): Promise<chrome.windows.Window> {
    return new Promise((resolve, reject) => {
      chrome.windows.create(options, (newWindow) => {
        if (newWindow) {
          return resolve(newWindow)
        }
        const error = checkForError()
        return reject(error)
      })
    })
  },
  updateWindowPosition(
    windowId: number,
    left: number,
    top: number,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.windows.update(windowId, { left, top }, () => {
        const error = checkForError()
        if (error) {
          return reject(error)
        }
        return resolve()
      })
    })
  },
  async closeCurrentPopup() {
    if (!chrome.tabs) {
      return
    }
    const tab = await ChromeExtension.getCurrentTab()
    const chromeWindow = await ChromeExtension.getWindow(tab.windowId)
    if (chromeWindow.type === 'popup') {
      chrome.windows.remove(chromeWindow.id as number)
    } else {
      throw new Error('current window is not a popup')
    }
  },
}
