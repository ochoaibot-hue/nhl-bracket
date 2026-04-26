# NHL Bracket — QA checklist

## Build / deploy smoke
- [ ] `npm run build` succeeds with no errors
- [ ] `npm run preview` starts and loads in browser
- [ ] No console errors on initial load

## Navigation / routing
- [ ] Home route loads (no blank screen)
- [ ] Bracket route loads
- [ ] 404 route (or fallback) behaves reasonably

## Bracket UI
- [ ] Round columns render correctly (no overflow on mobile)
- [ ] Team names/logos not clipped
- [ ] Clicking a matchup selects a winner (if implemented)
- [ ] Selections persist on refresh (if implemented)

## Data
- [ ] If using live data: handles API failure gracefully (error state, retry)
- [ ] If using mock data: data is clearly labeled / easy to swap

## Accessibility
- [ ] Keyboard navigation works for primary actions
- [ ] Focus states visible
- [ ] Color contrast acceptable for text

## Performance / bundle
- [ ] Initial load feels snappy (no huge blocking assets)
- [ ] No obviously massive bundles in `dist/assets`

## Cross-browser quick check
- [ ] Chromium
- [ ] Safari
