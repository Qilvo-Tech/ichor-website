export function countVisit(): void {
  if (
    !import.meta.env.PROD ||
    window.location.hostname !== 'ichor.qilvo.games' ||
    navigator.doNotTrack === '1' ||
    ('globalPrivacyControl' in navigator && navigator.globalPrivacyControl === true)
  ) {
    return
  }

  void fetch('/api/visits', {
    method: 'POST',
    credentials: 'omit',
    referrerPolicy: 'no-referrer',
    cache: 'no-store',
    keepalive: true,
  }).catch(() => {})
}
