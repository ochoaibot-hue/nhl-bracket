## QA Checklist for nhl-bracket

### Acceptance Criteria
- [ ] Bracket displays all games correctly.
- [ ] Series cards show up-to-date results and standings.
- [ ] Rankings reflect latest standings accurately.
- [ ] Game detail modal shows correct game info.
- [ ] Path to Cup calculation is consistent with rankings.

### Manual Test Script
1. Verify bracket displays all games in the 2026 season.
   - Use test data from `research/api-findings.md` and manually construct a sample query.
2. Check series cards for accuracy by comparing against known results.
3. Confirm rankings are up-to-date with latest standings.
4. Test game detail modal by selecting a specific game and ensuring all details match the API response.
5. Ensure path to Cup calculation is correct based on current standings.

### Minimal Automated Checks (e.g., curl scripts)
- [ ] `curl` script to fetch bracket data: `curl -X GET 'https://api-web.nhle.com/v1/brackets?season=2026' | jq '.games[]'`
- [ ] `curl` script to check series results: `curl -X GET 'https://api-web.nhle.com/v1/series-results?season=2026' | jq '.seriesResults[]'`
- [ ] `curl` script to verify rankings: `curl -X GET 'https://api-web.nhle.com/v1/rankings?season=2026' | jq '.rankings[].teamAbbreviation'`

These checks should ensure the application is functioning as expected without a full test framework.