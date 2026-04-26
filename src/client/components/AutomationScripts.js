import React from 'react';

const AutomationScripts = () => {
  return (
    <div className='automation-scripts'>
      <h2>Automation Scripts for nhl-bracket QA</h2>
      <pre><code class='sh'>#!/bin/bash
# fetchBracketData.sh - Verify bracket data
curl -X GET 'https://api-web.nhle.com/v1/brackets?season=2026' | jq '.games[]'
</code></pre>
      <pre><code class='sh'>#!/bin/bash
# checkSeriesResults.sh - Check series results accuracy
curl -X GET 'https://api-web.nhle.com/v1/series-results?season=2026' | jq '.seriesResults[]'
</code></pre>
      <pre><code class='sh'>#!/bin/bash
# verifyRankings.sh - Verify rankings are up-to-date
curl -X GET 'https://api-web.nhle.com/v1/rankings?season=2026' | jq '.rankings[].teamAbbreviation'
</code></pre>
    </div>
  );
};

export default AutomationScripts;