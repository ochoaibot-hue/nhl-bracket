import React from 'react';
import './AutomationScriptList.css';

const AutomationScriptList = ({ scripts }) => {
  return (
    <div className='automation-script-list'>
      <h2>Automation Scripts for nhl-bracket QA</h2>
      <ul>
        {scripts.map((script) => (
          <li key={script.id}><code>{script.name}</code></li>
        ))}
      </ul>
    </div>
  );
};

export default AutomationScriptList;