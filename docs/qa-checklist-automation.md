## Automation Scripts for nhl-bracket QA

### Minimal Automated Checks (e.g., curl scripts)
- `fetchBracketData.sh`: Fetches bracket data and verifies games.
  ```sh
  #!/bin/bash
  curl -X GET 'https://api-web.nhle.com/v1/brackets?season=2026' | jq '.games[]'
  ````
- `checkSeriesResults.sh`: Checks series results accuracy.
  ```sh
  #!/bin/bash
  curl -X GET 'https://api-web.nhle.com/v1/series-results?season=2026' | jq '.seriesResults[]'
  ````
- `verifyRankings.sh`: Verifies rankings are up-to-date.
  ```sh
  #!/bin/bash
  curl -X GET 'https://api-web.nhle.com/v1/rankings?season=2026' | jq '.rankings[].teamAbbreviation'
  ````

These scripts can be run periodically to ensure the application is functioning as expected without a full test framework.