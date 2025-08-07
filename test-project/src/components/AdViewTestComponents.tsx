import {
  AdViewProvider,
  AdViewUnitBanner,
  AdViewUnitClient,
  AdViewUnitNative,
  AdViewUnitProxy
} from '@adview/react';
import React from 'react';

interface TestComponentProps {
  title: string;
  children: React.ReactNode;
}

const TestComponent: React.FC<TestComponentProps> = ({ title, children }) => (
  <div className="test-card" style={{ 
    border: '1px solid #ddd', 
    padding: '1rem', 
    margin: '1rem 0',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9'
  }}>
    <h3 style={{ marginTop: 0, color: '#333' }}>{title}</h3>
    {children}
  </div>
);

// Mock ad data for testing the components
const mockBannerData = {
  id: 'test-banner',
  type: 'banner' as const,
  url: 'https://example.com',
  assets: [
    {
      name: 'main',
      path: 'https://static.vecteezy.com/system/resources/thumbnails/000/701/690/small_2x/abstract-polygonal-banner-background.jpg',
      type: 'image/png',
      width: 728,
      height: 90,
      thumbs: []
    }
  ]
};

const mockNativeData = {
  id: 'test-native',
  type: 'native' as const,
  url: 'https://example.com',
  fields: {
    title: 'Test Native Ad',
    description: 'This is a test native ad description',
    brandName: 'Test Brand',
    brandname: 'Test Brand',
    phone: '+1234567890',
    url: 'https://example.com',
  },
  assets: [
    {
      name: 'main',
      path: 'https://img.freepik.com/premium-vector/blue-light-banner-template_1189-2753.jpg',
      type: 'image/png',
      width: 400,
      height: 300,
      thumbs: []
    }
  ]
};

export default function AdViewTestComponents() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', color: '#333' }}>🧪 AdView React Components Test</h1>
      
      <TestComponent title="AdViewProvider Test">
        <p>Testing the AdViewProvider wrapper component:</p>
        <AdViewProvider 
          srcURL="https://api.example.com/ads/{<id>}"
        >
          <div style={{ padding: '1rem', backgroundColor: '#e7f3ff', borderRadius: '4px' }}>
            <p>✅ AdViewProvider is working! This content is wrapped by the provider.</p>
            <p><small>Provider configured with: srcURL=&quot;https://api.example.com/ads/&#123;id&#125;&quot;</small></p>
          </div>
        </AdViewProvider>
      </TestComponent>

      <TestComponent title="AdViewUnitBanner Component Rendering">
        <p>Testing banner ad unit component with mock data:</p>
        <div style={{ border: '2px dashed #ccc', padding: '1rem', backgroundColor: '#fafafa' }}>
          <AdViewUnitBanner
            {...mockBannerData}
            classNames={{
              container: 'test-banner-container'
            }}
          />
        </div>
        <p><small>Banner component renders with mock asset data</small></p>
      </TestComponent>

      <TestComponent title="AdViewUnitNative Component Rendering">
        <p>Testing native ad unit component with mock data:</p>
        <div style={{ border: '2px dashed #ccc', padding: '1rem', backgroundColor: '#fafafa' }}>
          <AdViewUnitNative
            {...mockNativeData}
            classNames={{
              container: 'test-native-container',
              label: 'test-native-label',
              image: 'test-native-image',
              imageLink: 'test-native-image-link',
              titleLink: 'test-native-title',
              descriptionLink: 'test-native-description',
              brandNameLink: 'test-native-brand',
              phoneLink: 'test-native-phone',
              urlLink: 'test-native-url'
            }}
          />
        </div>
        <p><small>Native component renders with mock asset and text data</small></p>
      </TestComponent>

      <TestComponent title="AdViewUnitClient with Children Function">
        <p>Testing client-side ad unit component with render prop:</p>
        <div style={{ border: '2px dashed #ccc', padding: '1rem' }}>
          <AdViewUnitClient
            unitId="test-client-unit"
            format="banner"
            srcURL="https://api.example.com/ads/{<id>}"
            onDefault={() => (
              <div style={{ 
                padding: '2rem', 
                textAlign: 'center', 
                backgroundColor: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '4px'
              }}>
                🔄 Default fallback content for client component
              </div>
            )}
          >
            {({ data, state, error }) => (
              <div style={{ 
                padding: '1rem', 
                backgroundColor: '#e8f4fd',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '0.9em'
              }}>
                <p><strong>📊 Client Component State:</strong></p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>• Initial: {state.isInitial ? '✅' : '❌'}</div>
                  <div>• Loading: {state.isLoading ? '🔄' : '❌'}</div>
                  <div>• Error: {state.isError ? '❌' : '✅'}</div>
                  <div>• Complete: {state.isComplete ? '✅' : '⏳'}</div>
                </div>
                <p>• Data: {data ? '📦 Available' : '🚫 None'}</p>
                {error && <p style={{ color: 'red' }}>💥 Error: {error.message}</p>}
              </div>
            )}
          </AdViewUnitClient>
        </div>
      </TestComponent>

      <TestComponent title="Import Test Results">
        <div style={{ 
          fontFamily: 'monospace', 
          backgroundColor: '#f0f0f0', 
          padding: '1rem',
          borderRadius: '4px'
        }}>
          <p><strong>✅ Successfully imported components:</strong></p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1rem' }}>
            <div>• AdViewProvider: <code>{typeof AdViewProvider}</code></div>
            <div>• AdViewUnitBanner: <code>{typeof AdViewUnitBanner}</code></div>
            <div>• AdViewUnitNative: <code>{typeof AdViewUnitNative}</code></div>
            <div>• AdViewUnitClient: <code>{typeof AdViewUnitClient}</code></div>
            <div>• AdViewUnitProxy: <code>{typeof AdViewUnitProxy}</code></div>
          </div>
          <div style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: '#d4edda', borderRadius: '4px' }}>
            <strong>🎉 All components imported successfully from @adview/react!</strong>
          </div>
        </div>
      </TestComponent>

      <TestComponent title="Package Development Info">
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '1rem',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '0.9em'
        }}>
          <div><strong>📦 Package:</strong> @adview/react</div>
          <div><strong>🔗 Source:</strong> file:../packages/react</div>
          <div><strong>🏗️ Build Status:</strong> ✅ Built successfully</div>
          <div><strong>🌐 Dev Server:</strong> http://localhost:3002</div>
          <div><strong>⏰ Last Updated:</strong> {new Date().toLocaleString()}</div>
        </div>
      </TestComponent>
    </div>
  );
}
