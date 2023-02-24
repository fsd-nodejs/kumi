import { history } from 'umi'

import { ChromeExtension } from '@/extension/background/utils/extension-tools/chrome-extension'

export const closePopupOrRedirectToHome = async (state?: {
  referrer: string
}) => {
  const isPopup = await ChromeExtension.checkIsPopup()

  if (isPopup) {
    window.close()
  } else {
    if (state?.referrer) {
      history.replace(state.referrer)
    } else {
      history.push('/home')
    }
  }
}
