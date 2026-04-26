import React from 'react';
import { useEffect } from 'react';
import AutomationScriptCode from './AutomationScriptCode';

const AutomationScriptCodePage = ({ script }) => {
  useEffect(() => {
    console.log('Rendering Automation Script Code:', script);
  }, [script]);
  return <AutomationScriptCode script={script} />;
};

export default AutomationScriptCodePage;