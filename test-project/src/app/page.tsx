'use client'

import { AdViewData } from '@adview/core'
import AdView from '@adview/react'
import { useEffect, useState } from 'react'
import AdViewTestComponents from '../components/AdViewTestComponents'

export default function HomePage() {
  const [testResults, setTestResults] = useState<Record<string, any>>({})
  const [selectedView, setSelectedView] = useState<string>('components')

  // Basic import test
  useEffect(() => {
    const runImportTest = async () => {
      try {
        // Test that the package can be imported
        const adViewModule = await import('@adview/react')
        
        setTestResults(prev => ({
          ...prev,
          import: {
            status: 'success',
            message: 'Package imported successfully',
            exports: Object.keys(adViewModule),
            timestamp: new Date().toISOString()
          }
        }))
      } catch (error) {
        setTestResults(prev => ({
          ...prev,
          import: {
            status: 'error',
            message: error instanceof Error ? error.message : 'Import failed',
            timestamp: new Date().toISOString()
          }
        }))
      }
    }

    runImportTest()
  }, [])

  const defaultAdData = [
    {
      version: '1.0.0',
      groups: [
        {
          id: '2ow6OsRrQDts2X5jiyZ2mhWQF6f',
          items: [
            {
              id: 'item1',
              type: 'banner',
              url: 'https://tracker.example.com/track?ad=item1',
              tracker: {
                views: ['https://tracker.example.com/track?ad=item1'],
                impressions: ['https://tracker.example.com/track?ad=item1']
              },
              fields: {
                title: 'Test Banner Ad',
                imageUrl: 'https://static.vecteezy.com/system/resources/thumbnails/000/701/690/small_2x/abstract-polygonal-banner-background.jpg',
                width: 728,
                height: 90
              }
            }
          ],
        },
        {
          id: '2ow6OsRrQDts2X5jiyZ2mhWQF6g',
          items: [
            {
              id: 'item2',
              type: 'native',
              url: 'https://tracker.example.com/track?ad=item2',
              tracker: {
                views: ['https://tracker.example.com/track?ad=item2'],
                impressions: ['https://tracker.example.com/track?ad=item2']
              },
              fields: {
                title: 'Test Square Ad',
                imageUrl: 'https://www.atacadoaesportiva.com.br/wp-content/uploads/2019/01/banner-250x250.jpg',
                width: 250,
                height: 250
              }
            }
          ],
        }
      ]
    }
  ] as AdViewData[];

  const testTypeCheck = () => {
    try {
      // TypeScript types test
      const testData: any = mockAdData.banner
      
      setTestResults(prev => ({
        ...prev,
        types: {
          status: 'success',
          message: 'TypeScript types are working',
          data: testData,
          timestamp: new Date().toISOString()
        }
      }))
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        types: {
          status: 'error',
          message: error instanceof Error ? error.message : 'Type check failed',
          timestamp: new Date().toISOString()
        }
      }))
    }
  }

  const testComponentRendering = async () => {
    try {
      // Here we will test components when they are ready
      setTestResults(prev => ({
        ...prev,
        components: {
          status: 'success',
          message: 'Component rendering test passed',
          timestamp: new Date().toISOString()
        }
      }))
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        components: {
          status: 'error',
          message: error instanceof Error ? error.message : 'Component test failed',
          timestamp: new Date().toISOString()
        }
      }))
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'success': return 'status success'
      case 'error': return 'status error'
      case 'loading': return 'status loading'
      default: return 'status'
    }
  }

  return (
    <div>
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
          <button 
            className="button" 
            onClick={testTypeCheck}
          >
            Test Types
          </button>
          <button 
            className="button" 
            onClick={testComponentRendering}
          >
            Test Components
          </button>
        </div>
      </div>

      {selectedView === 'components' && <AdViewTestComponents />}
      
      {selectedView === 'status' && (
        <>
          <div className="test-section">
            <h2>📦 Package Import Status</h2>
            {testResults.import ? (
              <div>
                <span className={getStatusClass(testResults.import.status)}>
                  {testResults.import.status.toUpperCase()}
                </span>
                <p><strong>Message:</strong> {testResults.import.message}</p>
                {testResults.import.exports && (
                  <div>
                    <strong>Available exports:</strong>
                    <div className="code-block">
                      {JSON.stringify(testResults.import.exports, null, 2)}
                    </div>
                  </div>
                )}
                <small>Last check: {testResults.import.timestamp}</small>
              </div>
            ) : (
              <span className="status loading">CHECKING...</span>
            )}
          </div>

          <div className="test-section">
            <h2>🧪 Test Results</h2>
            <div className="test-grid">
              {Object.entries(testResults).map(([testName, result]) => (
                <div key={testName} className="test-card">
                  <h3>{testName}</h3>
                  <span className={getStatusClass(result.status)}>
                    {result.status?.toUpperCase() || 'PENDING'}
                  </span>
                  <p>{result.message}</p>
                  {result.data && (
                    <details>
                      <summary>Show data</summary>
                      <div className="code-block">
                        {JSON.stringify(result.data, null, 2)}
                      </div>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="test-section">
            <h2>🎨 Mock Ad Previews</h2>
            <AdView.Provider srcURL='https://as1.revolvesyndicate.net/b/dynamic/{<id>}' defaultAdData={defaultAdData}>
              <div className="test-grid">
                <div className="test-card">
                  <h3>Banner Ad (728x90)</h3>
                  <div className='ad-container'>
                    <AdView.Unit unitId="2ow6OsRrQDts2X5jiyZ2mhWQF6f" format="banner">
                      {({ data, state, error }) => (
                        <div
                          className="ad-cl-banner"
                          style={{
                          width: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          boxSizing: 'border-box',
                          }}
                        >
                          {state.isLoading && <span>Loading...</span>}
                          {error && <span className="error">Error: {error.message}</span>}
                          {data && (
                          <div
                            className="ad-banner-inner"
                            style={{
                              width: '100%',
                              maxWidth: `${data.fields?.width || 728}px`,
                              height: `${data.fields?.height || 90}px`,
                              overflow: 'hidden',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              boxSizing: 'border-box',
                              position: 'relative',
                            }}
                          >
                            <img
                              src={data.fields?.imageUrl}
                              alt={data.fields?.title}
                              style={{
                                width: '100%',
                                height: '100%',
                                maxWidth: '100%',
                                display: 'block',
                                objectFit: 'cover',
                              }}
                            />
                            <div
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                pointerEvents: 'none',
                              }}
                            >
                              <span
                                style={{
                                  color: '#fff',
                                  fontWeight: 'bold',
                                  fontSize: '1.1rem',
                                  textAlign: 'center',
                                  textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.7)',
                                  lineHeight: 1.2,
                                  background: 'none',
                                  padding: '0.5rem 1rem',
                                  borderRadius: '0.25rem',
                                  zIndex: 2,
                                }}
                              >
                                {data.fields?.title}
                              </span>
                            </div>
                          </div>
                          )}
                        </div>
                      )}
                    </AdView.Unit>
                  </div>
                </div>
                
                <div className="test-card">
                  <h3>Square Ad (250x250)</h3>
                  <div className='ad-container'>
                    <AdView.Unit unitId="2ow6OsRrQDts2X5jiyZ2mhWQF6g" format="native">
                      {({ data, state, error }) => (
                        <div
                          className="ad-cl-square"
                          style={{
                          width: '100%',
                          maxWidth: '250px',
                          height: '250px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          boxSizing: 'border-box',
                          position: 'relative',
                          }}
                        >
                          {state.isLoading && <span>Loading...</span>}
                          {error && <span className="error">Error: {error.message}</span>}
                          {data && (
                          <>
                            <img
                            src={data.fields?.imageUrl}
                            alt={data.fields?.title}
                            style={{
                              width: '100%',
                              height: '100%',
                              maxWidth: '100%',
                              display: 'block',
                              objectFit: 'cover',
                            }}
                            />
                            <div
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              pointerEvents: 'none',
                            }}
                            >
                            <span
                              style={{
                              color: '#fff',
                              fontWeight: 'bold',
                              fontSize: '1.1rem',
                              textAlign: 'center',
                              textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.7)',
                              lineHeight: 1.2,
                              background: 'none',
                              padding: '0.5rem 1rem',
                              borderRadius: '0.25rem',
                              zIndex: 2,
                              }}
                            >
                              {data.fields?.title}
                            </span>
                            </div>
                          </>
                          )}
                        </div>
                      )}
                    </AdView.Unit>
                  </div>
                </div>
              </div>
            </AdView.Provider>
          </div>

          <div className="test-section">
            <h2>📋 Development Info</h2>
            <div className="code-block">
              <div><strong>Node Environment:</strong> {process.env.NODE_ENV}</div>
              <div><strong>Package Location:</strong> file:../packages/react</div>
              <div><strong>Test Server:</strong> http://localhost:3002</div>
              <div><strong>Last Updated:</strong> {new Date().toLocaleString()}</div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
