import data from './version.json'

// App version. Build number auto-increments on every `npm run build`
// via scripts/bump-build.js (prebuild hook). Initial release: 1.3 B1001.
export const APP_VERSION = {
  version: data.version,
  build: data.build,
  full: `${data.version} B${data.build}`,
}
