import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface DataSource {
  id: string;
  name: string;
  server: string;
  database: string;
}

interface Column {
  name: string;
  type: string;
  nullable: boolean;
}

interface Schema {
  [tableName: string]: Column[];
}

interface Mapping {
  id: string;
  datasourceId: string;
  tableName: string;
  columnName: string;
  nodeLabel: string;
  propertyName: string;
}

const Mapping: React.FC = () => {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [selectedDataSource, setSelectedDataSource] = useState<string>('');
  const [schema, setSchema] = useState<Schema>({});
  const [selectedColumn, setSelectedColumn] = useState<{table: string, column: string} | null>(null);
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [nodeLabel, setNodeLabel] = useState('');
  const [propertyName, setPropertyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchDataSources();
  }, []);

  useEffect(() => {
    if (selectedDataSource) {
      fetchSchema(selectedDataSource);
      fetchMappings(selectedDataSource);
    }
  }, [selectedDataSource]);

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchDataSources = async () => {
    try {
      const response = await axios.get('http://localhost:2233/api/datasources', getAuthHeaders());
      setDataSources(response.data);
    } catch (error) {
      setError('Failed to fetch data sources');
    }
  };

  const fetchSchema = async (datasourceId: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:2233/api/datasources/${datasourceId}/schema`, getAuthHeaders());
      setSchema(response.data);
    } catch (error) {
      setError('Failed to fetch database schema');
    } finally {
      setLoading(false);
    }
  };

  const fetchMappings = async (datasourceId: string) => {
    try {
      const response = await axios.get(`http://localhost:2233/api/mappings/${datasourceId}`, getAuthHeaders());
      setMappings(response.data);
    } catch (error) {
      setError('Failed to fetch mappings');
    }
  };

  const handleColumnSelect = (tableName: string, columnName: string) => {
    setSelectedColumn({ table: tableName, column: columnName });
    setPropertyName(columnName.toLowerCase());
    setNodeLabel(tableName);
  };

  const handleCreateMapping = async () => {
    if (!selectedColumn || !nodeLabel || !propertyName) {
      setError('Please select a column and provide node label and property name');
      return;
    }

    try {
      await axios.post('http://localhost:2233/api/mappings', {
        datasourceId: selectedDataSource,
        tableName: selectedColumn.table,
        columnName: selectedColumn.column,
        nodeLabel,
        propertyName
      }, getAuthHeaders());

      setSuccess('Mapping created successfully!');
      setSelectedColumn(null);
      setNodeLabel('');
      setPropertyName('');
      fetchMappings(selectedDataSource);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create mapping');
    }
  };

  return (
    <div>
      <div className="card">
        <h2>Data Mapping</h2>
        <p>
          Create mappings between your SQL Server columns and Neo4j node properties. 
          Select a data source to begin exploring the schema and creating mappings.
        </p>
      </div>

      {error && <div className="error" style={{ marginBottom: '1rem' }}>{error}</div>}
      {success && <div className="success" style={{ marginBottom: '1rem' }}>{success}</div>}

      <div className="card">
        <div className="form-group">
          <label htmlFor="datasource">Select Data Source</label>
          <select 
            id="datasource"
            value={selectedDataSource}
            onChange={(e) => setSelectedDataSource(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '5px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white'
            }}
          >
            <option value="">Select a data source...</option>
            {dataSources.map((ds) => (
              <option key={ds.id} value={ds.id} style={{ background: '#333' }}>
                {ds.name} ({ds.database})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedDataSource && (
        <div className="mapping-container">
          <div className="card">
            <h3 style={{ color: 'white', marginBottom: '1rem' }}>Database Schema</h3>
            {loading ? (
              <div>Loading schema...</div>
            ) : (
              <div className="schema-tree">
                {Object.keys(schema).map((tableName) => (
                  <div key={tableName} className="table-item">
                    <div className="table-name">{tableName}</div>
                    <div className="columns-list">
                      {schema[tableName].map((column) => (
                        <div
                          key={`${tableName}.${column.name}`}
                          className={`column-item ${selectedColumn?.table === tableName && selectedColumn?.column === column.name ? 'selected' : ''}`}
                          onClick={() => handleColumnSelect(tableName, column.name)}
                        >
                          {column.name} ({column.type})
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h3 style={{ color: 'white', marginBottom: '1rem' }}>Create Mapping</h3>
            {selectedColumn ? (
              <div className="mapping-form">
                <div style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '1rem' }}>
                  Selected: {selectedColumn.table}.{selectedColumn.column}
                </div>
                
                <div className="form-group">
                  <label htmlFor="nodeLabel">Node Label</label>
                  <input
                    type="text"
                    id="nodeLabel"
                    value={nodeLabel}
                    onChange={(e) => setNodeLabel(e.target.value)}
                    placeholder="e.g., Person, Product, Order"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="propertyName">Property Name</label>
                  <input
                    type="text"
                    id="propertyName"
                    value={propertyName}
                    onChange={(e) => setPropertyName(e.target.value)}
                    placeholder="e.g., name, id, email"
                  />
                </div>
                
                <button className="btn btn-primary" onClick={handleCreateMapping}>
                  Create Mapping
                </button>
              </div>
            ) : (
              <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Select a column from the schema to create a mapping.
              </div>
            )}

            {mappings.length > 0 && (
              <div style={{ marginTop: '2rem' }}>
                <h4 style={{ color: 'white', marginBottom: '1rem' }}>Existing Mappings</h4>
                {mappings.map((mapping) => (
                  <div key={mapping.id} style={{ 
                    background: 'rgba(255, 255, 255, 0.05)', 
                    padding: '0.5rem', 
                    borderRadius: '5px', 
                    marginBottom: '0.5rem',
                    color: 'rgba(255, 255, 255, 0.8)'
                  }}>
                    {mapping.tableName}.{mapping.columnName} → {mapping.nodeLabel}.{mapping.propertyName}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Mapping;