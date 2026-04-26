import React from 'react';
import './QAChecklist.css';

const QAList = () => {
  return (
    <div className='qa-checklist'>
      <h2>QA Checklist for nhl-bracket</h2>
      <ul>
        <li><strong>Acceptance Criteria:</strong></li>
        <li>Bracket displays all games correctly.</li>
        <li>Series cards show up-to-date results and standings.</li>
        <li>Rankings reflect latest standings accurately.</li>
        <li>Game detail modal shows correct game info.</li>
        <li>Path to Cup calculation is consistent with rankings.</li>
      </ul>

      <h3>Manual Test Script</h3>
      <ol>
        <li>Verify bracket displays all games in the 2026 season.</li>
        <li>Check series cards for accuracy by comparing against known results.</li>
        <li>Confirm rankings are up-to-date with latest standings.</li>
        <li>Test game detail modal by selecting a specific game and ensuring all details match the API response.</li>
        <li>Ensure path to Cup calculation is correct based on current standings.</li>
      </ol>

      <h3>Minimal Automated Checks (e.g., curl scripts)</h3>
      <ul>
        <li>`curl` script to fetch bracket data: `curl -X GET 'https://api-web.nhle.com/v1/brackets?season=2026' | jq '.games[]'`</li>
        <li>`curl` script to check series results: `curl -X GET 'https://api-web.nhle.com/v1/series-results?season=2026' | jq '.seriesResults[]'`</li>
        <li>`curl` script to verify rankings: `curl -X GET 'https://api-web.nhle.com/v1/rankings?season=2026' | jq '.rankings[].teamAbbreviation'`</li>
      </ul>
    </div>
  );
};

export default QAList;