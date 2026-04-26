import React from 'react';
import './AutomationScriptsListCode.css';

const AutomationScriptsListCode = () => {
  return (
    <div className='automation-scripts-list-code'>
      <h2>Automation Scripts for nhl-bracket QA</h2>
      <ul>
        <li><code>fetchBracketData.sh</code></li>
        <li><code>checkSeriesResults.sh</code></li>
        <li><code>verifyRankings.sh</code></li>
      </ul>
    </div>
  );
};

export default AutomationScriptsListCode;