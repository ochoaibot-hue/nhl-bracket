import React from 'react';
import './AutomationScriptDetails.css';

const AutomationScriptDetails = ({ script }) => {
  return (
    <div className='automation-script-details'>
      <h2>Automation Script Details for nhl-bracket QA</h2>
      <pre><code class='sh'>{script}</code></pre>
    </div>
  );
};

export default AutomationScriptDetails;