'use client'

import AdViewTestComponents from "@/components/AdViewTestComponents";
import AdViewTestStatus from "@/components/AdViewTestStatus";
import * as AdView from "@adview/react";
import React from "react";


export default function HomePage() {
  const [selectedView, setSelectedView] = React.useState<string>('components')

  return (
    <div>
      <AdView.Provider srcURL='https://as1.revolvesyndicate.net/b/dynamic/{<id>}'>
        <AdView.Unit unitId="test-unit" format="banner">
          <h1>AdView Test Page</h1>
        </AdView.Unit>
      </AdView.Provider>
      <div className="test-section">
        <h2>🔧 Development Test Suite</h2>
        <p>Test environment for @adview/react package development</p>
        
        <div style={{ marginTop: '1rem' }}>
          <button 
            className="button" 
            onClick={() => setSelectedView('components')}
            style={{ 
              backgroundColor: selectedView === 'components' ? '#007bff' : '#6c757d',
              color: 'white',
              marginRight: '0.5rem'
            }}
          >
            🧪 Components Test
          </button>
          <button 
            className="button" 
            onClick={() => setSelectedView('status')}
            style={{ 
              backgroundColor: selectedView === 'status' ? '#007bff' : '#6c757d',
              color: 'white',
              marginRight: '0.5rem'
            }}
          >
            📊 Import Status
          </button>
        </div>
      </div>

      {selectedView === 'components' && <AdViewTestComponents />}
      {selectedView === 'status' && <AdViewTestStatus />}
    </div>
  )
}
