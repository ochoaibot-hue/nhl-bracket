import React from 'react';
import { useEffect } from 'react';
import AutomationScript from './AutomationScript';

const AutomationScriptPage = ({ script }) => {
  useEffect(() => {
    console.log('Rendering Automation Script:', script);
  }, [script]);
  return <AutomationScript script={script} />;
};

export default AutomationScriptPage;