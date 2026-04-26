import React from 'react';
import QAList from './QAChecklist';
import QuickQA from './QuickQA';

const QAPage = () => {
  return (
    <div>
      <h1>Quality Assurance for nhl-bracket</h1>
      <hr />
      <QAList />
      <hr />
      <QuickQA />
    </div>
  );
};

export default QAPage;