// Increments the build number in src/lib/version.json before every build.
// Wired via the "prebuild" npm hook. Initial 1.3 B1000 → first build → B1001.
const fs = require('fs')
const path = require('path')

const file = path.join(__dirname, '..', 'src', 'lib', 'version.json')
const data = JSON.parse(fs.readFileSync(file, 'utf8'))
data.build = (Number(data.build) || 1000) + 1
fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n')
console.log(`🔖 Version bumped → ${data.version} B${data.build}`)
