import React from 'react';
import { useEffect } from 'react';
import AutomationScriptDetails from './AutomationScriptDetails';

const AutomationScriptDetailsPage = ({ script }) => {
  useEffect(() => {
    console.log('Rendering Automation Script Details:', script);
  }, [script]);
  return <AutomationScriptDetails script={script} />;
};

export default AutomationScriptDetailsPage;