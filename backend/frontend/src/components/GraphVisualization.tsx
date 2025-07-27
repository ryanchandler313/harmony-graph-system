import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Network } from 'vis-network';

// Simple DataSet implementation for vis-network
class SimpleDataSet {
  private data: any[] = [];

  constructor(initialData: any[] = []) {
    this.data = [...initialData];
  }

  add(item: any) {
    if (Array.isArray(item)) {
      this.data.push(...item);
    } else {
      this.data.push(item);
    }
  }

  clear() {
    this.data = [];
  }

  get() {
    return this.data;
  }
}

interface QueryResult {
  data: any[];
  summary: any;
}

const GraphVisualization: React.FC = () => {
  const [query, setQuery] = useState('MATCH (n) RETURN n LIMIT 10');
  const [results, setResults] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const networkRef = useRef<HTMLDivElement>(null);
  const networkInstance = useRef<Network | null>(null);

  useEffect(() => {
    if (networkRef.current && !networkInstance.current) {
      const nodes = new SimpleDataSet([]);
      const edges = new SimpleDataSet([]);
      
      const data = { nodes, edges };
      const options = {
        nodes: {
          shape: 'dot',
          size: 30,
          font: {
            size: 12,
            color: 'white'
          },
          borderWidth: 2,
          shadow: true
        },
        edges: {
          width: 2,
          shadow: true,
          arrows: { to: { enabled: true, scaleFactor: 1, type: 'arrow' } }
        },
        physics: {
          enabled: true,
          stabilization: { iterations: 200 }
        },
        interaction: {
          dragNodes: true,
          dragView: true,
          zoomView: true
        }
      };
      
      networkInstance.current = new Network(networkRef.current, data, options);
    }

    return () => {
      if (networkInstance.current) {
        networkInstance.current.destroy();
        networkInstance.current = null;
      }
    };
  }, []);

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const executeQuery = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:2233/api/cypher', { query }, getAuthHeaders());
      setResults(response.data);
      visualizeResults(response.data.data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Query execution failed');
    } finally {
      setLoading(false);
    }
  };

  const visualizeResults = (data: any[]) => {
    if (!networkInstance.current) return;

    const nodes = new SimpleDataSet();
    const edges = new SimpleDataSet();
    const nodeIds = new Set();

    data.forEach((record, index) => {
      Object.keys(record).forEach(key => {
        const value = record[key];
        
        if (value && typeof value === 'object' && value.identity) {
          if (value.labels) {
            if (!nodeIds.has(value.identity)) {
              nodes.add({
                id: value.identity,
                label: value.properties.name || value.properties.id || value.labels[0] || value.identity,
                title: JSON.stringify(value.properties, null, 2),
                color: getNodeColor(value.labels[0])
              });
              nodeIds.add(value.identity);
            }
          } else if (value.type) {
            edges.add({
              id: value.identity,
              from: value.start,
              to: value.end,
              label: value.type,
              title: JSON.stringify(value.properties, null, 2)
            });
          }
        }
      });
    });

    networkInstance.current.setData({ nodes, edges });
  };

  const getNodeColor = (label: string) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    const hash = label.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const sampleQueries = [
    'MATCH (n) RETURN n LIMIT 10',
    'MATCH (n)-[r]->(m) RETURN n, r, m LIMIT 20',
    'MATCH (n) WHERE labels(n) <> [] RETURN labels(n) as Label, count(n) as Count',
    'MATCH ()-[r]->() RETURN type(r) as Relationship, count(r) as Count',
    'MATCH (n) RETURN n ORDER BY id(n) DESC LIMIT 5'
  ];

  return (
    <div>
      <div className="card">
        <h2>Graph Visualization & Query</h2>
        <p>
          Execute Cypher queries against your Neo4j graph and visualize the results. 
          The graph will automatically render nodes and relationships from your query results.
        </p>
      </div>

      {error && <div className="error" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div className="card">
        <h3 style={{ color: 'white', marginBottom: '1rem' }}>Graph Visualization</h3>
        <div ref={networkRef} className="graph-container" style={{ background: '#1a1a1a', border: '1px solid rgba(255, 255, 255, 0.2)' }}></div>
      </div>

      <div className="card">
        <h3 style={{ color: 'white', marginBottom: '1rem' }}>Cypher Query</h3>
        
        <div className="form-group">
          <label htmlFor="query">Query</label>
          <textarea
            id="query"
            className="query-editor"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your Cypher query here..."
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <button className="btn btn-primary" onClick={executeQuery} disabled={loading}>
            {loading ? 'Executing...' : 'Execute Query'}
          </button>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Sample Queries</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {sampleQueries.map((sampleQuery, index) => (
              <button
                key={index}
                className="btn"
                style={{ fontSize: '0.8rem', padding: '0.5rem' }}
                onClick={() => setQuery(sampleQuery)}
              >
                Sample {index + 1}
              </button>
            ))}
          </div>
        </div>

        {results && (
          <div className="query-results">
            <h4 style={{ color: 'white', marginBottom: '1rem' }}>Query Results</h4>
            
            <div style={{ marginBottom: '1rem', color: 'rgba(255, 255, 255, 0.8)' }}>
              <strong>Records returned:</strong> {results.data.length}
            </div>

            {results.data.length > 0 && (
              <div style={{ overflowX: 'auto' }}>
                <table className="results-table">
                  <thead>
                    <tr>
                      {Object.keys(results.data[0]).map((key) => (
                        <th key={key}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.data.slice(0, 50).map((record, index) => (
                      <tr key={index}>
                        {Object.keys(record).map((key) => (
                          <td key={key}>
                            {typeof record[key] === 'object' 
                              ? JSON.stringify(record[key], null, 2)
                              : String(record[key])
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {results.data.length > 50 && (
                  <div style={{ color: 'rgba(255, 255, 255, 0.8)', marginTop: '1rem' }}>
                    Showing first 50 results of {results.data.length} total
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GraphVisualization;