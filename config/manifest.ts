import packageJson from '../package.json'

let suffix = ''
if (process.env.UMI_ENV !== 'production') {
  suffix = `(${process.env.UMI_ENV ?? 'development'})`
}
const versionNumbs = packageJson.version.split(/[^0-9]+/)

const manifestVersion = versionNumbs.join('.')

export default {
  name: `Kumi Extension${suffix}`,
  version: manifestVersion,
  version_name: packageJson.version,
  manifest_version: 3,
  description: 'A full stack framework for Chrome Extension',
  action: {
    default_popup: 'index.html#/',
    default_title: 'Kumi Extension',
    default_icon: {
      '16': 'icon-16.png',
      '19': 'icon-19.png',
      '32': 'icon-32.png',
      '38': 'icon-38.png',
      '48': 'icon-48.png',
      '64': 'icon-64.png',
      '128': 'icon-128.png',
      '512': 'icon-512.png',
    },
  },
  permissions: ['alarms'],
  host_permissions: ['<all_urls>'],
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['browser-polyfill.js', 'content-script.js'],
      run_at: 'document_start',
      all_frames: true,
    },
  ],
  icons: {
    '16': 'icon-16.png',
    '19': 'icon-19.png',
    '32': 'icon-32.png',
    '38': 'icon-38.png',
    '48': 'icon-48.png',
    '64': 'icon-64.png',
    '128': 'icon-128.png',
    '512': 'icon-512.png',
  },
  background: {
    service_worker: 'background.js',
    type: 'module',
  },
  web_accessible_resources: [
    {
      resources: ['inpage-content.js'],
      matches: ['<all_urls>'],
    },
  ],
}
