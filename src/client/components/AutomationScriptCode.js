import React from 'react';
import './AutomationScriptCode.css';

const AutomationScriptCode = ({ script }) => {
  return (
    <div className='automation-script-code'>
      <pre><code class='sh'>{script}</code></pre>
    </div>
  );
};

export default AutomationScriptCode;