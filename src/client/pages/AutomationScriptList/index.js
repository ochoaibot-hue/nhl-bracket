import React from 'react';
import AutomationScriptList from './AutomationScriptList';

const AutomationScriptListPage = () => {
  return <AutomationScriptList scripts={[{ id: 1, name: 'fetchBracketData.sh' }, { id: 2, name: 'checkSeriesResults.sh' }, { id: 3, name: 'verifyRankings.sh' }]} />;
};

export default AutomationScriptListPage;