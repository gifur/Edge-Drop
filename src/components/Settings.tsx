import { useEffect, useState, useRef, useLayoutEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/appStore'
<<<<<<< HEAD
import type { DisplayInfo, ThemeMode, UpdateMode } from '../../shared/types'
import { resolveUpdateMode } from '../../shared/types'
=======
import type { DisplayInfo, UpdateMode } from '../../shared/types'
import {
  resolveUpdateMode,
  normalizeHoverOpenDelay,
  HOVER_OPEN_DELAY_MIN,
  HOVER_OPEN_DELAY_MAX,
  HOVER_OPEN_DELAY_STEP
} from '../../shared/types'
>>>>>>> main
import {
  LogoIndicatorIcon,
  TickIndicatorIcon,
  CopyIndicatorIcon,
  SparkleIndicatorIcon
} from './CopyIndicatorCurve'
import {
  ArrowsClockwiseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CloseIcon,
  GithubOctocatLogo,
  GlobeIcon,
  HeartIcon,
  InfoIcon,
  LogOutIcon,
  MicrosoftStoreLogo
} from './icons'
import { HotkeyRecorder } from './HotkeyRecorder'
import { SlideCommit } from './SlideCommit'
import { WakeSlider } from './WakeSlider'
import { playDialTickSound, playToggleSound, playButtonClickSound } from '../lib/soundEffects'
import { useTranslation } from '../i18n'
import { Moon, Sun } from 'lucide-react'
import '../styles/settings.css'

type SettingsTab = 'behaviour' | 'position' | 'appearance'

// These optional surfaces remain implemented for a later product decision,
// but are intentionally hidden from the current settings UI.
const SHOW_LOGIN_AT_STARTUP_SETTING = false
const SHOW_UPDATE_SETTINGS = false
const SHOW_COMMUNITY_SUPPORT = false

export function Settings({
  inlineIndicatorStyle,
  isHorizontal: propIsHorizontal
}: {
  inlineIndicatorStyle?: boolean
  isHorizontal?: boolean
}) {
  const { t, language, languages } = useTranslation()
  const settings = useStore((s) => s.settings)
  const isHorizontal = propIsHorizontal ?? (settings.stickPosition === 'top')

  const TABS: { id: SettingsTab; label: string }[] = [
    { id: 'behaviour',  label: t('tabs.behaviour') },
    { id: 'position',   label: t('tabs.position') },
    { id: 'appearance', label: t('tabs.appearance') },
  ]
  const patch = useStore((s) => s.patchSettings)
  const pushToast = useStore((s) => s.pushToast)
  const updateInfo = useStore((s) => s.updateInfo)
  const isStoreBuild = useStore((s) => s.isStoreBuild)
  const currentVersion = useStore((s) => s.currentVersion)
  const styleFlyoutOpen = useStore((s) => s.styleFlyoutOpen)
  const setStyleFlyoutOpen = useStore((s) => s.setStyleFlyoutOpen)
  const languageFlyoutOpen = useStore((s) => s.languageFlyoutOpen)
  const setLanguageFlyoutOpen = useStore((s) => s.setLanguageFlyoutOpen)
  const setSliderActive = useStore((s) => s.setSliderActive)
  const edgeTransition = useStore((s) => s.edgeTransition)
  const startEdgeTransition = useStore((s) => s.startEdgeTransition)

  const getLangLabel = (l: { code: string; name: string; nativeName: string }) =>
    l.code === 'system' || l.nativeName.includes('(') ? l.nativeName : `${l.nativeName} (${l.name})`
  const selectedLang = languages.find((l) => l.code === (language || 'system')) || languages[0]

<<<<<<< HEAD
  const lastTickVal = useRef<number>(settings.verticalOffset ?? 0.5)
  const lastOpacityVal = useRef<number>(settings.panelOpacity ?? 100)
  const lastPanelWidthVal = useRef<number>(settings.panelWidth ?? 270)
=======
>>>>>>> main
  const horizontalTab = useStore((s) => s.settingsTab)
  const shelfTrackRef = useRef<HTMLDivElement>(null)
  const horizontalTabScrollPositions = useRef<Record<SettingsTab, number>>({
    behaviour: 0,
    position: 0,
    appearance: 0
  })
  const isSwitchingTabRef = useRef(false)

  // Reset horizontal tab to 'behaviour' and scroll positions to 0 on mount,
  // but preserve 'position' if already on it or actively transitioning edges.
  useEffect(() => {
    if (isHorizontal) {
      const currentTab = useStore.getState().settingsTab
      const isTransitioning = !!useStore.getState().edgeTransition?.active
      if (currentTab !== 'position' && !isTransitioning) {
        useStore.getState().setSettingsTab('behaviour')
      }
      horizontalTabScrollPositions.current = {
        behaviour: 0,
        position: 0,
        appearance: 0
      }
    }
  }, [isHorizontal])

  // Restore target section's independent horizontal scroll position when tab changes
  useLayoutEffect(() => {
    if (!isHorizontal) return
    isSwitchingTabRef.current = true
    if (shelfTrackRef.current) {
      const targetPos = horizontalTabScrollPositions.current[horizontalTab] ?? 0
      shelfTrackRef.current.scrollLeft = targetPos
    }
    const id = requestAnimationFrame(() => {
      isSwitchingTabRef.current = false
    })
    return () => cancelAnimationFrame(id)
  }, [isHorizontal, horizontalTab])

  // The slider plays its own detent ticks while dragging; presets tick on click.
  const handleSliderInput = (rawVal: number) => {
    const clamped = Math.min(1.0, Math.max(0.0, rawVal))
    useStore.setState((s) => ({
      settings: { ...s.settings, verticalOffset: clamped }
    }))
  }

  const handleSliderRelease = (rawVal: number) => {
    const clamped = Math.min(1.0, Math.max(0.0, Math.round(rawVal * 100) / 100))
    patch({ verticalOffset: clamped })
  }

  const handleThicknessInput = (rawVal: number) => {
    const clamped = Math.min(7, Math.max(1, Math.round(rawVal)))
    if (clamped !== (settings.hotZoneWidth ?? 3)) {
      useStore.setState((s) => ({
        settings: { ...s.settings, hotZoneWidth: clamped }
      }))
    }
  }

  const handleThicknessRelease = (rawVal: number) => {
    const clamped = Math.min(7, Math.max(1, Math.round(rawVal)))
    setSliderActive(false)
    patch({ hotZoneWidth: clamped })
  }

<<<<<<< HEAD
  const handleOpacityInput = (rawVal: number) => {
    const clamped = Math.min(100, Math.max(0, Math.round(rawVal)))
    if (clamped !== (settings.panelOpacity ?? 100)) {
      if (Math.abs(clamped - lastOpacityVal.current) >= 5) {
        lastOpacityVal.current = clamped
        playDialTickSound()
      }
      useStore.setState((s) => ({
        settings: { ...s.settings, panelOpacity: clamped }
=======
  // ── Hover open delay (shared by both layouts) ──────────────────────────
  const hoverOn = settings.hoverActivation ?? true
  const hoverDelay = normalizeHoverOpenDelay(settings.hoverOpenDelay)
  const formatHoverDelay = (ms: number) =>
    ms === 0 ? (t('behaviour.hoverDelayInstant') || 'Instant') : `${ms} ms`

  const handleHoverDelayInput = (rawVal: number) => {
    const next = normalizeHoverOpenDelay(rawVal)
    if (next !== normalizeHoverOpenDelay(useStore.getState().settings.hoverOpenDelay)) {
      useStore.setState((s) => ({
        settings: { ...s.settings, hoverOpenDelay: next }
>>>>>>> main
      }))
    }
  }

<<<<<<< HEAD
  const handleOpacityRelease = (rawVal: number) => {
    const clamped = Math.min(100, Math.max(0, Math.round(rawVal)))
    lastOpacityVal.current = clamped
    setSliderActive(false)
    playDialTickSound()
    patch({ panelOpacity: clamped })
  }

  const handlePanelWidthInput = (rawVal: number) => {
    const clamped = Math.min(360, Math.max(220, Math.round(rawVal)))
    if (clamped !== (settings.panelWidth ?? 270)) {
      if (Math.abs(clamped - lastPanelWidthVal.current) >= 10) {
        lastPanelWidthVal.current = clamped
        playDialTickSound()
      }
      useStore.setState((s) => ({
        settings: { ...s.settings, panelWidth: clamped }
      }))
    }
  }

  const handlePanelWidthRelease = (rawVal: number) => {
    const clamped = Math.min(360, Math.max(220, Math.round(rawVal)))
    lastPanelWidthVal.current = clamped
    setSliderActive(false)
    playDialTickSound()
    patch({ panelWidth: clamped })
  }
=======
  const handleHoverDelayRelease = (rawVal: number) => {
    setSliderActive(false)
    patch({ hoverOpenDelay: normalizeHoverOpenDelay(rawVal) })
  }

  /** Open delay: the wave slider plus Instant / 500 ms / 1000 ms presets. */
  const renderHoverDelayControl = () => (
    <div className="setting-slider-wrap">
      <WakeSlider
        ariaLabel={t('behaviour.hoverDelayTitle') || 'Open Delay'}
        min={HOVER_OPEN_DELAY_MIN}
        max={HOVER_OPEN_DELAY_MAX}
        step={HOVER_OPEN_DELAY_STEP}
        bars={28}
        height={isHorizontal ? 22 : 28}
        restHeight={isHorizontal ? 6 : 8}
        gap={3}
        value={hoverDelay}
        disabled={!hoverOn}
        onStart={() => {
          void window.edge.setInteractive(true)
          setSliderActive(true)
        }}
        onRelease={(val) => {
          handleHoverDelayRelease(val)
        }}
        onChange={(val) => {
          handleHoverDelayInput(val)
        }}
      />
      <div className="setting-slider-labels">
        {[HOVER_OPEN_DELAY_MIN, 500, HOVER_OPEN_DELAY_MAX].map((ms) => {
          const active = hoverDelay === ms
          return (
            <button
              key={ms}
              type="button"
              disabled={!hoverOn}
              className={`slider-label-btn${active ? ' active' : ''}`}
              onClick={() => {
                if (hoverOn && !active) {
                  playDialTickSound()
                  patch({ hoverOpenDelay: ms })
                }
              }}
            >
              {formatHoverDelay(ms)}
            </button>
          )
        })}
      </div>
    </div>
  )
>>>>>>> main

  const [localInlineOpen, setLocalInlineOpen] = useState(false)
  const isTutorial = inlineIndicatorStyle || (typeof window !== 'undefined' && window.location.hash.includes('onboarding'))
  const isFlyoutActive = isTutorial ? localInlineOpen : styleFlyoutOpen

  const handleToggleFlyout = (anchorEl?: HTMLElement | null) => {
    if (isTutorial) {
      setLocalInlineOpen(!localInlineOpen)
    } else {
      const nextOpen = !styleFlyoutOpen
      let rect: { x: number; y: number; width: number; height: number } | null = null
      if (nextOpen && anchorEl) {
        const r = anchorEl.getBoundingClientRect()
        rect = { x: r.left, y: r.top, width: r.width, height: r.height }
      }
      setStyleFlyoutOpen(nextOpen, rect)
    }
  }

  const [displays, setDisplays] = useState<DisplayInfo[]>([])
  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.edge.getDisplays().then(setDisplays).catch(() => {})
    }, 250)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    let timer: number
    const pullTimer = window.setTimeout(() => {
      void useStore.getState().refreshLaunchAtLogin()
      timer = window.setInterval(() => {
        void useStore.getState().refreshLaunchAtLogin()
      }, 2000)
    }, 300)
    return () => {
      window.clearTimeout(pullTimer)
      if (timer) window.clearInterval(timer)
    }
  }, [])

  const updateDownloaded = updateInfo?.downloaded ? { version: updateInfo.latestVersion } : null
  const updateMode = resolveUpdateMode(settings)

  const checkState = useStore((s) => s.manualCheckState)
  const handleManualCheck = () => useStore.getState().startManualCheck()
  const handleStartDownload = () => useStore.getState().startManualDownload()

  const isManualDownloading = checkState.status === 'downloading'
  const isDownloading = isManualDownloading || (!updateDownloaded && !!updateInfo?.hasUpdate && (updateMode === 'auto' || !!updateInfo?.downloadProgress))
  // Update waiting for a user decision (Notify mode prompt or available check).
  const hasBackgroundUpdate = !updateDownloaded && !isDownloading && (!!updateInfo?.hasUpdate || checkState.status === 'available')
  const downloadPercent = updateInfo?.downloadProgress?.percent ?? 0

  // ── Tab state & Independent Scroll Memory per section ──────────────────────
  const activeTab = useStore((s) => s.settingsTab)
  const setActiveTab = useStore((s) => s.setSettingsTab)
  const scrollListRef = useRef<HTMLDivElement>(null)
  const tabScrollPositions = useRef<Record<SettingsTab, number>>({
    behaviour: 0,
    position: 0,
    appearance: 0
  })

  const handleTabSwitch = (newTab: SettingsTab) => {
    if (newTab === activeTab) return
    if (styleFlyoutOpen) {
      setStyleFlyoutOpen(false)
    }
    // Save current section's scroll position
    if (scrollListRef.current) {
      tabScrollPositions.current[activeTab] = scrollListRef.current.scrollTop
    }
    playButtonClickSound()
    setActiveTab(newTab)
  }

  // Close flyout if settings closes or unmounts
  useEffect(() => {
    return () => {
      if (useStore.getState().styleFlyoutOpen) {
        useStore.getState().setStyleFlyoutOpen(false)
      }
    }
  }, [])

  // Restore target section's independent scroll position when tab changes
  useEffect(() => {
    if (scrollListRef.current) {
      const targetPos = tabScrollPositions.current[activeTab] ?? 0
      scrollListRef.current.scrollTop = targetPos
    }
  }, [activeTab])

  // When update check finds a new update, smoothly scroll to top/front to highlight the update card
  useEffect(() => {
    if (checkState.status === 'available') {
      const behavior = settings.reduceMotion ? 'auto' : 'smooth'
      if (isHorizontal) {
        if (shelfTrackRef.current) {
          shelfTrackRef.current.scrollTo({ left: 0, behavior })
        }
        horizontalTabScrollPositions.current.behaviour = 0
      } else {
        if (scrollListRef.current) {
          scrollListRef.current.scrollTo({ top: 0, behavior })
        }
        tabScrollPositions.current.behaviour = 0
      }
    }
  }, [checkState.status, isHorizontal, settings.reduceMotion])

  // ── Promoted Active Update State ───────────────────────────────────────────
  // The top card shows all active update lifecycle stages:
  // 1) Downloaded update -> 'Restart to Update'
  // 2) Downloading in progress -> Live progress bar
  // 3) Update found & available -> 'Download & Update' / 'Skip'
  const hasPromotedTopUpdate = SHOW_UPDATE_SETTINGS && !isStoreBuild && (
    !!updateDownloaded ||
    isDownloading ||
    hasBackgroundUpdate
  )

  // ── After the settings: two cards, each with one job ──────────────────────
  // Community & Support (why, then Ko-fi / GitHub) and About Edge-Drop
  // (version, feedback, quit). They end every tab: in the top dock they scroll
  // in after the last group instead of staying pinned.
  // (What's New lives on the header's (i) button.)
  const renderClosingCards = () => (
    <>
<<<<<<< HEAD
      {SHOW_COMMUNITY_SUPPORT && (
        <>
      {/* Community & Support */}
      <div className="setting-section-divider">
        <span className="setting-section-divider-text">{t('footer.communityAndSupport') || 'COMMUNITY & SUPPORT'}</span>
      </div>

      <div className="setting-card">
        <div className="shelf-card-top">
          <div className="setting-group-label">{t('groups.feedback') || 'FEEDBACK'}</div>
          <div className="setting-title">{t('footer.feedbackTitle')}</div>
          <div className="setting-desc">{t('footer.feedbackDesc')}</div>
        </div>
        <div className="shelf-card-bottom">
=======
      <section className={`settings-support${isHorizontal ? ' is-h' : ''}`} data-card="support">
        <h3 className="set-group-label">{t('footer.communityAndSupport') || 'COMMUNITY & SUPPORT'}</h3>
        <div className="settings-support-tagline">{t('footer.supportTagline') || '100% free & open-source clipboard'}</div>
        <div className="settings-support-actions">
>>>>>>> main
          <button
            type="button"
            className="settings-support-btn is-primary kofi-support-btn"
            onClick={() => {
              playButtonClickSound()
              window.open('https://www.edgedrop.app/supportedgedrop', '_blank')
            }}
          >
            <HeartIcon width={13} height={13} />
            <span>{t('footer.supportOnKofi')}</span>
          </button>
          {isStoreBuild ? (
            <button
              type="button"
              className="settings-support-btn store-review-promo-btn"
              onClick={() => {
                playButtonClickSound()
                window.open('ms-windows-store://review/?ProductId=9P3JMHN9M4NR', '_blank')
              }}
            >
              <MicrosoftStoreLogo width={13} height={13} className="store-logo-icon" />
              <span>{t('footer.reviewOnStore')}</span>
            </button>
          ) : (
            <button
              type="button"
              className="settings-support-btn github-promo-btn"
              onClick={() => {
                playButtonClickSound()
                window.open('https://github.com/Deepender25/Edge-Drop', '_blank')
              }}
            >
              <GithubOctocatLogo width={13} height={13} className="github-octocat-icon" />
              <span>{t('footer.starOnGithub')}</span>
            </button>
          )}
        </div>
      </section>

      <section className={`settings-support settings-about${isHorizontal ? ' is-h' : ''}`} data-card="about">
        <h3 className="set-group-label">{t('groups.aboutEdgeDrop') || 'ABOUT EDGE-DROP'}</h3>
        <div className="settings-about-title">Edge-Drop {currentVersion || '0.3.1'}</div>
        <div className="settings-support-tagline">{t('footer.feedbackDesc')}</div>
        <div className="settings-support-actions">
          <button
            type="button"
            className="settings-support-btn"
            onClick={() => {
              playButtonClickSound()
              window.open('https://github.com/Deepender25/Edge-Drop/issues/new/choose', '_blank')
            }}
          >
            <span>{t('footer.submitFeedback')}</span>
          </button>
          <button
            type="button"
            className="settings-support-link subtle-quit-btn"
            onClick={() => {
              playButtonClickSound()
              void window.edge.quitApp()
            }}
          >
            <LogOutIcon width={12} height={12} />
            <span>{t('tray.quit')}</span>
          </button>
        </div>
<<<<<<< HEAD
      </div>

      {/* Support & GitHub Promo Card */}
      <div className="setting-card" style={{ padding: '14px' }}>
        <div className="support-promo" style={{ margin: 0, padding: 0, background: 'transparent', border: 'none' }}>
          <div className="support-promo-title">
            {t('footer.supportPromo')}
          </div>
          <div className="support-buttons-group">
            {/* Primary Action: Support via Ko-fi / UPI */}
            <button
              className="kofi-support-btn"
              onClick={() => {
                playButtonClickSound()
                window.open('https://www.edgedrop.app/supportedgedrop', '_blank')
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#ff4757" stroke="none" style={{ flexShrink: 0 }}>
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span>{t('footer.supportOnKofi')}</span>
            </button>

            {/* Secondary Action: GitHub Star on GitHub builds / Review on Microsoft Store for Store builds */}
            {isStoreBuild ? (
              <button
                type="button"
                className="store-review-promo-btn"
                onClick={() => {
                  playButtonClickSound()
                  window.open('ms-windows-store://review/?ProductId=9P3JMHN9M4NR', '_blank')
                }}
              >
                <MicrosoftStoreLogo width={14} height={14} className="store-logo-icon" />
                <span>{t('footer.reviewOnStore')}</span>
              </button>
            ) : (
              <button
                type="button"
                className="github-promo-btn"
                onClick={() => {
                  playButtonClickSound()
                  window.open('https://github.com/Deepender25/Edge-Drop', '_blank')
                }}
              >
                <GithubOctocatLogo width={14} height={14} className="github-octocat-icon" />
                <span>{t('footer.starOnGithub')}</span>
                <StarIcon width={13} height={13} className="star-icon" fill="#fbbf24" stroke="#fbbf24" style={{ marginLeft: 2 }} />
              </button>
            )}
          </div>
          <div className="app-version-footer">
            <span>{t('footer.version')} {currentVersion || '0.3.1'}</span>
            <span className="version-separator">·</span>
            <button
              type="button"
              className="version-changelog-link"
              onClick={() => {
                playButtonClickSound()
                if (currentVersion) {
                  patch({ lastSeenChangelogVersion: currentVersion })
                }
                window.open('https://www.edgedrop.app/changelog', '_blank')
              }}
            >
              <span>{t('header.whatsNew')}</span>
              <span style={{ fontSize: 10, opacity: 0.7 }}>↗</span>
            </button>
          </div>
        </div>
      </div>
        </>
      )}

      {/* Subtle Bottom Quit Button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12, marginBottom: 8 }}>
        <button
          className="subtle-quit-btn"
          onClick={() => {
            playButtonClickSound()
            void window.edge.quitApp()
          }}
        >
          <LogOutIcon width={13} height={13} />
          <span>{t('tray.quit')}</span>
        </button>
      </div>
=======
      </section>
>>>>>>> main
    </>
  )

  const handleOpenChangelog = () => {
    playButtonClickSound()
    const targetVersion = checkState.version || updateInfo?.latestVersion || currentVersion
    if (targetVersion) {
      patch({ lastSeenChangelogVersion: targetVersion })
    }
    window.open('https://www.edgedrop.app/changelog', '_blank')
  }

  // ── Promoted Top Update Card Renderer (Vertical Layout) ────────────────────
  const renderPromotedTopUpdateCard = () => {
    if (!SHOW_UPDATE_SETTINGS) return null
    if (isStoreBuild) return null
    if (!hasPromotedTopUpdate) return null

    if (updateDownloaded) {
      return (
        <div className="setting-card update-promoted-card">
          <div className="shelf-card-top">
            <div className="update-header-row">
              <div className="update-group-label">
                <span className="update-dot" />
                <span>{t('behaviour.updateLabelReady') || 'UPDATE READY'}</span>
              </div>
              <button
                type="button"
                className="update-info-btn"
                title={t('header.whatsNew') || "What's New"}
                aria-label={t('header.whatsNew') || "What's New"}
                onClick={handleOpenChangelog}
              >
                <InfoIcon width={13} height={13} />
              </button>
            </div>
            <div className="setting-title">
              {t('behaviour.updateReadyTitle', { version: updateDownloaded.version })}
            </div>
            <div className="setting-desc">
              {t('behaviour.updateReadyDesc')}
            </div>
          </div>
          <div className="shelf-card-bottom">
            <SlideCommit
              label={t('behaviour.restart') || 'Restart'}
              doneLabel={t('behaviour.restarting') || 'Restarting...'}
              errorLabel={t('behaviour.restartFailed') || 'Restart failed'}
              height={32}
              radius={10}
              onConfirm={() => {
                playButtonClickSound()
                void window.edge.installUpdate()
              }}
            />
          </div>
        </div>
      )
    }

    if (isDownloading) {
      return (
        <div className="setting-card update-promoted-card">
          <div className="shelf-card-top">
            <div className="update-header-row">
              <div className="update-group-label">
                <span className="update-dot checking" />
                <span>{t('behaviour.updateLabelDownloading') || 'DOWNLOADING UPDATE'}</span>
              </div>
              <button
                type="button"
                className="update-info-btn"
                title={t('header.whatsNew') || "What's New"}
                aria-label={t('header.whatsNew') || "What's New"}
                onClick={handleOpenChangelog}
              >
                <InfoIcon width={13} height={13} />
              </button>
            </div>
            <div className="setting-title">
              {updateInfo?.latestVersion
                ? t('behaviour.updateAvailableTitle', { version: updateInfo.latestVersion })
                : t('behaviour.downloadingUpdate')}
            </div>
            <div className="setting-desc">
              {downloadPercent > 0 ? t('behaviour.downloadingWithPercent', { percent: downloadPercent }) : t('behaviour.downloadingUpdate')}
            </div>
          </div>
          <div className="shelf-card-bottom">
            <div className="shelf-update-progress-wrap">
              <div className="shelf-progress-bar" style={{ width: `${downloadPercent}%` }} />
              <span className="shelf-progress-text">{downloadPercent > 0 ? `${downloadPercent}%` : 'Connecting...'}</span>
            </div>
          </div>
        </div>
      )
    }

    if (checkState.status === 'available' || hasBackgroundUpdate) {
      const versionStr = checkState.version || updateInfo?.latestVersion || ''
      return (
        <div className="setting-card update-promoted-card">
          <div className="shelf-card-top">
            <div className="update-header-row">
              <div className="update-group-label">
                <span className="update-dot" />
                <span>{t('behaviour.updateLabelAvailable') || 'NEW UPDATE AVAILABLE'}</span>
              </div>
              <button
                type="button"
                className="update-info-btn"
                title={t('header.whatsNew') || "What's New"}
                aria-label={t('header.whatsNew') || "What's New"}
                onClick={handleOpenChangelog}
              >
                <InfoIcon width={13} height={13} />
              </button>
            </div>
            <div className="setting-title">
              {t('behaviour.updateAvailableTitle', { version: versionStr })}
            </div>
            <div className="setting-desc">
              {t('behaviour.updateAvailableDesc')}
            </div>
          </div>
          <div className="shelf-card-bottom">
            <div className="update-action-row">
              <button
                type="button"
                className="update-action-btn primary"
                style={{ flex: 1 }}
                onClick={() => {
                  playButtonClickSound()
                  handleStartDownload()
                }}
              >
                {t('behaviour.update') || 'Update'}
              </button>
              <button
                type="button"
                className="update-action-btn secondary"
                style={{ flex: '0 0 68px' }}
                onClick={() => {
                  playButtonClickSound()
                  useStore.getState().dismissUpdate()
                }}
              >
                {t('behaviour.skip')}
              </button>
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  // ── Promoted Front Update Card Renderer (Horizontal Shelf Layout) ──────────
  const renderPromotedHorizontalUpdateCard = () => {
    if (isStoreBuild) return null
    if (!hasPromotedTopUpdate) return null

    if (updateDownloaded) {
      return (
        <div className="settings-shelf-card update-promoted-card behaviour-col">
          <div className="shelf-card-top">
            <div className="update-header-row">
              <div className="update-group-label">
                <span className="update-dot" />
                <span>{t('behaviour.updateLabelReady') || 'UPDATE READY'}</span>
              </div>
              <button
                type="button"
                className="update-info-btn"
                title={t('header.whatsNew') || "What's New"}
                aria-label={t('header.whatsNew') || "What's New"}
                onClick={handleOpenChangelog}
              >
                <InfoIcon width={13} height={13} />
              </button>
            </div>
            <div className="setting-title">
              {t('behaviour.updateReadyTitle', { version: updateDownloaded.version })}
            </div>
            <div className="setting-desc">
              {t('behaviour.updateReadyDesc')}
            </div>
          </div>
          <div className="shelf-card-bottom">
            <SlideCommit
              label={t('behaviour.restart') || 'Restart'}
              doneLabel={t('behaviour.restarting') || 'Restarting...'}
              errorLabel={t('behaviour.restartFailed') || 'Restart failed'}
              height={32}
              radius={10}
              onConfirm={() => {
                playButtonClickSound()
                void window.edge.installUpdate()
              }}
            />
          </div>
        </div>
      )
    }

    if (isDownloading) {
      return (
        <div className="settings-shelf-card update-promoted-card behaviour-col">
          <div className="shelf-card-top">
            <div className="update-header-row">
              <div className="update-group-label">
                <span className="update-dot checking" />
                <span>{t('behaviour.updateLabelDownloading') || 'DOWNLOADING UPDATE'}</span>
              </div>
              <button
                type="button"
                className="update-info-btn"
                title={t('header.whatsNew') || "What's New"}
                aria-label={t('header.whatsNew') || "What's New"}
                onClick={handleOpenChangelog}
              >
                <InfoIcon width={13} height={13} />
              </button>
            </div>
            <div className="setting-title">
              {updateInfo?.latestVersion
                ? t('behaviour.updateAvailableTitle', { version: updateInfo.latestVersion })
                : t('behaviour.downloadingUpdate')}
            </div>
            <div className="setting-desc">
              {downloadPercent > 0 ? t('behaviour.downloadingWithPercent', { percent: downloadPercent }) : t('behaviour.downloadingUpdate')}
            </div>
          </div>
          <div className="shelf-card-bottom">
            <div className="shelf-update-progress-wrap">
              <div className="shelf-progress-bar" style={{ width: `${downloadPercent}%` }} />
              <span className="shelf-progress-text">{downloadPercent > 0 ? `${downloadPercent}%` : 'Connecting...'}</span>
            </div>
          </div>
        </div>
      )
    }

    if (checkState.status === 'available' || hasBackgroundUpdate) {
      const versionStr = checkState.version || updateInfo?.latestVersion || ''
      return (
        <div className="settings-shelf-card update-promoted-card behaviour-col">
          <div className="shelf-card-top">
            <div className="update-header-row">
              <div className="update-group-label">
                <span className="update-dot" />
                <span>{t('behaviour.updateLabelAvailable') || 'NEW UPDATE AVAILABLE'}</span>
              </div>
              <button
                type="button"
                className="update-info-btn"
                title={t('header.whatsNew') || "What's New"}
                aria-label={t('header.whatsNew') || "What's New"}
                onClick={handleOpenChangelog}
              >
                <InfoIcon width={13} height={13} />
              </button>
            </div>
            <div className="setting-title">
              {t('behaviour.updateAvailableTitle', { version: versionStr })}
            </div>
            <div className="setting-desc">
              {t('behaviour.updateAvailableDesc')}
            </div>
          </div>
          <div className="shelf-card-bottom">
            <div className="update-action-row">
              <button
                type="button"
                className="update-action-btn primary"
                style={{ flex: 1 }}
                onClick={() => {
                  playButtonClickSound()
                  handleStartDownload()
                }}
              >
                {t('behaviour.update') || 'Update'}
              </button>
              <button
                type="button"
                className="update-action-btn secondary"
                style={{ flex: '0 0 68px' }}
                onClick={() => {
                  playButtonClickSound()
                  useStore.getState().dismissUpdate()
                }}
              >
                {t('behaviour.skip')}
              </button>
            </div>
          </div>
        </div>
      )
    }

    return null
  }

<<<<<<< HEAD
  // ── Manual update card renderer (idle/check states at the bottom) ──
  const renderManualUpdateCard = (withRef = false) => {
    if (!SHOW_UPDATE_SETTINGS) return null
    // Hidden while the promoted top card shows an actionable state — the
    // top card already carries Download/Skip/Restart/progress, so rendering
    // both would duplicate the prompt. The idle branch below IS the Check
    // button, which is exactly what belongs at the bottom.
=======
  // ── Update check: a row in the Updates group ─────────────────────────────
  // Hidden while the promoted top card shows an actionable state (it already
  // carries Download / Skip / Restart / progress).
  const renderUpdateCheckRow = (): RowSpec | null => {
>>>>>>> main
    if (isStoreBuild || hasPromotedTopUpdate) return null
    const status = checkState.status
    const buttonLabel =
      status === 'checking'
        ? t('behaviour.checkingForUpdates')
        : status === 'up-to-date'
          ? t('behaviour.checkAgain')
          : status === 'error'
            ? t('behaviour.tryAgain')
            : t('behaviour.checkForUpdates')
    const version = `${t('footer.version')} ${currentVersion || '0.3.1'}`
    // The title stays put; only the line under it reports the state.
    return {
      id: 'update-check',
      title: t('behaviour.checkForUpdates'),
      desc:
        status === 'checking'
          ? t('behaviour.checkingForUpdates')
          : status === 'up-to-date'
            ? (
                <>
                  {t('behaviour.isUpToDate')}
                  <br />
                  {version}
                </>
              )
            : status === 'error'
              ? (checkState.error || t('behaviour.updateCheckFailed'))
              : version,
      descError: status === 'error',
      trailing: (
        <button
          type="button"
          className={`set-row-icon-btn${status === 'checking' ? ' is-busy' : ''}`}
          title={buttonLabel}
          aria-label={buttonLabel}
          disabled={status === 'checking'}
          onClick={() => {
            playButtonClickSound()
            handleManualCheck()
          }}
        >
          <ArrowsClockwiseIcon width={14} height={14} />
        </button>
      )
    }
  }

  // ── Building blocks shared by both layouts ────────────────────────────────
  const pills = <T extends string | number>(
    options: { label: string; val: T }[],
    isActive: (val: T) => boolean,
    onPick: (val: T) => void
  ) => (
    <div className="setting-pills">
      {options.map((opt) => (
        <button
          key={String(opt.val)}
          type="button"
          className={`pill ${isActive(opt.val) ? 'active' : ''}`}
          onClick={() => {
            playButtonClickSound()
            onPick(opt.val)
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )

  const offsetIsHorizontal = settings.stickPosition === 'top'
  const offsetVal = offsetIsHorizontal ? (settings.horizontalOffset ?? 0.5) : (settings.verticalOffset ?? 0.5)
  const thicknessPx = settings.hotZoneWidth ?? 3
  const indicatorOn = settings.showCopyIndicator ?? true

  const placementPill = (edge: 'left' | 'top' | 'right', label: string) => (
    <button
      type="button"
      className={`pill ${(edgeTransition?.active ? edgeTransition.to === edge : settings.stickPosition === edge) ? 'active' : ''} ${edgeTransition?.active && edgeTransition.to === edge ? 'transitioning' : ''}`}
      disabled={edgeTransition?.active}
      onClick={() => {
        void startEdgeTransition(edge)
      }}
    >
      {label}
    </button>
  )

  const languageControl = isHorizontal ? (
    <button
      type="button"
      className={`language-shelf-btn language-toggle-btn ${languageFlyoutOpen ? 'flyout-open' : ''}`}
      onClick={(e) => {
        playButtonClickSound()
        const rect = e.currentTarget.getBoundingClientRect()
        setLanguageFlyoutOpen(!languageFlyoutOpen, rect)
      }}
    >
      <span className="language-shelf-label">
        <GlobeIcon width={13} height={13} />
        <span>{getLangLabel(selectedLang)}</span>
      </span>
      <motion.span
        animate={{ rotate: languageFlyoutOpen ? 180 : 0 }}
        transition={{ duration: 0.2 }}
        style={{ display: 'flex', alignItems: 'center', opacity: 0.65, flexShrink: 0, marginLeft: 6 }}
      >
        <ChevronDownIcon width={12} height={12} />
      </motion.span>
    </button>
  ) : (
    <LanguageDropdown />
  )

  /** Onboarding only: the four indicator styles inline, instead of the flyout. */
  const tutorialIndicatorGrid = isTutorial && localInlineOpen && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      style={{ overflow: 'hidden', marginTop: 10 }}
    >
      <div className="tutorial-indicator-grid">
        {([
          { id: 'logo', Icon: LogoIndicatorIcon, label: t('appearance.logoStyle') },
          { id: 'check', Icon: TickIndicatorIcon, label: t('appearance.tickStyle') },
          { id: 'copy', Icon: CopyIndicatorIcon, label: t('appearance.copyStyle') },
          { id: 'sparkle', Icon: SparkleIndicatorIcon, label: t('appearance.sparkleStyle') }
        ] as const).map(({ id, Icon, label }) => (
          <div
            key={id}
            className={`tutorial-indicator-option${(settings.copyIndicatorStyle || 'logo') === id ? ' active' : ''}`}
            onClick={() => {
              playButtonClickSound()
              patch({ copyIndicatorStyle: id })
            }}
          >
            <div className="tutorial-indicator-art">
              <Icon fillColor="#ffffff" size={30} />
            </div>
            <div className="tutorial-indicator-label">{label}</div>
          </div>
        ))}
      </div>
    </motion.div>
  )

  // ── Every setting, grouped by task ─────────────────────────────────────────
  // One definition for both layouts. A few rows only make sense on a side dock
  // (sliding along a vertical edge, the trigger's spot, panel height, text
  // size); the top dock leaves them out.
  const groupsFor = (tab: SettingsTab): GroupSpec[] => {
    if (tab === 'behaviour') {
      const updateCheck = renderUpdateCheckRow()
      return [
        {
          id: 'general',
          label: t('tabs.generalStartup') || 'GENERAL & STARTUP',
          rows: [
            {
              id: 'language',
              title: t('behaviour.languageTitle'),
              desc: isHorizontal ? (t('groups.languageSelectDesc') || 'Select application display language') : t('behaviour.languageDesc'),
              below: languageControl
            },
            {
              id: 'launch-at-login',
              title: t('behaviour.launchAtLoginTitle'),
              desc: t('behaviour.launchAtLoginDesc'),
              trailing: (
                <Toggle
                  checked={settings.launchAtLogin}
                  onChange={(v) => {
                    useStore.setState((s) => ({
                      settings: { ...s.settings, launchAtLogin: v }
                    }))
                    void patch({ launchAtLogin: v })
                  }}
                />
              )
            },
            {
              id: 'incognito',
              title: t('behaviour.incognitoTitle'),
              desc: t('behaviour.incognitoDesc'),
              trailing: <Toggle checked={settings.incognito} onChange={(v) => patch({ incognito: v })} />
            }
          ]
        },
        {
          id: 'opening',
          label: t('tabs.activationShortcuts') || 'SHORTCUTS & HOVER',
          rows: [
            {
              id: 'hover-activation',
              title: t('behaviour.hoverActivationTitle'),
              desc: hoverOn
                ? t('behaviour.hoverActivationDescOn')
                : t('behaviour.hoverActivationDescOff', { shortcut: settings.toggleHotkey || 'Alt+C' }),
              trailing: (
                <Toggle
                  checked={hoverOn}
                  onChange={(v) => {
                    if (!v) {
                      patch({ hoverActivation: false, suppressInFullscreen: false })
                    } else {
                      patch({ hoverActivation: true, suppressInFullscreen: true })
                    }
                  }}
                />
              )
            },
            {
              id: 'fullscreen',
              title: t('behaviour.fullscreenProtectionTitle'),
              desc: hoverOn ? t('behaviour.fullscreenProtectionDesc') : t('behaviour.disabledHoverOff'),
              disabled: !hoverOn,
              trailing: (
                <Toggle
                  checked={hoverOn ? settings.suppressInFullscreen : false}
                  onChange={(v) => hoverOn && patch({ suppressInFullscreen: v })}
                  disabled={!hoverOn}
                />
              )
            },
            {
              id: 'hover-delay',
              title: t('behaviour.hoverDelayTitle') || 'Open Delay',
              desc: hoverOn ? (t('behaviour.hoverDelayDesc') || 'Wait this long at the edge before the shelf slides open') : t('behaviour.disabledHoverOff'),
              disabled: !hoverOn,
              trailing: <span className="set-row-badge">{formatHoverDelay(hoverDelay)}</span>,
              below: renderHoverDelayControl(),
              size: 'slider'
            },
            {
              id: 'shortcut',
              title: t('behaviour.toggleHotkeyTitle'),
              desc: isHorizontal ? (t('groups.toggleHotkeyPressDesc') || t('behaviour.toggleHotkeyDesc')) : t('behaviour.toggleHotkeyDesc'),
              below: (
                <HotkeyRecorder
                  hotkey={settings.toggleHotkey || 'Alt+C'}
                  onChange={(nextHotkey) => {
                    patch({ toggleHotkey: nextHotkey })
                    pushToast({
                      id: Date.now().toString(),
                      message: t('toast.shortcutUpdated', { shortcut: nextHotkey }),
                      tone: 'info'
                    })
                  }}
                />
              )
            }
          ]
        },
        {
          id: 'clipboard',
          label: t('tabs.clipboardRules') || 'CLIPBOARD RULES',
          rows: [
            {
              id: 'move-to-top',
              title: t('behaviour.movePastedToTopTitle'),
              desc: t('behaviour.movePastedToTopDesc'),
              trailing: <Toggle checked={settings.movePastedToTop ?? true} onChange={(v) => patch({ movePastedToTop: v })} />
            },
            {
              id: 'clear-on-restart',
              title: t('behaviour.clearUnpinnedTitle'),
              desc: t('behaviour.clearUnpinnedDesc'),
              trailing: <Toggle checked={settings.clearUnpinnedOnRestart} onChange={(v) => patch({ clearUnpinnedOnRestart: v })} />
            },
            {
              id: 'capacity',
              title: t('behaviour.capacityTitle'),
              desc: t('behaviour.capacityDesc'),
              below: pills(
                [{ label: '100', val: 100 }, { label: '250', val: 250 }, { label: '500', val: 500 }, { label: '1000', val: 1000 }],
                (v) => settings.historyLimit === v,
                (v) => patch({ historyLimit: v })
              )
            },
            {
              id: 'auto-delete',
              title: t('behaviour.autoDeleteTitle'),
              desc: t('behaviour.autoDeleteDesc'),
              below: pills(
                [
                  { label: t('behaviour.never'), val: 0 },
                  { label: '1h', val: 1 },
                  { label: '6h', val: 6 },
                  { label: '24h', val: 24 },
                  { label: '7d', val: 168 }
                ],
                (v) => settings.autoDeleteHours === v,
                (v) => patch({ autoDeleteHours: v })
              )
            }
          ]
        },
        ...(!isStoreBuild ? [{
          id: 'updates',
          label: t('tabs.updates') || 'UPDATES',
          rows: [
            {
              id: 'update-mode',
              title: t('behaviour.autoUpdatesTitle'),
              desc:
                updateMode === 'auto'
                  ? t('behaviour.autoUpdatesDescOn')
                  : updateMode === 'notify'
                    ? (t('behaviour.updateModeNotifyDesc') || 'Notify when updates are available without downloading')
                    : t('behaviour.autoUpdatesDescOff'),
              below: pills<UpdateMode>(
                [
                  { label: t('behaviour.updateModeAuto') || 'Automatic', val: 'auto' },
                  { label: t('behaviour.updateModeNotify') || 'Notify me', val: 'notify' },
                  { label: t('behaviour.updateModeOff') || 'Off', val: 'off' }
                ],
                (v) => updateMode === v,
                (v) => patch({ updateMode: v })
              )
            },
            ...(updateCheck ? [updateCheck] : [])
          ]
        } satisfies GroupSpec] : [])
      ]
    }

    if (tab === 'position') {
      return [
        {
          id: 'position',
          label: t('tabs.position') || 'POSITION',
          rows: [
            {
              id: 'placement',
              title: t('position.edgePlacementTitle'),
              desc: t('position.edgePlacementDesc'),
              below: (
                <div className={`placement-3way-wrap${isHorizontal ? ' shelf-placement-3way' : ''}`}>
                  {placementPill('left', t('position.left') || 'Left')}
                  {placementPill('top', t('position.top') || 'Top')}
                  {placementPill('right', t('position.right') || 'Right')}
                </div>
              )
            },
            ...(!isHorizontal ? [{
              id: 'offset',
              title: offsetIsHorizontal ? (t('position.horizontalPositionTitle') || 'Horizontal Position') : t('position.verticalPositionTitle'),
              desc: offsetIsHorizontal ? (t('position.horizontalPositionDesc') || 'Adjust horizontal alignment along screen edge') : t('position.verticalPositionDesc'),
              trailing: <span className="set-row-badge">{`${Math.round(offsetVal * 100)}%`}</span>,
              size: 'slider',
              below: (
                <div className="setting-slider-wrap">
                  <WakeSlider
                    ariaLabel={offsetIsHorizontal ? (t('position.horizontalPositionTitle') || 'Horizontal Position') : t('position.verticalPositionTitle')}
                    min={0}
                    max={1}
                    step={0.01}
                    bars={28}
                    height={28}
                    restHeight={8}
                    gap={3}
                    value={offsetVal}
                    onStart={() => {
                      void window.edge.setInteractive(true)
                      setSliderActive(true)
                    }}
                    onRelease={(val) => {
                      setSliderActive(false)
                      if (offsetIsHorizontal) {
                        patch({ horizontalOffset: val })
                      } else {
                        handleSliderRelease(val)
                      }
                    }}
                    onChange={(raw) => {
                      if (offsetIsHorizontal) {
                        patch({ horizontalOffset: raw })
                      } else {
                        handleSliderInput(raw)
                      }
                    }}
                  />
                  <div className="setting-slider-labels">
                    {[
                      { label: offsetIsHorizontal ? 'Left' : '0%', val: 0 },
                      { label: 'Center', val: 0.5 },
                      { label: offsetIsHorizontal ? 'Right' : '100%', val: 1.0 }
                    ].map((pos) => {
                      const active = Math.abs(offsetVal - pos.val) < 0.04
                      return (
                        <button
                          key={pos.val}
                          type="button"
                          className={`slider-label-btn${active ? ' active' : ''}`}
                          onClick={() => {
                            playDialTickSound()
                            if (offsetIsHorizontal) {
                              patch({ horizontalOffset: pos.val })
                            } else {
                              handleSliderRelease(pos.val)
                            }
                          }}
                        >
                          {pos.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            } satisfies RowSpec] : []),
            ...(!isHorizontal ? [{
              id: 'panel-height',
              title: t('position.panelHeightTitle'),
              desc: t('position.panelHeightDesc'),
              below: pills(
                [
                  { label: t('appearance.small'), val: 0.5 },
                  { label: t('position.medium'), val: 0.65 },
                  { label: t('appearance.large'), val: 0.8 }
                ],
                (v) => Math.abs((settings.panelHeight || 0.6) - v) < 0.08,
                (v) => patch({ panelHeight: v })
              )
            } satisfies RowSpec] : []),
            {
              id: 'display',
              title: t('position.displayTitle'),
              desc: t('position.displayDesc'),
              below: (
                <div className="setting-pills">
                  {displays.length === 0 && <div className="pill disabled">{t('position.loadingDisplays')}</div>}
                  {displays.map((d) => {
                    const currentDisplay = displays.find((disp) => disp.isCurrent)
                    const activeDisplayId = currentDisplay
                      ? currentDisplay.id
                      : (settings.stickDisplayId ?? displays.find((disp) => disp.isPrimary)?.id ?? displays[0]?.id)
                    const isActive = activeDisplayId === d.id
                    const displayName = d.isPrimary ? t('position.primaryDisplay') : d.name
                    return (
                      <button
                        key={d.id}
                        type="button"
                        className={`pill display-pill ${isActive ? 'active' : ''}`}
                        onClick={() => {
                          playButtonClickSound()
                          patch({ stickDisplayId: d.id })
                          useStore.getState().notifyPositionChanged()
                        }}
                      >
                        <div className="pill-name">{displayName}</div>
                        <div className="pill-res">{d.resolution}</div>
                      </button>
                    )
                  })}
                </div>
              )
            }
          ]
        },
        {
          id: 'trigger-zone',
          label: t('position.triggerZone') || 'TRIGGER ZONE',
          rows: [
            {
              id: 'location-hint',
              title: t('position.edgeLocationHintTitle'),
              desc: isHorizontal ? (t('groups.edgeHintPulseDesc') || t('position.edgeLocationHintDesc')) : t('position.edgeLocationHintDesc'),
              trailing: <Toggle checked={settings.showEdgeLocationHint ?? false} onChange={(v) => patch({ showEdgeLocationHint: v })} />
            },
            ...(!isHorizontal ? [{
              id: 'trigger-position',
              title: t('position.edgeTriggerPositionTitle'),
              desc: t('position.edgeTriggerPositionDesc'),
              below: pills<'top' | 'center' | 'bottom'>(
                [
                  { label: offsetIsHorizontal ? (t('position.left') || 'Left') : t('position.top'), val: 'top' },
                  { label: t('position.center'), val: 'center' },
                  { label: offsetIsHorizontal ? (t('position.right') || 'Right') : t('position.bottom'), val: 'bottom' }
                ],
                (v) => (settings.triggerAlignment || 'center') === v,
                (v) => {
                  patch({ triggerAlignment: v })
                  useStore.getState().notifyPositionChanged()
                }
              )
            } satisfies RowSpec] : []),
            {
              id: 'hover-area',
              title: t('position.hoverAreaSizeTitle'),
              desc: t('position.hoverAreaSizeDesc'),
              below: pills(
                [
                  { label: t('appearance.small'), val: 0.25 },
                  { label: t('position.medium'), val: 0.4 },
                  { label: t('appearance.large'), val: 0.6 }
                ],
                (v) => Math.abs(settings.hotZoneHeight - v) < 0.08,
                (v) => patch({ hotZoneHeight: v })
              )
            },
            {
              id: 'trigger-thickness',
              title: t('position.edgeTriggerThicknessTitle'),
              desc: t('position.edgeTriggerThicknessDesc'),
              trailing: <span className="set-row-badge">{`${thicknessPx}px`}</span>,
              size: 'slider',
              below: (
                <div className="setting-slider-wrap">
                  <WakeSlider
                    ariaLabel={t('position.edgeTriggerThicknessTitle')}
                    min={1}
                    max={7}
                    step={1}
                    bars={28}
                    height={isHorizontal ? 22 : 28}
                    restHeight={isHorizontal ? 6 : 8}
                    gap={3}
                    value={thicknessPx}
                    onStart={() => {
                      void window.edge.setInteractive(true)
                      setSliderActive(true)
                    }}
                    onRelease={(val) => {
                      handleThicknessRelease(val)
                    }}
                    onChange={(val) => {
                      handleThicknessInput(val)
                    }}
                  />
                  <div className="setting-slider-labels">
                    {[
                      { label: 'Min', val: 1 },
                      { label: 'Mid', val: 4 },
                      { label: 'Max', val: 7 }
                    ].map((preset) => (
                      <button
                        key={preset.val}
                        type="button"
                        className={`slider-label-btn${thicknessPx === preset.val ? ' active' : ''}`}
                        onClick={() => {
                          if (thicknessPx !== preset.val) {
                            playDialTickSound()
                            handleThicknessRelease(preset.val)
                          }
                        }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              )
            }
          ]
        }
      ]
    }

    // appearance
    return [
      {
        id: 'copy-indicator',
        label: t('appearance.copyIndicatorTitle') || 'COPY INDICATOR',
        rows: [
          {
            id: 'copy-indicator',
            title: t('appearance.copyIndicatorTitle'),
            desc: t('appearance.copyIndicatorDesc'),
            trailing: <Toggle checked={indicatorOn} onChange={(v) => patch({ showCopyIndicator: v })} />
          },
          ...(indicatorOn ? [{
            id: 'indicator-style',
            title: t('appearance.indicatorStyleTitle'),
            desc: t('appearance.indicatorStyleDesc'),
            trailing: (
              <button
                type="button"
                className={`icon-btn style-preview-toggle-btn ${isFlyoutActive ? 'active' : ''}`}
                title={isFlyoutActive ? t('appearance.closeStyleSelector') : t('appearance.openStyleSelector')}
                onClick={(e) => {
                  playButtonClickSound()
                  handleToggleFlyout(e.currentTarget)
                }}
              >
                {isFlyoutActive ? <CloseIcon /> : <ChevronRightIcon />}
              </button>
            ),
            extra: tutorialIndicatorGrid
          } satisfies RowSpec] : [])
        ]
      },
      ...(!isHorizontal ? [{
        id: 'typography',
        label: t('appearance.typography') || 'TYPOGRAPHY',
        rows: [
          {
            id: 'text-size',
            title: t('appearance.textSizeTitle'),
            desc: t('appearance.textSizeDesc'),
            below: pills(
              [
                { label: t('appearance.small'), val: 0.85 },
                { label: t('appearance.normal'), val: 1.0 },
                { label: t('appearance.large'), val: 1.15 }
              ],
              (v) => Math.abs((settings.fontSizeScale ?? 1.0) - v) < 0.05,
              (v) => patch({ fontSizeScale: v })
            )
          }
        ]
      } satisfies GroupSpec] : []),
      {
        id: 'audio',
        label: t('appearance.audioAndFeedback') || 'AUDIO FEEDBACK',
        rows: [
          {
            id: 'sound',
            title: t('behaviour.soundEffectsTitle'),
            desc: t('behaviour.soundEffectsDesc'),
            trailing: (
              <Toggle
                checked={settings.soundEffects ?? true}
                onChange={(v) => {
                  if (v) playToggleSound(true)
                  patch({ soundEffects: v })
                }}
              />
            )
          }
        ]
      }
    ]
  }

  const layout: 'v' | 'h' = isHorizontal ? 'h' : 'v'
  const renderGroups = (tab: SettingsTab) =>
    groupsFor(tab).map((group) => <SettingGroup key={group.id} group={group} layout={layout} />)

  // ── Horizontal Layout (Top Dock) ──────────────────────────────────────────
  if (isHorizontal) {
    const handleShelfWheel = (e: React.WheelEvent<HTMLDivElement>) => {
      if (e.deltaY !== 0) {
        e.currentTarget.scrollLeft += e.deltaY
      }
    }

    const handleShelfScroll = (e: React.UIEvent<HTMLDivElement>) => {
      if (isSwitchingTabRef.current) return
      if (styleFlyoutOpen) {
        setStyleFlyoutOpen(false)
      }
      if (languageFlyoutOpen) {
        setLanguageFlyoutOpen(false)
      }
      horizontalTabScrollPositions.current[horizontalTab] = e.currentTarget.scrollLeft
    }

<<<<<<< HEAD
    const renderHorizontalCommunityCard = () => {
      if (!SHOW_COMMUNITY_SUPPORT) return null
      return (
      <div className="settings-shelf-card support-card">
        <div className="shelf-card-top">
          <div className="setting-group-label">{t('footer.communityAndSupport') || 'COMMUNITY & SUPPORT'}</div>
          <div className="setting-title">{t('footer.communityAndSupport')}</div>
          <div className="setting-desc">{t('footer.supportTagline') || '100% free & open-source clipboard'}</div>
        </div>
        <div className="shelf-card-bottom">
          <button
            type="button"
            className="shelf-kofi-btn"
            onClick={() => {
              playButtonClickSound()
              window.open('https://www.edgedrop.app/supportedgedrop', '_blank')
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#ff4757" stroke="none" style={{ flexShrink: 0 }}>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span>{t('footer.supportOnKofi')}</span>
          </button>
          {isStoreBuild ? (
            <button
              type="button"
              className="shelf-github-btn"
              onClick={() => {
                playButtonClickSound()
                window.open('ms-windows-store://review/?ProductId=9P3JMHN9M4NR', '_blank')
              }}
            >
              <MicrosoftStoreLogo width={13} height={13} className="store-logo-icon" />
              <span>{t('footer.reviewOnStore')}</span>
            </button>
          ) : (
            <button
              type="button"
              className="shelf-github-btn"
              onClick={() => {
                playButtonClickSound()
                window.open('https://github.com/Deepender25/Edge-Drop', '_blank')
              }}
            >
              <GithubOctocatLogo width={13} height={13} className="github-octocat-icon" />
              <span>{t('footer.starOnGithub')}</span>
              <StarIcon width={12} height={12} className="star-icon" fill="#fbbf24" stroke="#fbbf24" style={{ marginLeft: 2 }} />
            </button>
          )}
        </div>
      </div>
      )
    }

    const renderHorizontalAboutCard = () => (
      <div className="settings-shelf-card about-card">
        <div className="shelf-card-top">
          <div className="setting-group-label">{t('groups.aboutEdgeDrop') || 'ABOUT EDGE-DROP'}</div>
          <div className="setting-title">Edge-Drop v{currentVersion || '0.3.2'}</div>
          <div className="setting-desc">{t('footer.feedbackDesc')}</div>
        </div>
        <div className="shelf-card-bottom">
          <button
            type="button"
            className="pill display-pill"
            style={{ width: '100%', justifyContent: 'center', height: 30, fontSize: 11.5, fontWeight: 550, borderRadius: 999 }}
            onClick={() => {
              playButtonClickSound()
              window.open('https://github.com/Deepender25/Edge-Drop/issues/new/choose', '_blank')
            }}
          >
            {t('footer.submitFeedback')}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 2 }}>
            <button
              type="button"
              className="version-changelog-link"
              style={{ fontSize: 11 }}
              onClick={() => {
                playButtonClickSound()
                if (currentVersion) patch({ lastSeenChangelogVersion: currentVersion })
                window.open('https://www.edgedrop.app/changelog', '_blank')
              }}
            >
              {t('header.whatsNew')} ↗
            </button>
            <button
              type="button"
              className="shelf-quit-btn"
              onClick={() => {
                playButtonClickSound()
                void window.edge.quitApp()
              }}
            >
              <LogOutIcon width={11} height={11} />
              <span>{t('tray.quit')}</span>
            </button>
          </div>
        </div>
      </div>
    )

=======
>>>>>>> main
    return (
      <div className="settings-horizontal-shelf">
        <div
          className="settings-shelf-track tab-view"
          ref={shelfTrackRef}
          onWheel={handleShelfWheel}
          onScroll={handleShelfScroll}
        >
<<<<<<< HEAD
          {/* ── TAB 1: BEHAVIOUR ── */}
          {horizontalTab === 'behaviour' && (
            <>
              {renderPromotedHorizontalUpdateCard()}

              {/* ── SUB-GROUP 1 DIVIDER: General & Startup ── */}
              <div className="shelf-section-divider">
                <span className="shelf-section-divider-text">{t('tabs.generalStartup') || 'GENERAL & STARTUP'}</span>
              </div>

              {/* Card 1: Language */}
              <div className="settings-shelf-card shortcuts-card behaviour-col">
                <div className="shelf-card-top">
                  <div className="setting-group-label">{t('groups.general') || 'GENERAL'}</div>
                  <div className="setting-title">{t('behaviour.languageTitle')}</div>
                  <div className="setting-desc">{t('groups.languageSelectDesc') || 'Select application display language'}</div>
                </div>
                <div className="shelf-card-bottom">
                  <button
                    type="button"
                    className={`language-shelf-btn language-toggle-btn ${languageFlyoutOpen ? 'flyout-open' : ''}`}
                    onClick={(e) => {
                      playButtonClickSound()
                      const rect = e.currentTarget.getBoundingClientRect()
                      setLanguageFlyoutOpen(!languageFlyoutOpen, rect)
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0, overflow: 'hidden' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.65, flexShrink: 0 }}>
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="2" y1="12" x2="22" y2="12"/>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                      </svg>
                      <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {getLangLabel(selectedLang)}
                      </span>
                    </div>
                    <motion.span
                      animate={{ rotate: languageFlyoutOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ display: 'flex', alignItems: 'center', opacity: 0.65, flexShrink: 0, marginLeft: 6 }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    </motion.span>
                  </button>
                </div>
              </div>

              {/* Card 2: Launch at Login */}
              {SHOW_LOGIN_AT_STARTUP_SETTING && (
              <div className="settings-shelf-card system-card behaviour-col">
                <div className="shelf-card-top">
                  <div className="setting-group-label">{t('groups.startup') || 'STARTUP'}</div>
                </div>
                <div className="shelf-card-inline">
                  <div className="shelf-card-inline-text">
                    <div className="setting-title">{t('behaviour.launchAtLoginTitle')}</div>
                    <div className="setting-desc">{t('behaviour.launchAtLoginDesc')}</div>
                  </div>
                  <div className="shelf-card-inline-action">
                    <Toggle
                      checked={settings.launchAtLogin}
                      onChange={(v) => {
                        useStore.setState((s) => ({
                          settings: { ...s.settings, launchAtLogin: v }
                        }))
                        void patch({ launchAtLogin: v })
                      }}
                    />
                  </div>
                </div>
              </div>
              )}

              {/* Card 3: Incognito Mode */}
              <div className="settings-shelf-card incognito-card behaviour-col">
                <div className="shelf-card-top">
                  <div className="setting-group-label">{t('groups.privacy') || 'PRIVACY'}</div>
                </div>
                <div className="shelf-card-inline">
                  <div className="shelf-card-inline-text">
                    <div className="setting-title">{t('behaviour.incognitoTitle')}</div>
                    <div className="setting-desc">{t('behaviour.incognitoDesc')}</div>
                  </div>
                  <div className="shelf-card-inline-action">
                    <Toggle
                      checked={settings.incognito}
                      onChange={(v) => patch({ incognito: v })}
                    />
                  </div>
                </div>
              </div>

              {/* ── SUB-GROUP 2 DIVIDER: Shortcuts & Hover ── */}
              <div className="shelf-section-divider">
                <span className="shelf-section-divider-text">{t('tabs.activationShortcuts') || 'SHORTCUTS & HOVER'}</span>
              </div>

              {/* Card 4: Hover Activation */}
              <div className="settings-shelf-card hover-card behaviour-col">
                <div className="shelf-card-top">
                  <div className="setting-group-label">{t('groups.hoverActivation') || 'HOVER ACTIVATION'}</div>
                </div>
                <div className="shelf-card-inline">
                  <div className="shelf-card-inline-text">
                    <div className="setting-title">{t('behaviour.hoverActivationTitle')}</div>
                    <div className="setting-desc">
                      {(settings.hoverActivation ?? true)
                        ? t('behaviour.hoverActivationDescOn')
                        : t('behaviour.hoverActivationDescOff', { shortcut: settings.toggleHotkey || 'Alt+C' })}
                    </div>
                  </div>
                  <div className="shelf-card-inline-action">
                    <Toggle
                      checked={settings.hoverActivation ?? true}
                      onChange={(v) => {
                        if (!v) {
                          patch({ hoverActivation: false, suppressInFullscreen: false })
                        } else {
                          patch({ hoverActivation: true, suppressInFullscreen: true })
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Card 5: Global Toggle Shortcut */}
              <div className="settings-shelf-card hotkey-card behaviour-col">
                <div className="shelf-card-top">
                  <div className="setting-group-label">{t('groups.keyboardShortcut') || 'KEYBOARD SHORTCUT'}</div>
                  <div className="setting-title">{t('behaviour.toggleHotkeyTitle')}</div>
                  <div className="setting-desc">{t('groups.toggleHotkeyPressDesc') || 'Press anywhere to toggle Edge-Drop'}</div>
                </div>
                <div className="shelf-card-bottom">
                  <HotkeyRecorder
                    hotkey={settings.toggleHotkey || 'Alt+C'}
                    onChange={(nextHotkey) => {
                      patch({ toggleHotkey: nextHotkey })
                      pushToast({
                        id: Date.now().toString(),
                        message: t('toast.shortcutUpdated', { shortcut: nextHotkey }),
                        tone: 'info'
                      })
                    }}
                  />
                </div>
              </div>

              {/* Card 6: Fullscreen Protection */}
              <div className="settings-shelf-card fullscreen-card behaviour-col">
                <div className="shelf-card-top">
                  <div className="setting-group-label">{t('groups.fullscreenProtection') || 'FULLSCREEN PROTECTION'}</div>
                </div>
                <div className="shelf-card-inline" style={{ opacity: (settings.hoverActivation ?? true) ? 1 : 0.45 }}>
                  <div className="shelf-card-inline-text">
                    <div className="setting-title">{t('behaviour.fullscreenProtectionTitle')}</div>
                    <div className="setting-desc">
                      {(settings.hoverActivation ?? true)
                        ? t('behaviour.fullscreenProtectionDesc')
                        : t('behaviour.disabledHoverOff')}
                    </div>
                  </div>
                  <div className="shelf-card-inline-action">
                    <Toggle
                      checked={(settings.hoverActivation ?? true) ? settings.suppressInFullscreen : false}
                      onChange={(v) => (settings.hoverActivation ?? true) && patch({ suppressInFullscreen: v })}
                      disabled={!(settings.hoverActivation ?? true)}
                    />
                  </div>
                </div>
              </div>

              {/* ── SUB-GROUP 3 DIVIDER: Clipboard Rules ── */}
              <div className="shelf-section-divider">
                <span className="shelf-section-divider-text">{t('tabs.clipboardRules') || 'CLIPBOARD RULES'}</span>
              </div>

              {/* Card 7: Move Pasted to Top */}
              <div className="settings-shelf-card order-card behaviour-col">
                <div className="shelf-card-top">
                  <div className="setting-group-label">{t('groups.clipboardBehaviour') || 'CLIPBOARD BEHAVIOUR'}</div>
                </div>
                <div className="shelf-card-inline">
                  <div className="shelf-card-inline-text">
                    <div className="setting-title">{t('behaviour.movePastedToTopTitle')}</div>
                    <div className="setting-desc">{t('behaviour.movePastedToTopDesc')}</div>
                  </div>
                  <div className="shelf-card-inline-action">
                    <Toggle
                      checked={settings.movePastedToTop ?? true}
                      onChange={(v) => patch({ movePastedToTop: v })}
                    />
                  </div>
                </div>
              </div>

              {/* Card 8: Clear Unpinned on Restart */}
              <div className="settings-shelf-card rules-card behaviour-col">
                <div className="shelf-card-top">
                  <div className="setting-group-label">{t('groups.restartCleanup') || 'RESTART CLEANUP'}</div>
                </div>
                <div className="shelf-card-inline">
                  <div className="shelf-card-inline-text">
                    <div className="setting-title">{t('behaviour.clearUnpinnedTitle')}</div>
                    <div className="setting-desc">{t('behaviour.clearUnpinnedDesc')}</div>
                  </div>
                  <div className="shelf-card-inline-action">
                    <Toggle
                      checked={settings.clearUnpinnedOnRestart}
                      onChange={(v) => patch({ clearUnpinnedOnRestart: v })}
                    />
                  </div>
                </div>
              </div>

              {/* ── SUB-GROUP 4 DIVIDER: Storage & Retention ── */}
              <div className="shelf-section-divider">
                <span className="shelf-section-divider-text">{t('tabs.storageRetention') || 'STORAGE & RETENTION'}</span>
              </div>

              {/* Card 9: History Capacity */}
              <div className="settings-shelf-card storage-card behaviour-col">
                <div className="shelf-card-top">
                  <div className="setting-group-label">{t('groups.storageCapacity') || 'STORAGE CAPACITY'}</div>
                  <div className="setting-title">{t('behaviour.capacityTitle')}</div>
                  <div className="setting-desc">{t('behaviour.capacityDesc')}</div>
                </div>
                <div className="shelf-card-bottom">
                  <div className="setting-pills" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5 }}>
                    {[
                      { label: '100', val: 100 },
                      { label: '250', val: 250 },
                      { label: '500', val: 500 },
                      { label: '1000', val: 1000 }
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        className={`pill ${settings.historyLimit === opt.val ? 'active' : ''}`}
                        style={{ height: 32, fontSize: 11.5, fontWeight: 500, padding: 0 }}
                        onClick={() => { playButtonClickSound(); patch({ historyLimit: opt.val }) }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 10: Auto-Delete Timer */}
              <div className="settings-shelf-card autodelete-card behaviour-col">
                <div className="shelf-card-top">
                  <div className="setting-group-label">{t('groups.autoDelete') || 'AUTO-DELETE'}</div>
                  <div className="setting-title">{t('behaviour.autoDeleteTitle')}</div>
                  <div className="setting-desc">{t('behaviour.autoDeleteDesc')}</div>
                </div>
                <div className="shelf-card-bottom">
                  <div className="setting-pills" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
                    {[
                      { label: t('behaviour.never'), val: 0 },
                      { label: '1h', val: 1 },
                      { label: '6h', val: 6 },
                      { label: '24h', val: 24 },
                      { label: '7d', val: 168 }
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        className={`pill ${settings.autoDeleteHours === opt.val ? 'active' : ''}`}
                        style={{ height: 32, fontSize: 11, fontWeight: 500, padding: 0 }}
                        onClick={() => { playButtonClickSound(); patch({ autoDeleteHours: opt.val }) }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── SUB-GROUP 5 DIVIDER: Updates ── */}
              {SHOW_UPDATE_SETTINGS && !isStoreBuild && (
                <div className="shelf-section-divider">
                  <span className="shelf-section-divider-text">{t('tabs.updates') || 'UPDATES'}</span>
                </div>
              )}

              {/* Card 11: Application Updates (3-mode selector) */}
              {SHOW_UPDATE_SETTINGS && (
              <div className="settings-shelf-card updates-card behaviour-col">
                <div className="shelf-card-top">
                  <div className="setting-group-label">{t('groups.updates') || 'UPDATES'}</div>
                  <div className="setting-title">{t('behaviour.autoUpdatesTitle')}</div>
                  <div className="setting-desc">
                    {!isStoreBuild
                      ? (updateMode === 'auto'
                        ? t('behaviour.autoUpdatesDescOn')
                        : updateMode === 'notify'
                        ? (t('behaviour.updateModeNotifyDesc') || 'Notify when updates are available without downloading')
                        : t('behaviour.autoUpdatesDescOff'))
                      : 'Managed by Microsoft Store'}
                  </div>
                </div>
                {!isStoreBuild && (
                  <div className="shelf-card-bottom">
                    <div className="setting-pills" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5, width: '100%' }}>
                      {([
                        { id: 'auto' as UpdateMode, label: t('behaviour.updateModeAuto') || 'Automatic' },
                        { id: 'notify' as UpdateMode, label: t('behaviour.updateModeNotify') || 'Notify me' },
                        { id: 'off' as UpdateMode, label: t('behaviour.updateModeOff') || 'Off' }
                      ]).map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          className={`pill ${updateMode === opt.id ? 'active' : ''}`}
                          style={{ height: 32, fontSize: 11, fontWeight: 500, padding: '0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', justifyContent: 'center' }}
                          onClick={() => { playButtonClickSound(); patch({ updateMode: opt.id }) }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              )}

              {/* Card 12: Update Status & Actions (idle/check states; hidden
                  while the promoted front card shows an actionable state) */}
              {SHOW_UPDATE_SETTINGS && !isStoreBuild && !hasPromotedTopUpdate && (
                <div className="settings-shelf-card check-updates-card behaviour-col" ref={updateBannerRef}>
                  <div className="shelf-card-top">
                    <div className="setting-group-label">
                      UPDATE STATUS
                    </div>
                    <div className="setting-title" style={{ lineHeight: 1.3 }}>
                      {checkState.status === 'checking'
                        ? t('behaviour.checkingForUpdates')
                        : checkState.status === 'up-to-date'
                        ? t('behaviour.isUpToDate')
                        : checkState.status === 'error'
                        ? t('behaviour.updateCheckFailed')
                        : t('behaviour.checkForUpdates')}
                    </div>
                    <div className="setting-desc">
                      {checkState.status === 'error'
                        ? (checkState.error || t('behaviour.updateCheckFailed'))
                        : `Edge-Drop v${currentVersion || '0.3.1'}`}
                    </div>
                  </div>
                  <div className="shelf-card-bottom">
                    <button
                      type="button"
                      className="pill display-pill"
                      style={{ width: '100%', justifyContent: 'center', fontSize: 11.5, height: 32 }}
                      disabled={checkState.status === 'checking'}
                      onClick={() => {
                        playButtonClickSound()
                        handleManualCheck()
                      }}
                    >
                      {checkState.status === 'checking' ? (
                        <>
                          <span className="update-dot checking" style={{ marginRight: 6 }} />
                          <span>{t('behaviour.checkingForUpdates')}</span>
                        </>
                      ) : checkState.status === 'up-to-date' ? (
                        t('behaviour.checkAgain')
                      ) : checkState.status === 'error' ? (
                        t('behaviour.tryAgain')
                      ) : (
                        t('behaviour.checkForUpdates')
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* ── SUB-GROUP 6 DIVIDER: Community & Support ── */}
              {SHOW_COMMUNITY_SUPPORT && <div className="shelf-section-divider">
                <span className="shelf-section-divider-text">{t('footer.communityAndSupport') || 'COMMUNITY & SUPPORT'}</span>
              </div>}

              {/* Card 13: Community & Feedback */}
              {renderHorizontalCommunityCard()}

              {/* Card 14: About & Quit */}
              {renderHorizontalAboutCard()}
            </>
          )}

          {/* ── TAB 2: POSITION ── */}
          {horizontalTab === 'position' && (
            <>
              {/* ── SUB-GROUP 1 DIVIDER: Position ── */}
              <div className="shelf-section-divider">
                <span className="shelf-section-divider-text">{t('tabs.position') || 'POSITION'}</span>
              </div>

              {/* Card 1: Edge Placement */}
              <div className="settings-shelf-card placement-card position-col">
                <div className="shelf-card-top">
                  <div className="setting-group-label">{t('groups.placement') || 'PLACEMENT'}</div>
                  <div className="setting-title" style={{ color: 'var(--text-primary)' }}>{t('position.edgePlacementTitle')}</div>
                  <div className="setting-desc">{t('position.edgePlacementDesc')}</div>
                </div>
                <div className="shelf-card-bottom">
                  <div className="placement-3way-wrap shelf-placement-3way">
                    <button
                      type="button"
                      className={`pill ${(edgeTransition?.active ? edgeTransition.to === 'left' : settings.stickPosition === 'left') ? 'active' : ''} ${edgeTransition?.active && edgeTransition.to === 'left' ? 'transitioning' : ''}`}
                      disabled={edgeTransition?.active}
                      onClick={() => {
                        void startEdgeTransition('left')
                      }}
                    >
                      {t('position.leftEdge') || 'Left Edge'}
                    </button>
                    <button
                      type="button"
                      className={`pill ${(edgeTransition?.active ? edgeTransition.to === 'top' : settings.stickPosition === 'top') ? 'active' : ''} ${edgeTransition?.active && edgeTransition.to === 'top' ? 'transitioning' : ''}`}
                      disabled={edgeTransition?.active}
                      onClick={() => {
                        void startEdgeTransition('top')
                      }}
                    >
                      {t('position.topEdge') || 'Top Edge'}
                    </button>
                    <button
                      type="button"
                      className={`pill ${(edgeTransition?.active ? edgeTransition.to === 'right' : settings.stickPosition === 'right') ? 'active' : ''} ${edgeTransition?.active && edgeTransition.to === 'right' ? 'transitioning' : ''}`}
                      disabled={edgeTransition?.active}
                      onClick={() => {
                        void startEdgeTransition('right')
                      }}
                    >
                      {t('position.rightEdge') || 'Right Edge'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 2: Target Display */}
              <div className="settings-shelf-card display-card position-col">
                <div className="shelf-card-top">
                  <div className="setting-group-label">{t('groups.displayMonitor') || 'DISPLAY MONITOR'}</div>
                  <div className="setting-title">{t('position.displayTitle')}</div>
                  <div className="setting-desc">{t('position.displayDesc')}</div>
                </div>
                <div className="shelf-card-bottom">
                  {displays.length === 0 ? (
                    <div className="pill disabled">{t('position.loadingDisplays')}</div>
                  ) : (
                    displays.map((d) => {
                      const currentDisplay = displays.find((disp) => disp.isCurrent)
                      const activeDisplayId = currentDisplay
                        ? currentDisplay.id
                        : (settings.stickDisplayId ?? displays.find((disp) => disp.isPrimary)?.id ?? displays[0]?.id)
                      const isActive = activeDisplayId === d.id
                      const displayName = d.isPrimary ? t('position.primaryDisplay') : d.name
                      return (
                        <button
                          key={d.id}
                          type="button"
                          className={`pill display-pill ${isActive ? 'active' : ''}`}
                          style={{ width: '100%', justifyContent: 'space-between', padding: '6px 14px', fontSize: 11.5, height: 32, flexShrink: 0 }}
                          onClick={() => {
                            playButtonClickSound()
                            patch({ stickDisplayId: d.id })
                            useStore.getState().notifyPositionChanged()
                          }}
                        >
                          <span className="pill-name" style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginRight: 8 }}>{displayName}</span>
                          <span className="pill-res" style={{ opacity: 0.75, fontSize: 11, flexShrink: 0 }}>{d.resolution}</span>
                        </button>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Card 3: Edge Location Hint */}
              <div className="settings-shelf-card beacon-card position-col">
                <div className="shelf-card-top">
                  <div className="setting-group-label">{t('groups.locationHint') || 'LOCATION HINT'}</div>
                </div>
                <div className="shelf-card-inline">
                  <div className="shelf-card-inline-text">
                    <div className="setting-title">{t('position.edgeLocationHintTitle')}</div>
                    <div className="setting-desc">{t('groups.edgeHintPulseDesc') || 'Beacon pulse along edge to hint dock position'}</div>
                  </div>
                  <div className="shelf-card-inline-action">
                    <Toggle
                      checked={settings.showEdgeLocationHint ?? false}
                      onChange={(v) => patch({ showEdgeLocationHint: v })}
                    />
                  </div>
                </div>
              </div>

              {/* ── SUB-GROUP 2 DIVIDER: Trigger Zone ── */}
              <div className="shelf-section-divider">
                <span className="shelf-section-divider-text">{t('position.triggerZone') || 'TRIGGER ZONE'}</span>
              </div>

              {/* Card 5: Hover Area Size */}
              <div className="settings-shelf-card trigger-bar-card position-col">
                <div className="shelf-card-top">
                  <div className="setting-group-label">{t('groups.hoverZoneLength') || 'HOVER ZONE LENGTH'}</div>
                  <div className="setting-title">{t('position.hoverAreaSizeTitle')}</div>
                  <div className="setting-desc">{t('position.hoverAreaSizeDesc')}</div>
                </div>
                <div className="shelf-card-bottom">
                  <div className="setting-pills" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5, width: '100%' }}>
                    {[
                      { label: t('appearance.small'), val: 0.25 },
                      { label: t('position.medium'), val: 0.4 },
                      { label: t('appearance.large'), val: 0.6 }
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        className={`pill ${Math.abs(settings.hotZoneHeight - opt.val) < 0.08 ? 'active' : ''}`}
                        style={{ height: 32, fontSize: 11.5, fontWeight: 500, padding: 0 }}
                        onClick={() => {
                          playButtonClickSound()
                          patch({ hotZoneHeight: opt.val })
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 6: Edge Trigger Thickness */}
              <div className="settings-shelf-card trigger-thickness-card position-col">
                <div className="shelf-card-top">
                  <div className="setting-group-label">{t('groups.triggerThickness') || 'TRIGGER THICKNESS'}</div>
                  <div className="setting-slider-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div>
                      <div className="setting-title">{t('position.edgeTriggerThicknessTitle')}</div>
                      <div className="setting-desc">{t('position.edgeTriggerThicknessDesc')}</div>
                    </div>
                    <div className="setting-slider-val" style={{ flexShrink: 0, padding: '2px 8px', fontSize: 11, fontWeight: 600, borderRadius: 6 }}>
                      {`${settings.hotZoneWidth ?? 3}px`}
                    </div>
                  </div>
                </div>
                <div className="shelf-card-bottom">
                  <div className="setting-slider-wrap" style={{ gap: 4, padding: '2px 0' }}>
                    <WakeSlider
                      ariaLabel={t('position.edgeTriggerThicknessTitle')}
                      min={1}
                      max={7}
                      step={1}
                      bars={28}
                      height={28}
                      restHeight={8}
                      gap={3}
                      value={settings.hotZoneWidth ?? 3}
                      onStart={() => {
                        void window.edge.setInteractive(true)
                        setSliderActive(true)
                      }}
                      onRelease={(val) => {
                        handleThicknessRelease(val)
                      }}
                      onChange={(val) => {
                        handleThicknessInput(val)
                      }}
                    />
                    <div className="setting-slider-labels" style={{ marginTop: 2 }}>
                      {[
                        { label: 'Min', val: 1 },
                        { label: 'Mid', val: 4 },
                        { label: 'Max', val: 7 }
                      ].map((preset) => {
                        const currentPx = settings.hotZoneWidth ?? 3
                        const active = currentPx === preset.val
                        return (
                          <button
                            key={preset.val}
                            type="button"
                            className={`slider-label-btn${active ? ' active' : ''}`}
                            style={{ fontSize: 10, padding: '2px 8px' }}
                            onClick={() => {
                              if (currentPx !== preset.val) {
                                handleThicknessRelease(preset.val)
                              }
                            }}
                          >
                            {preset.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── SUB-GROUP 3 DIVIDER: Community & Support ── */}
              {SHOW_COMMUNITY_SUPPORT && <div className="shelf-section-divider">
                <span className="shelf-section-divider-text">{t('footer.communityAndSupport') || 'COMMUNITY & SUPPORT'}</span>
              </div>}

              {/* Card 9: Community & Feedback */}
              {renderHorizontalCommunityCard()}

              {/* Card 10: About & Quit */}
              {renderHorizontalAboutCard()}
            </>
          )}

          {/* ── TAB 3: APPEARANCE ── */}
          {horizontalTab === 'appearance' && (
            <>
              {/* ── SUB-GROUP 1 DIVIDER: Copy Indicator ── */}
              <div className="shelf-section-divider">
                <span className="shelf-section-divider-text">{t('appearance.copyIndicatorTitle') || 'COPY INDICATOR'}</span>
              </div>

              {/* Card 1: Copy Indicator Toggle */}
              <div className="settings-shelf-card beacon-toggle-card appearance-col">
                <div className="shelf-card-top">
                  <div className="setting-group-label">{t('groups.copyBeacon') || 'COPY BEACON'}</div>
                </div>
                <div className="shelf-card-inline">
                  <div className="shelf-card-inline-text">
                    <div className="setting-title">{t('appearance.copyIndicatorTitle')}</div>
                    <div className="setting-desc">{t('appearance.copyIndicatorDesc')}</div>
                  </div>
                  <div className="shelf-card-inline-action">
                    <Toggle
                      checked={settings.showCopyIndicator ?? true}
                      onChange={(v) => patch({ showCopyIndicator: v })}
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Visual Copy Beacon Style */}
              {(settings.showCopyIndicator ?? true) && (
                <div className="settings-shelf-card copy-card appearance-col">
                  <div className="shelf-card-top">
                    <div className="setting-group-label">{t('groups.beaconStyle') || 'BEACON STYLE'}</div>
                  </div>
                  <div className="shelf-card-inline">
                    <div className="shelf-card-inline-text">
                      <div className="setting-title">{t('appearance.indicatorStyleTitle')}</div>
                      <div className="setting-desc">{t('appearance.indicatorStyleDesc')}</div>
                    </div>
                    <div className="shelf-card-inline-action">
                      <button
                        ref={indicatorBtnRef}
                        type="button"
                        className={`icon-btn style-preview-toggle-btn ${isFlyoutActive ? 'active' : ''}`}
                        title={isFlyoutActive ? t('appearance.closeStyleSelector') : t('appearance.openStyleSelector')}
                        onClick={(e) => {
                          playButtonClickSound()
                          handleToggleFlyout(e.currentTarget)
                        }}
                      >
                        {isFlyoutActive ? <CloseIcon /> : <ChevronRightIcon />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── SUB-GROUP 2: Surface ── */}
              <div className="shelf-section-divider">
                <span className="shelf-section-divider-text">{t('appearance.surface') || 'SURFACE'}</span>
              </div>

              <div className="settings-shelf-card appearance-col">
                <div className="shelf-card-top">
                  <div className="setting-group-label">{t('appearance.themeTitle') || 'THEME'}</div>
                  <div className="setting-title">{t('appearance.themeTitle')}</div>
                  <div className="setting-desc">{t('appearance.themeDesc')}</div>
                </div>
                <ThemeModeSelector
                  value={settings.themeMode ?? 'dark'}
                  onChange={(value) => patch({ themeMode: value })}
                  t={t}
                />
              </div>

              <div className="settings-shelf-card appearance-col">
                <div className="shelf-card-top">
                  <div className="setting-group-label">{t('appearance.panelOpacityTitle') || 'PANEL OPACITY'}</div>
                  <div className="setting-title">{t('appearance.panelOpacityTitle')}</div>
                  <div className="setting-desc">{t('appearance.panelOpacityDesc')}</div>
                </div>
                <div className="shelf-card-bottom">
                  <WakeSlider
                    value={settings.panelOpacity ?? 100}
                    min={0}
                    max={100}
                    step={1}
                    bars={24}
                    height={34}
                    restHeight={8}
                    gap={3}
                    showValue
                    formatValue={(value) => `${Math.round(value)}%`}
                    ariaLabel={t('appearance.panelOpacityTitle')}
                    onStart={() => setSliderActive(true)}
                    onChange={handleOpacityInput}
                    onRelease={handleOpacityRelease}
                  />
                  <div className="slider-presets" aria-hidden="true">
                    <span>{t('appearance.opacityTransparent') || '0%'}</span>
                    <span>{t('appearance.opacityHalf') || '50%'}</span>
                    <span>{t('appearance.opacityOpaque') || '100%'}</span>
                  </div>
                </div>
              </div>

              {/* ── SUB-GROUP 2 DIVIDER: Audio & Feedback ── */}
              <div className="shelf-section-divider">
                <span className="shelf-section-divider-text">{t('appearance.audioAndFeedback') || 'AUDIO FEEDBACK'}</span>
              </div>

              {/* Card 4: Audio & Feedback */}
              <div className="settings-shelf-card audio-card appearance-col">
                <div className="shelf-card-top">
                  <div className="setting-group-label">{t('groups.audioFeedback') || 'AUDIO FEEDBACK'}</div>
                </div>
                <div className="shelf-card-inline">
                  <div className="shelf-card-inline-text">
                    <div className="setting-title">{t('behaviour.soundEffectsTitle')}</div>
                    <div className="setting-desc">{t('behaviour.soundEffectsDesc')}</div>
                  </div>
                  <div className="shelf-card-inline-action">
                    <Toggle
                      checked={settings.soundEffects ?? true}
                      onChange={(v) => {
                        if (v) playToggleSound(true)
                        patch({ soundEffects: v })
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* ── SUB-GROUP 3 DIVIDER: Community & Support ── */}
              {SHOW_COMMUNITY_SUPPORT && <div className="shelf-section-divider">
                <span className="shelf-section-divider-text">{t('footer.communityAndSupport') || 'COMMUNITY & SUPPORT'}</span>
              </div>}

              {/* Card 5: Community & Feedback */}
              {renderHorizontalCommunityCard()}

              {/* Card 6: About & Quit */}
              {renderHorizontalAboutCard()}
            </>
          )}
=======
          {horizontalTab === 'behaviour' && renderPromotedHorizontalUpdateCard()}
          {renderGroups(horizontalTab)}
          {renderClosingCards()}
>>>>>>> main
        </div>
      </div>
    )
  }

  // ── Vertical Layout (Side Docks) ──────────────────────────────────────────
  const maxTabLen = Math.max(...TABS.map((tab) => tab.label.length))
  const tabFontSize = maxTabLen > 15 ? '10px' : maxTabLen > 13 ? '10.5px' : maxTabLen > 11 ? '11px' : '11.5px'
  const tabLetterSpacing = maxTabLen > 13 ? '-0.02em' : '0'

  return (
<<<<<<< HEAD
    <div
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}
    >
      {/* ── Stationary Fixed Header (Tab Selector) ────────────────── */}
          <div className="settings-fixed-header">
            <div className="settings-tab-bar">
              {TABS.map((tab) => {
                const active = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    className={`settings-tab-btn${active ? ' active' : ''}`}
                    onClick={() => handleTabSwitch(tab.id)}
                    style={{
                      fontSize: `calc(${tabFontSize} * var(--font-scale, 1))`,
                      letterSpacing: tabLetterSpacing
                    }}
                  >
                    <span className="settings-tab-text">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Scrollable Content Area (Independent per section) ───────── */}
          <div className="settings-scroll-list" ref={scrollListRef}>

            {/* ── Tab 1: Behaviour (First) ──────────────────────────────── */}
            <AnimatePresence mode="wait">
              {activeTab === 'behaviour' && (
                <motion.div
                  key="tab-behaviour"
                  initial={{ opacity: 0, scale: 0.98, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -4 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  {renderPromotedTopUpdateCard()}

                  {/* ── SUB-GROUP 1: General & Startup ───────────────── */}
                  <div className="setting-section-divider">
                    <span className="setting-section-divider-text">{t('tabs.generalStartup') || 'GENERAL & STARTUP'}</span>
                  </div>

                  {/* Card 1: Language */}
                  <div className="setting-card">
                    <div className="shelf-card-top">
                      <div className="setting-group-label">{t('groups.general') || 'GENERAL'}</div>
                      <div className="setting-title">{t('behaviour.languageTitle')}</div>
                      <div className="setting-desc">{t('behaviour.languageDesc')}</div>
                    </div>
                    <div className="shelf-card-bottom">
                      <LanguageDropdown />
                    </div>
                  </div>

                  {/* Card 2: Launch at Login */}
                  {SHOW_LOGIN_AT_STARTUP_SETTING && (
                  <div className="setting-card">
                    <div className="shelf-card-top">
                      <div className="setting-group-label">{t('groups.startup') || 'STARTUP'}</div>
                    </div>
                    <div className="shelf-card-inline">
                      <div className="shelf-card-inline-text">
                        <div className="setting-title">{t('behaviour.launchAtLoginTitle')}</div>
                        <div className="setting-desc">{t('behaviour.launchAtLoginDesc')}</div>
                      </div>
                      <div className="shelf-card-inline-action">
                        <Toggle
                          checked={settings.launchAtLogin}
                          onChange={(v) => {
                            useStore.setState((s) => ({
                              settings: { ...s.settings, launchAtLogin: v }
                            }))
                            void patch({ launchAtLogin: v })
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Card 3: Incognito Mode */}
                  <div className="setting-card">
                    <div className="shelf-card-top">
                      <div className="setting-group-label">{t('groups.privacy') || 'PRIVACY'}</div>
                    </div>
                    <div className="shelf-card-inline">
                      <div className="shelf-card-inline-text">
                        <div className="setting-title">{t('behaviour.incognitoTitle')}</div>
                        <div className="setting-desc">{t('behaviour.incognitoDesc')}</div>
                      </div>
                      <div className="shelf-card-inline-action">
                        <Toggle
                          checked={settings.incognito}
                          onChange={(v) => patch({ incognito: v })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── SUB-GROUP 2: Shortcuts & Hover ──────────────── */}
                  <div className="setting-section-divider">
                    <span className="setting-section-divider-text">{t('tabs.activationShortcuts') || 'SHORTCUTS & HOVER'}</span>
                  </div>

                  {/* Card 4: Hover Activation */}
                  <div className="setting-card">
                    <div className="shelf-card-top">
                      <div className="setting-group-label">{t('groups.hoverActivation') || 'HOVER ACTIVATION'}</div>
                    </div>
                    <div className="shelf-card-inline">
                      <div className="shelf-card-inline-text">
                        <div className="setting-title">{t('behaviour.hoverActivationTitle')}</div>
                        <div className="setting-desc">
                          {(settings.hoverActivation ?? true)
                            ? t('behaviour.hoverActivationDescOn')
                            : t('behaviour.hoverActivationDescOff', { shortcut: settings.toggleHotkey || 'Alt+C' })}
                        </div>
                      </div>
                      <div className="shelf-card-inline-action">
                        <Toggle
                          checked={settings.hoverActivation ?? true}
                          onChange={(v) => {
                            if (!v) {
                              patch({ hoverActivation: false, suppressInFullscreen: false })
                            } else {
                              patch({ hoverActivation: true, suppressInFullscreen: true })
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 5: Global Toggle Shortcut */}
                  <div className="setting-card">
                    <div className="shelf-card-top">
                      <div className="setting-group-label">{t('groups.keyboardShortcut') || 'KEYBOARD SHORTCUT'}</div>
                      <div className="setting-title">{t('behaviour.toggleHotkeyTitle')}</div>
                      <div className="setting-desc">{t('behaviour.toggleHotkeyDesc')}</div>
                    </div>
                    <div className="shelf-card-bottom">
                      <HotkeyRecorder
                        hotkey={settings.toggleHotkey || 'Alt+C'}
                        onChange={(nextHotkey) => {
                          patch({ toggleHotkey: nextHotkey })
                          pushToast({
                            id: Date.now().toString(),
                            message: t('toast.shortcutUpdated', { shortcut: nextHotkey }),
                            tone: 'info'
                          })
                        }}
                      />
                    </div>
                  </div>

                  {/* Card 6: Fullscreen Protection */}
                  <div className="setting-card" style={{ opacity: (settings.hoverActivation ?? true) ? 1 : 0.45, transition: 'opacity 0.2s ease' }}>
                    <div className="shelf-card-top">
                      <div className="setting-group-label">{t('groups.fullscreenProtection') || 'FULLSCREEN PROTECTION'}</div>
                    </div>
                    <div className="shelf-card-inline">
                      <div className="shelf-card-inline-text">
                        <div className="setting-title">{t('behaviour.fullscreenProtectionTitle')}</div>
                        <div className="setting-desc">
                          {(settings.hoverActivation ?? true)
                            ? t('behaviour.fullscreenProtectionDesc')
                            : t('behaviour.disabledHoverOff')}
                        </div>
                      </div>
                      <div className="shelf-card-inline-action">
                        <Toggle
                          checked={(settings.hoverActivation ?? true) ? settings.suppressInFullscreen : false}
                          onChange={(v) => (settings.hoverActivation ?? true) && patch({ suppressInFullscreen: v })}
                          disabled={!(settings.hoverActivation ?? true)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── SUB-GROUP 3: Clipboard Rules ─────────────────── */}
                  <div className="setting-section-divider">
                    <span className="setting-section-divider-text">{t('tabs.clipboardRules') || 'CLIPBOARD RULES'}</span>
                  </div>

                  {/* Card 7: Move Pasted to Top */}
                  <div className="setting-card">
                    <div className="shelf-card-top">
                      <div className="setting-group-label">{t('groups.clipboardBehaviour') || 'CLIPBOARD BEHAVIOUR'}</div>
                    </div>
                    <div className="shelf-card-inline">
                      <div className="shelf-card-inline-text">
                        <div className="setting-title">{t('behaviour.movePastedToTopTitle')}</div>
                        <div className="setting-desc">{t('behaviour.movePastedToTopDesc')}</div>
                      </div>
                      <div className="shelf-card-inline-action">
                        <Toggle
                          checked={settings.movePastedToTop ?? true}
                          onChange={(v) => patch({ movePastedToTop: v })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 8: Clear Unpinned on Restart */}
                  <div className="setting-card">
                    <div className="shelf-card-top">
                      <div className="setting-group-label">{t('groups.restartCleanup') || 'RESTART CLEANUP'}</div>
                    </div>
                    <div className="shelf-card-inline">
                      <div className="shelf-card-inline-text">
                        <div className="setting-title">{t('behaviour.clearUnpinnedTitle')}</div>
                        <div className="setting-desc">{t('behaviour.clearUnpinnedDesc')}</div>
                      </div>
                      <div className="shelf-card-inline-action">
                        <Toggle
                          checked={settings.clearUnpinnedOnRestart}
                          onChange={(v) => patch({ clearUnpinnedOnRestart: v })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── SUB-GROUP 4: Storage & Retention ─────────────── */}
                  <div className="setting-section-divider">
                    <span className="setting-section-divider-text">{t('tabs.storageRetention') || 'STORAGE & RETENTION'}</span>
                  </div>

                  {/* Card 9: History Capacity */}
                  <div className="setting-card">
                    <div className="shelf-card-top">
                      <div className="setting-group-label">{t('groups.storageCapacity') || 'STORAGE CAPACITY'}</div>
                      <div className="setting-title">{t('behaviour.capacityTitle')}</div>
                      <div className="setting-desc">{t('behaviour.capacityDesc')}</div>
                    </div>
                    <div className="shelf-card-bottom">
                      <div className="setting-pills">
                        {[
                          { label: '100', val: 100 },
                          { label: '250', val: 250 },
                          { label: '500', val: 500 },
                          { label: '1000', val: 1000 }
                        ].map((opt) => (
                          <button
                            key={opt.val}
                            className={`pill ${settings.historyLimit === opt.val ? 'active' : ''}`}
                            onClick={() => { playButtonClickSound(); patch({ historyLimit: opt.val }) }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card 10: Auto-Delete Timer */}
                  <div className="setting-card">
                    <div className="shelf-card-top">
                      <div className="setting-group-label">{t('groups.autoDelete') || 'AUTO-DELETE'}</div>
                      <div className="setting-title">{t('behaviour.autoDeleteTitle')}</div>
                      <div className="setting-desc">{t('behaviour.autoDeleteDesc')}</div>
                    </div>
                    <div className="shelf-card-bottom">
                      <div className="setting-pills">
                        {[
                          { label: t('behaviour.never'), val: 0 },
                          { label: '1h', val: 1 },
                          { label: '6h', val: 6 },
                          { label: '24h', val: 24 },
                          { label: '7d', val: 168 }
                        ].map((opt) => (
                          <button
                            key={opt.val}
                            className={`pill ${settings.autoDeleteHours === opt.val ? 'active' : ''}`}
                            onClick={() => { playButtonClickSound(); patch({ autoDeleteHours: opt.val }) }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ── UPDATES SECTION (Consolidated above Community & Support) ── */}
                  {SHOW_UPDATE_SETTINGS && !isStoreBuild && (
                    <>
                      <div className="setting-section-divider">
                        <span className="setting-section-divider-text">{t('tabs.updates') || 'UPDATES'}</span>
                      </div>

                      {/* Card 11: Auto Updates (3-way selector) */}
                      <div className="setting-card">
                        <div className="shelf-card-top">
                          <div className="setting-group-label">{t('groups.updates') || 'UPDATES'}</div>
                          <div className="setting-title">{t('behaviour.autoUpdatesTitle')}</div>
                          <div className="setting-desc">
                            {updateMode === 'auto'
                              ? t('behaviour.autoUpdatesDescOn')
                              : updateMode === 'notify'
                              ? (t('behaviour.updateModeNotifyDesc') || 'Notify when updates are available without downloading')
                              : t('behaviour.autoUpdatesDescOff')}
                          </div>
                        </div>
                        <div className="shelf-card-bottom">
                          <div className="setting-pills" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5 }}>
                            {([
                              { label: t('behaviour.updateModeAuto') || 'Automatic', val: 'auto' as UpdateMode },
                              { label: t('behaviour.updateModeNotify') || 'Notify me', val: 'notify' as UpdateMode },
                              { label: t('behaviour.updateModeOff') || 'Off', val: 'off' as UpdateMode }
                            ]).map((opt) => (
                              <button
                                key={opt.val}
                                className={`pill ${updateMode === opt.val ? 'active' : ''}`}
                                onClick={() => { playButtonClickSound(); patch({ updateMode: opt.val }) }}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {renderManualUpdateCard(true)}
                    </>
                  )}

                  {PersistentFooter}
                </motion.div>
              )}

              {/* ── Tab 2: Position (Second) ─────────────────────────────── */}
              {activeTab === 'position' && (
                <motion.div
                  key="tab-position"
                  initial={{ opacity: 0, scale: 0.98, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -4 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  {/* ── GROUP: Position ──────────────────────────────────── */}
                  <div className="setting-section-divider">
                    <span className="setting-section-divider-text">{t('tabs.position') || 'POSITION'}</span>
                  </div>

                  {/* Card 1: Edge Placement */}
                  <div className="setting-card">
                    <div className="shelf-card-top">
                      <div className="setting-group-label">{t('groups.placement') || 'PLACEMENT'}</div>
                      <div className="setting-title">{t('position.edgePlacementTitle')}</div>
                      <div className="setting-desc">{t('position.edgePlacementDesc')}</div>
                    </div>
                    <div className="shelf-card-bottom">
                      <div className="placement-3way-wrap">
                        <button
                          type="button"
                          className={`pill ${(edgeTransition?.active ? edgeTransition.to === 'left' : settings.stickPosition === 'left') ? 'active' : ''} ${edgeTransition?.active && edgeTransition.to === 'left' ? 'transitioning' : ''}`}
                          disabled={edgeTransition?.active}
                          onClick={() => {
                            void startEdgeTransition('left')
                          }}
                        >
                          {t('position.leftEdge') || 'Left Edge'}
                        </button>
                        <button
                          type="button"
                          className={`pill ${(edgeTransition?.active ? edgeTransition.to === 'top' : settings.stickPosition === 'top') ? 'active' : ''} ${edgeTransition?.active && edgeTransition.to === 'top' ? 'transitioning' : ''}`}
                          disabled={edgeTransition?.active}
                          onClick={() => {
                            void startEdgeTransition('top')
                          }}
                        >
                          {t('position.topEdge') || 'Top Edge'}
                        </button>
                        <button
                          type="button"
                          className={`pill ${(edgeTransition?.active ? edgeTransition.to === 'right' : settings.stickPosition === 'right') ? 'active' : ''} ${edgeTransition?.active && edgeTransition.to === 'right' ? 'transitioning' : ''}`}
                          disabled={edgeTransition?.active}
                          onClick={() => {
                            void startEdgeTransition('right')
                          }}
                        >
                          {t('position.rightEdge') || 'Right Edge'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Position Range Slider */}
                  {(() => {
                    const isHorizontal = settings.stickPosition === 'top'
                    const offsetVal = isHorizontal ? (settings.horizontalOffset ?? 0.5) : (settings.verticalOffset ?? 0.5)
                    const sliderTitle = isHorizontal ? (t('position.horizontalPositionTitle') || 'Horizontal Position') : t('position.verticalPositionTitle')
                    const sliderDesc = isHorizontal ? (t('position.horizontalPositionDesc') || 'Adjust horizontal alignment along screen edge') : t('position.verticalPositionDesc')

                    return (
                      <div className="setting-card">
                        <div className="shelf-card-top">
                          <div className="setting-group-label">{t('groups.alignment') || 'ALIGNMENT'}</div>
                          <div className="setting-slider-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <div>
                              <div className="setting-title">{sliderTitle}</div>
                              <div className="setting-desc">{sliderDesc}</div>
                            </div>
                            <div className="setting-slider-val">
                              {`${Math.round(offsetVal * 100)}%`}
                            </div>
                          </div>
                        </div>

                        <div className="shelf-card-bottom">
                          <div className="setting-slider-wrap">
                            <WakeSlider
                              ariaLabel={sliderTitle}
                              min={0}
                              max={1}
                              step={0.002}
                              bars={28}
                              height={28}
                              restHeight={8}
                              gap={3}
                              value={offsetVal}
                              onStart={() => {
                                void window.edge.setInteractive(true)
                                setSliderActive(true)
                              }}
                              onRelease={(val) => {
                                setSliderActive(false)
                                if (isHorizontal) {
                                  patch({ horizontalOffset: val })
                                } else {
                                  handleSliderRelease(val)
                                }
                              }}
                              onChange={(raw) => {
                                if (isHorizontal) {
                                  patch({ horizontalOffset: raw })
                                } else {
                                  handleSliderInput(raw)
                                }
                              }}
                            />

                            <div className="setting-slider-labels">
                              {[
                                { label: isHorizontal ? 'Left' : '0%', val: 0 },
                                { label: 'Center', val: 0.5 },
                                { label: isHorizontal ? 'Right' : '100%', val: 1.0 }
                              ].map((pos) => {
                                const active = Math.abs(offsetVal - pos.val) < 0.04
                                return (
                                  <button
                                    key={pos.val}
                                    type="button"
                                    className={`slider-label-btn${active ? ' active' : ''}`}
                                    onClick={() => {
                                      if (isHorizontal) {
                                        patch({ horizontalOffset: pos.val })
                                      } else {
                                        handleSliderRelease(pos.val)
                                      }
                                    }}
                                  >
                                    {pos.label}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Card 3: Target Display */}
                  <div className="setting-card">
                    <div className="shelf-card-top">
                      <div className="setting-group-label">{t('groups.displayMonitor') || 'DISPLAY MONITOR'}</div>
                      <div className="setting-title">{t('position.displayTitle')}</div>
                      <div className="setting-desc">{t('position.displayDesc')}</div>
                    </div>
                    <div className="shelf-card-bottom">
                      <div className="setting-pills">
                        {displays.length === 0 && <div className="pill disabled">{t('position.loadingDisplays')}</div>}
                        {displays.map((d) => {
                          const currentDisplay = displays.find((disp) => disp.isCurrent)
                          const activeDisplayId = currentDisplay
                            ? currentDisplay.id
                            : (settings.stickDisplayId ?? displays.find((disp) => disp.isPrimary)?.id ?? displays[0]?.id)
                          const isActive = activeDisplayId === d.id
                          const displayName = d.isPrimary ? t('position.primaryDisplay') : d.name
                          return (
                            <button
                              key={d.id}
                              className={`pill display-pill ${isActive ? 'active' : ''}`}
                              onClick={() => {
                                playButtonClickSound()
                                patch({ stickDisplayId: d.id })
                                useStore.getState().notifyPositionChanged()
                              }}
                            >
                              <div className="pill-name">{displayName}</div>
                              <div className="pill-res">{d.resolution}</div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* ── GROUP: Trigger Zone ──────────────────────────────── */}
                  <div className="setting-section-divider">
                    <span className="setting-section-divider-text">{t('position.triggerZone') || 'TRIGGER ZONE'}</span>
                  </div>

                  {/* Card 4: Location Hint */}
                  <div className="setting-card">
                    <div className="shelf-card-top">
                      <div className="setting-group-label">{t('groups.locationHint') || 'LOCATION HINT'}</div>
                    </div>
                    <div className="shelf-card-inline">
                      <div className="shelf-card-inline-text">
                        <div className="setting-title">{t('position.edgeLocationHintTitle')}</div>
                        <div className="setting-desc">{t('position.edgeLocationHintDesc')}</div>
                      </div>
                      <div className="shelf-card-inline-action">
                        <Toggle
                          checked={settings.showEdgeLocationHint ?? false}
                          onChange={(v) => patch({ showEdgeLocationHint: v })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 5: Trigger Alignment */}
                  <div className="setting-card">
                    <div className="shelf-card-top">
                      <div className="setting-group-label">{t('groups.triggerPosition') || 'TRIGGER POSITION'}</div>
                      <div className="setting-title">{t('position.edgeTriggerPositionTitle')}</div>
                      <div className="setting-desc">{t('position.edgeTriggerPositionDesc')}</div>
                    </div>
                    <div className="shelf-card-bottom">
                      <div className="setting-pills">
                        {[
                          { label: (settings.stickPosition === 'top') ? (t('position.left') || 'Left') : t('position.top'), val: 'top' as const },
                          { label: t('position.center'), val: 'center' as const },
                          { label: (settings.stickPosition === 'top') ? (t('position.right') || 'Right') : t('position.bottom'), val: 'bottom' as const }
                        ].map((opt) => (
                          <button
                            key={opt.val}
                            className={`pill ${(settings.triggerAlignment || 'center') === opt.val ? 'active' : ''}`}
                            onClick={() => {
                              playButtonClickSound()
                              patch({ triggerAlignment: opt.val })
                              useStore.getState().notifyPositionChanged()
                            }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card 6: Hover Area Size */}
                  <div className="setting-card">
                    <div className="shelf-card-top">
                      <div className="setting-group-label">{t('groups.hoverZoneLength') || 'HOVER ZONE LENGTH'}</div>
                      <div className="setting-title">{t('position.hoverAreaSizeTitle')}</div>
                      <div className="setting-desc">{t('position.hoverAreaSizeDesc')}</div>
                    </div>
                    <div className="shelf-card-bottom">
                      <div className="setting-pills">
                        {[
                          { label: t('appearance.small'), val: 0.25 },
                          { label: t('position.medium'), val: 0.4 },
                          { label: t('appearance.large'), val: 0.6 }
                        ].map((opt) => (
                          <button
                            key={opt.label}
                            className={`pill ${Math.abs(settings.hotZoneHeight - opt.val) < 0.08 ? 'active' : ''}`}
                            onClick={() => {
                              playButtonClickSound()
                              patch({ hotZoneHeight: opt.val })
                            }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card 7: Edge Trigger Thickness */}
                  <div className="setting-card">
                    <div className="shelf-card-top">
                      <div className="setting-group-label">{t('groups.triggerThickness') || 'TRIGGER THICKNESS'}</div>
                      <div className="setting-slider-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <div>
                          <div className="setting-title">{t('position.edgeTriggerThicknessTitle')}</div>
                          <div className="setting-desc">{t('position.edgeTriggerThicknessDesc')}</div>
                        </div>
                        <div className="setting-slider-val">
                          {`${settings.hotZoneWidth ?? 3}px`}
                        </div>
                      </div>
                    </div>

                    <div className="shelf-card-bottom">
                      <div className="setting-slider-wrap">
                        <WakeSlider
                          min={1}
                          max={7}
                          step={1}
                          bars={28}
                          height={28}
                          restHeight={8}
                          gap={3}
                          value={settings.hotZoneWidth ?? 3}
                          onStart={() => {
                            void window.edge.setInteractive(true)
                            setSliderActive(true)
                          }}
                          onRelease={(val) => {
                            handleThicknessRelease(val)
                          }}
                          onChange={(val) => {
                            handleThicknessInput(val)
                          }}
                        />

                        <div className="setting-slider-labels">
                          {[
                            { label: 'Min', val: 1 },
                            { label: 'Mid', val: 4 },
                            { label: 'Max', val: 7 }
                          ].map((preset) => {
                            const currentPx = settings.hotZoneWidth ?? 3
                            const active = currentPx === preset.val
                            return (
                              <button
                                key={preset.val}
                                type="button"
                                className={`slider-label-btn${active ? ' active' : ''}`}
                                onClick={() => {
                                  if (currentPx !== preset.val) {
                                    handleThicknessRelease(preset.val)
                                  }
                                }}
                              >
                                {preset.label}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 8: Panel Height */}
                  <div className="setting-card">
                    <div className="shelf-card-top">
                      <div className="setting-group-label">{t('groups.panelHeight') || 'PANEL HEIGHT'}</div>
                      <div className="setting-title">{t('position.panelHeightTitle')}</div>
                      <div className="setting-desc">{t('position.panelHeightDesc')}</div>
                    </div>
                    <div className="shelf-card-bottom">
                      <div className="setting-pills">
                        {[
                          { label: t('appearance.small'), val: 0.5 },
                          { label: t('position.medium'), val: 0.65 },
                          { label: t('appearance.large'), val: 0.8 }
                        ].map((opt) => (
                          <button
                            key={opt.label}
                            className={`pill ${Math.abs((settings.panelHeight || 0.6) - opt.val) < 0.08 ? 'active' : ''}`}
                            onClick={() => {
                              playButtonClickSound()
                              patch({ panelHeight: opt.val })
                            }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {PersistentFooter}
                </motion.div>
              )}

              {/* ── Tab 3: Appearance (Third) ────────────────────────────── */}
              {activeTab === 'appearance' && (
                <motion.div
                  key="tab-appearance"
                  initial={{ opacity: 0, scale: 0.98, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -4 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  {/* ── GROUP: Surface ──────────────────────────────────── */}
                  <div className="setting-section-divider">
                    <span className="setting-section-divider-text">{t('appearance.surface') || 'SURFACE'}</span>
                  </div>

                  <div className="setting-card">
                    <div className="shelf-card-top">
                      <div className="setting-group-label">{t('appearance.themeTitle') || 'THEME'}</div>
                      <div className="setting-title">{t('appearance.themeTitle')}</div>
                      <div className="setting-desc">{t('appearance.themeDesc')}</div>
                    </div>
                    <ThemeModeSelector
                      value={settings.themeMode ?? 'dark'}
                      onChange={(value) => patch({ themeMode: value })}
                      t={t}
                    />
                  </div>

                  <div className="setting-card">
                    <div className="shelf-card-top">
                      <div className="setting-group-label">{t('appearance.panelOpacityTitle') || 'PANEL OPACITY'}</div>
                      <div className="setting-title">{t('appearance.panelOpacityTitle')}</div>
                      <div className="setting-desc">{t('appearance.panelOpacityDesc')}</div>
                    </div>
                    <div className="shelf-card-bottom">
                      <WakeSlider
                        value={settings.panelOpacity ?? 100}
                        min={0}
                        max={100}
                        step={1}
                        bars={24}
                        height={34}
                        restHeight={8}
                        gap={3}
                        showValue
                        formatValue={(value) => `${Math.round(value)}%`}
                        ariaLabel={t('appearance.panelOpacityTitle')}
                        onStart={() => setSliderActive(true)}
                        onChange={handleOpacityInput}
                        onRelease={handleOpacityRelease}
                      />
                      <div className="slider-presets" aria-hidden="true">
                        <span>{t('appearance.opacityTransparent') || '0%'}</span>
                        <span>{t('appearance.opacityHalf') || '50%'}</span>
                        <span>{t('appearance.opacityOpaque') || '100%'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="setting-card panel-width-card">
                    <div className="shelf-card-top">
                      <div className="setting-group-label">{t('appearance.panelWidthTitle') || 'PANEL WIDTH'}</div>
                      <div className="setting-title">{t('appearance.panelWidthTitle')}</div>
                      <div className="setting-desc">{t('appearance.panelWidthDesc')}</div>
                    </div>
                    <div className="shelf-card-bottom">
                      <WakeSlider
                        value={settings.panelWidth ?? 270}
                        min={220}
                        max={360}
                        step={1}
                        bars={24}
                        height={34}
                        restHeight={8}
                        gap={3}
                        showValue
                        formatValue={(value) => `${Math.round(value)}px`}
                        ariaLabel={t('appearance.panelWidthTitle')}
                        onStart={() => setSliderActive(true)}
                        onChange={handlePanelWidthInput}
                        onRelease={handlePanelWidthRelease}
                      />
                      <div className="slider-presets" aria-hidden="true">
                        <span>{t('appearance.panelWidthNarrow') || '220px'}</span>
                        <span>{t('appearance.panelWidthDefault') || '270px'}</span>
                        <span>{t('appearance.panelWidthWide') || '360px'}</span>
                      </div>
                    </div>
                  </div>

                  {/* ── GROUP: Copy Indicator ────────────────────────────── */}
                  <div className="setting-section-divider">
                    <span className="setting-section-divider-text">{t('appearance.copyIndicatorTitle') || 'COPY INDICATOR'}</span>
                  </div>

                  {/* Card 1: Copy Indicator Toggle */}
                  <div className="setting-card">
                    <div className="shelf-card-top">
                      <div className="setting-group-label">{t('groups.copyBeacon') || 'COPY BEACON'}</div>
                    </div>
                    <div className="shelf-card-inline">
                      <div className="shelf-card-inline-text">
                        <div className="setting-title">{t('appearance.copyIndicatorTitle')}</div>
                        <div className="setting-desc">{t('appearance.copyIndicatorDesc')}</div>
                      </div>
                      <div className="shelf-card-inline-action">
                        <Toggle
                          checked={settings.showCopyIndicator ?? true}
                          onChange={(v) => patch({ showCopyIndicator: v })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Indicator Style */}
                  {(settings.showCopyIndicator ?? true) && (
                    <div className="setting-card">
                      <div className="shelf-card-top">
                        <div className="setting-group-label">{t('groups.beaconStyle') || 'BEACON STYLE'}</div>
                      </div>
                      <div className="shelf-card-inline">
                        <div className="shelf-card-inline-text">
                          <div className="setting-title">{t('appearance.indicatorStyleTitle')}</div>
                          <div className="setting-desc">
                            {t('appearance.indicatorStyleDesc')}
                          </div>
                        </div>
                        <div className="shelf-card-inline-action">
                          <button
                            type="button"
                            className={`icon-btn style-preview-toggle-btn ${isFlyoutActive ? 'active' : ''}`}
                            title={isFlyoutActive ? t('appearance.closeStyleSelector') : t('appearance.openStyleSelector')}
                            onClick={(e) => {
                              playButtonClickSound()
                              handleToggleFlyout(e.currentTarget)
                            }}
                          >
                            {isFlyoutActive ? <CloseIcon /> : <ChevronRightIcon />}
                          </button>
                        </div>
                      </div>

                      {isTutorial && localInlineOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.22, ease: 'easeOut' }}
                          style={{ overflow: 'hidden', marginTop: 12, marginBottom: 8 }}
                        >
                          <div className="style-card-grid" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: 10,
                            padding: 12,
                            background: '#09090b',
                            borderRadius: 12,
                            border: '1px solid rgba(255, 255, 255, 0.08)'
                          }}>
                            {/* Logo Card */}
                            <div
                              className="style-card"
                              onClick={() => {
                                playButtonClickSound()
                                patch({ copyIndicatorStyle: 'logo' })
                              }}
                              style={{
                                background: (settings.copyIndicatorStyle || 'logo') === 'logo' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                                border: (settings.copyIndicatorStyle || 'logo') === 'logo' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                                borderRadius: 10,
                                padding: '12px 8px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                gap: 8,
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <div style={{ height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <LogoIndicatorIcon fillColor="var(--text-primary)" size={30} />
                              </div>
                              <div className="style-card-label" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{t('appearance.logoStyle')}</div>
                            </div>

                            {/* Tick Card */}
                            <div
                              className="style-card"
                              onClick={() => {
                                playButtonClickSound()
                                patch({ copyIndicatorStyle: 'check' })
                              }}
                              style={{
                                background: settings.copyIndicatorStyle === 'check' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                                border: settings.copyIndicatorStyle === 'check' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                                borderRadius: 10,
                                padding: '12px 8px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                gap: 8,
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <div style={{ height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <TickIndicatorIcon fillColor="var(--text-primary)" size={30} />
                              </div>
                              <div className="style-card-label" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{t('appearance.tickStyle')}</div>
                            </div>

                            {/* Copy Card */}
                            <div
                              className="style-card"
                              onClick={() => {
                                playButtonClickSound()
                                patch({ copyIndicatorStyle: 'copy' })
                              }}
                              style={{
                                background: settings.copyIndicatorStyle === 'copy' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                                border: settings.copyIndicatorStyle === 'copy' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                                borderRadius: 10,
                                padding: '12px 8px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                gap: 8,
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <div style={{ height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CopyIndicatorIcon fillColor="var(--text-primary)" size={30} />
                              </div>
                              <div className="style-card-label" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{t('appearance.copyStyle')}</div>
                            </div>

                            {/* Sparkle Card */}
                            <div
                              className="style-card"
                              onClick={() => {
                                playButtonClickSound()
                                patch({ copyIndicatorStyle: 'sparkle' })
                              }}
                              style={{
                                background: settings.copyIndicatorStyle === 'sparkle' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                                border: settings.copyIndicatorStyle === 'sparkle' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                                borderRadius: 10,
                                padding: '12px 8px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                gap: 8,
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <div style={{ height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <SparkleIndicatorIcon fillColor="var(--text-primary)" size={30} />
                              </div>
                              <div className="style-card-label" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{t('appearance.sparkleStyle')}</div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* ── GROUP: Typography ────────────────────────────────── */}
                  <div className="setting-section-divider">
                    <span className="setting-section-divider-text">{t('appearance.typography') || 'TYPOGRAPHY'}</span>
                  </div>

                  {/* Card 3: Text Size */}
                  <div className="setting-card">
                    <div className="shelf-card-top">
                      <div className="setting-group-label">{t('groups.textSize') || 'TEXT SIZE'}</div>
                      <div className="setting-title">{t('appearance.textSizeTitle')}</div>
                      <div className="setting-desc">{t('appearance.textSizeDesc')}</div>
                    </div>
                    <div className="shelf-card-bottom">
                      <div className="setting-pills">
                        {[
                          { label: t('appearance.small'), val: 0.85 },
                          { label: t('appearance.normal'), val: 1.0 },
                          { label: t('appearance.large'), val: 1.15 }
                        ].map((opt) => (
                          <button
                            key={opt.label}
                            className={`pill ${Math.abs((settings.fontSizeScale ?? 1.0) - opt.val) < 0.05 ? 'active' : ''}`}
                            onClick={() => {
                              playButtonClickSound()
                              patch({ fontSizeScale: opt.val })
                            }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ── GROUP: Audio & Feedback ──────────────────────────── */}
                  <div className="setting-section-divider">
                    <span className="setting-section-divider-text">{t('appearance.audioAndFeedback') || 'AUDIO FEEDBACK'}</span>
                  </div>

                  {/* Card 4: Audio Feedback */}
                  <div className="setting-card">
                    <div className="shelf-card-top">
                      <div className="setting-group-label">{t('groups.audioFeedback') || 'AUDIO FEEDBACK'}</div>
                    </div>
                    <div className="shelf-card-inline">
                      <div className="shelf-card-inline-text">
                        <div className="setting-title">{t('behaviour.soundEffectsTitle')}</div>
                        <div className="setting-desc">{t('behaviour.soundEffectsDesc')}</div>
                      </div>
                      <div className="shelf-card-inline-action">
                        <Toggle
                          checked={settings.soundEffects ?? true}
                          onChange={(v) => {
                            if (v) playToggleSound(true)
                            patch({ soundEffects: v })
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {PersistentFooter}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
=======
    <div className="settings-v" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      <div className="settings-fixed-header">
        <div className="settings-tab-bar" role="tablist">
          {TABS.map((tab) => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`settings-tab-btn${active ? ' active' : ''}`}
                onClick={() => handleTabSwitch(tab.id)}
                style={{
                  fontSize: `calc(${tabFontSize} * var(--font-scale, 1))`,
                  letterSpacing: tabLetterSpacing
                }}
              >
                <span className="settings-tab-text">{tab.label}</span>
              </button>
            )
          })}
>>>>>>> main
        </div>
      </div>

      <div className="settings-scroll-list" ref={scrollListRef}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`tab-${activeTab}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTab === 'behaviour' && renderPromotedTopUpdateCard()}
            {renderGroups(activeTab)}
            {renderClosingCards()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Grouped rows ─────────────────────────────────────────────────────────────

interface RowSpec {
  id: string
  title: ReactNode
  desc?: ReactNode
  /** error styling for the description */
  descError?: boolean
  /** control at the right end of the row: toggle, value, small button */
  trailing?: ReactNode
  /** wide control under the text: pills, slider, recorder, dropdown */
  below?: ReactNode
  /** sliders need a taller slot in the top dock */
  size?: 'slider'
  disabled?: boolean
  extra?: ReactNode
}

interface GroupSpec {
  id: string
  label: string
  rows: RowSpec[]
}

function SettingRow({ row, layout }: { row: RowSpec; layout: 'v' | 'h' }) {
  const tooltip = layout === 'h' && typeof row.desc === 'string' ? row.desc : undefined
  return (
    <div
      className={`set-row${row.below ? ' has-below' : ''}${row.size === 'slider' ? ' is-slider' : ''}${row.disabled ? ' is-disabled' : ''}`}
      data-row={row.id}
    >
      <div className="set-row-main">
        <div className="set-row-text" title={tooltip}>
          <div className="set-row-title">{row.title}</div>
          {row.desc && <div className={`set-row-desc${row.descError ? ' is-error' : ''}`}>{row.desc}</div>}
        </div>
        {row.trailing && <div className="set-row-trailing">{row.trailing}</div>}
      </div>
      {row.below && <div className="set-row-below">{row.below}</div>}
      {row.extra}
    </div>
  )
}

/** Top dock columns: a setting with a wide control (pills, slider, recorder)
 * fills a column; settings with just a toggle or button stack two to one. */
function columnsOf(rows: RowSpec[]): RowSpec[][] {
  const cols: RowSpec[][] = []
  for (const row of rows) {
    const last = cols[cols.length - 1]
    if (!row.below && last && last.length === 1 && !last[0].below) last.push(row)
    else cols.push([row])
  }
  return cols
}

function SettingGroup({ group, layout }: { group: GroupSpec; layout: 'v' | 'h' }) {
  return (
    <section className={`set-group${layout === 'h' ? ' is-h' : ''}`} data-group={group.id}>
      <h3 className="set-group-label">{group.label}</h3>
      <div className="set-group-card">
        {layout === 'h'
          ? columnsOf(group.rows).map((col) => (
              <div key={col[0].id} className={`set-col${col.length > 1 ? ' is-pair' : ''}`}>
                {col.map((row) => (
                  <SettingRow key={row.id} row={row} layout={layout} />
                ))}
              </div>
            ))
          : group.rows.map((row) => <SettingRow key={row.id} row={row} layout={layout} />)}
      </div>
    </section>
  )
}

function ThemeModeSelector({
  value,
  onChange,
  t
}: {
  value: ThemeMode
  onChange: (value: ThemeMode) => void
  t: (path: string) => string
}) {
  const options: Array<{ value: ThemeMode; icon: typeof Moon; label: string }> = [
    { value: 'dark', icon: Moon, label: t('appearance.darkMode') || 'Night mode' },
    { value: 'light', icon: Sun, label: t('appearance.lightMode') || 'Day mode' }
  ]

  return (
    <div className="theme-mode-selector" role="group" aria-label={t('appearance.themeTitle') || 'Theme'}>
      {options.map(({ value: optionValue, icon: Icon, label }) => {
        const active = value === optionValue
        return (
          <button
            key={optionValue}
            type="button"
            className={`theme-mode-option${active ? ' active' : ''}`}
            aria-pressed={active}
            onClick={() => {
              playButtonClickSound()
              onChange(optionValue)
            }}
          >
            <Icon size={14} strokeWidth={2.2} aria-hidden="true" />
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}

function Toggle({
  checked,
  onChange,
  disabled
}: {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <button
      type="button"
      className={`setting-toggle${checked ? ' checked' : ''}`}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        if (disabled) return
        playToggleSound(!checked)
        onChange(!checked)
      }}
      style={{
        flexShrink: 0,
        width: 36,
        height: 20,
        borderRadius: 999,
        background: disabled
          ? 'var(--toggle-off)'
          : checked
          ? 'var(--toggle-on)'
          : isHovered
          ? 'color-mix(in srgb, var(--toggle-on) 18%, transparent)'
          : 'var(--toggle-off)',
        border: 'none',
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        padding: 0,
        outline: 'none',
        transition: 'background 0.18s ease, opacity 0.18s ease',
        boxShadow: 'none',
        opacity: disabled ? 0.38 : 1
      }}
    >
      <motion.span
        className="toggle-thumb settings-toggle-thumb"
        initial={false}
        animate={{
          x: checked ? 19 : 3,
          backgroundColor: checked ? 'var(--toggle-on-ink)' : 'var(--toggle-off-ink)'
        }}
        transition={{
          type: 'spring',
          stiffness: 520,
          damping: 32,
          mass: 0.5
        }}
        style={{
          position: 'absolute',
          top: 3,
          left: 0,
          width: 14,
          height: 14,
          borderRadius: '50%',
          boxShadow: 'none',
          pointerEvents: 'none'
        }}
      />
    </button>
  )
}

function LanguageDropdown({ direction = 'down', compact = false }: { direction?: 'up' | 'down'; compact?: boolean } = {}) {
  const { language, languages } = useTranslation()
  const patch = useStore((s) => s.patchSettings)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)

  const getLangLabel = (l: { code: string; name: string; nativeName: string }) =>
    l.code === 'system' || l.nativeName.includes('(') ? l.nativeName : `${l.nativeName} (${l.name})`

  const selectedLang = languages.find((l) => l.code === (language || 'system')) || languages[0]

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      window.addEventListener('mousedown', handleClickOutside)
    }
    return () => window.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeBtn = listRef.current.querySelector<HTMLButtonElement>('[data-active="true"]')
      if (activeBtn) {
        if (selectedLang.code === 'system') {
          listRef.current.scrollTop = 0
        } else {
          listRef.current.scrollTop = Math.max(0, activeBtn.offsetTop - 4)
        }
      }
    }
  }, [isOpen, selectedLang.code])

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        onClick={() => {
          playButtonClickSound()
          setIsOpen(!isOpen)
        }}
        style={{
          width: '100%',
          height: compact ? 28 : 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: isOpen ? 'var(--bg-card-hover)' : 'var(--bg-card)',
          color: 'var(--text-primary)',
          border: isOpen ? '1px solid var(--edge-strong)' : '1px solid var(--edge-light)',
          borderRadius: compact ? 8 : 10,
          padding: compact ? '0 10px' : '8px 12px',
          fontSize: compact ? 11.5 : 12.5,
          fontWeight: 500,
          outline: 'none',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-card)',
          transition: 'all 0.15s ease'
        }}
      >
        <span>{getLangLabel(selectedLang)}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ display: 'flex', alignItems: 'center', color: 'var(--text-tertiary)' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={listRef}
            initial={{ opacity: 0, y: direction === 'up' ? -6 : 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: direction === 'up' ? -6 : 6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: direction === 'up' ? 'auto' : 'calc(100% + 6px)',
              bottom: direction === 'up' ? 'calc(100% + 5px)' : 'auto',
              left: 0,
              right: 0,
              maxHeight: direction === 'up' ? (compact ? 88 : 140) : 180,
              overflowY: 'auto',
              background: 'var(--bg-card)',
              border: '1px solid var(--edge-strong)',
              borderRadius: 10,
              padding: '4px',
              boxShadow: 'var(--shadow-blade)',
              zIndex: 100,
              scrollbarWidth: 'none'
            }}
          >
            {languages.map((lang) => {
              const active = lang.code === (language || 'system')
              return (
                <button
                  key={lang.code}
                  type="button"
                  data-active={active ? 'true' : 'false'}
                  onClick={() => {
                    playButtonClickSound()
                    patch({ language: lang.code })
                    setIsOpen(false)
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: compact ? '5px 8px' : '7px 10px',
                    borderRadius: 7,
                    background: active ? 'var(--bg-card-hover)' : 'transparent',
                    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontSize: compact ? 11.5 : 12,
                    fontWeight: active ? 600 : 400,
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.12s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.background = 'var(--bg-card-hover)'
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <span>{getLangLabel(lang)}</span>
                  {active && <span style={{ color: '#4caf50', fontSize: 13, fontWeight: 700 }}>✓</span>}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
