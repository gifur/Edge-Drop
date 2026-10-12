import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const tokensCss = readFileSync(join(__dirname, '..', 'src', 'styles', 'tokens.css'), 'utf8')

function lightToken(name: string): string {
  const lightBlock = tokensCss.match(/:root\[data-theme='light'\]\s*\{([\s\S]*?)\n\}/)?.[1] ?? ''
  return lightBlock.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1].trim() ?? ''
}

function luminance(hex: string): number {
  const channels = [0, 2, 4].map((offset) => parseInt(hex.slice(offset + 1, offset + 3), 16) / 255)
  const linear = channels.map((channel) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
}

function contrastOnWhite(hex: string): number {
  return 1.05 / (luminance(hex) + 0.05)
}

describe('light theme typography contrast', () => {
  it('keeps secondary and tertiary text opaque and readable on white surfaces', () => {
    for (const token of ['--text-secondary', '--text-tertiary']) {
      const value = lightToken(token)
      expect(value, `${token} should be an opaque six-digit color`).toMatch(/^#[0-9a-f]{6}$/i)
      expect(contrastOnWhite(value), `${token} should meet 4.5:1 contrast on white`).toBeGreaterThanOrEqual(4.5)
    }
  })
})
