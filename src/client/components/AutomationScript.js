import React from 'react';
import './AutomationScript.css';

const AutomationScript = ({ script }) => {
  return (
    <div className='automation-script'>
      <pre><code class='sh'>{script}</code></pre>
    </div>
  );
};

export default AutomationScript;