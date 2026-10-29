import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = join(__dirname, '..')
const read = (path: string) => readFileSync(join(root, path), 'utf8')

describe('removed update and launch-at-login features', () => {
  it('ships no updater dependency, process, IPC, bridge, state, or setting', () => {
    expect(JSON.parse(read('package.json')).dependencies).not.toHaveProperty('electron-updater')
    expect(existsSync(join(root, 'electron/main/updater.ts'))).toBe(false)

    const production = [
      'shared/types.ts',
      'shared/ipc.ts',
      'shared/bridge.ts',
      'electron/main/index.ts',
      'electron/main/ipc.ts',
      'electron/main/state.ts',
      'electron/preload/index.ts',
      'src/App.tsx',
      'src/store/appStore.ts',
      'src/components/Settings.tsx'
    ].map(read).join('\n')

    expect(production).not.toMatch(/electron-updater|initAutoUpdater|checkForUpdates|startUpdateDownload|installUpdate|updateMode|autoUpdates|app:update-/)
  })

  it('ships no launch-at-login implementation, IPC, setting, or helper resource', () => {
    expect(existsSync(join(root, 'electron/main/loginItems.ts'))).toBe(false)
    expect(existsSync(join(root, 'electron/main/storeStartup.ts'))).toBe(false)
    expect(existsSync(join(root, 'resources/startup/EdgeDropStartup.exe'))).toBe(false)
    expect(existsSync(join(root, 'resources/startup/EdgeDropStartup.cs'))).toBe(false)
    expect(existsSync(join(root, 'resources/appx/startup-extensions.xml'))).toBe(false)

    const production = [
      'package.json',
      'shared/types.ts',
      'shared/ipc.ts',
      'shared/bridge.ts',
      'electron/main/index.ts',
      'electron/main/ipc.ts',
      'electron/preload/index.ts',
      'src/store/appStore.ts',
      'src/components/Settings.tsx'
    ].map(read).join('\n')

    expect(production).not.toMatch(/launchAtLogin|setLoginItemSettings|startup:refresh|EdgeDropStartup|startup-extensions/)
  })
})
