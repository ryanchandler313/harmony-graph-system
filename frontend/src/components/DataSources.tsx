import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface DataSource {
  id: string;
  name: string;
  server: string;
  database: string;
  username: string;
}

const DataSources: React.FC = () => {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    server: '',
    database: '',
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchDataSources();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post('http://localhost:2233/api/datasources', formData, getAuthHeaders());
      setSuccess('Data source added successfully!');
      setFormData({ name: '', server: '', database: '', username: '', password: '' });
      setShowForm(false);
      fetchDataSources();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to add data source');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Data Sources</h2>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add Data Source'}
          </button>
        </div>
        
        <p>
          Connect to your SQL Server databases to begin mapping data to your Neo4j graph. 
          All connection details are securely stored in the graph database.
        </p>
      </div>

      {error && <div className="error" style={{ marginBottom: '1rem' }}>{error}</div>}
      {success && <div className="success" style={{ marginBottom: '1rem' }}>{success}</div>}

      {showForm && (
        <div className="card">
          <h3 style={{ color: 'white', marginBottom: '1rem' }}>Add New Data Source</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Production DB"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="server">Server</label>
                <input
                  type="text"
                  id="server"
                  name="server"
                  value={formData.server}
                  onChange={handleInputChange}
                  placeholder="e.g., localhost\\SQLEXPRESS"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="database">Database</label>
                <input
                  type="text"
                  id="database"
                  name="database"
                  value={formData.database}
                  onChange={handleInputChange}
                  placeholder="Database name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="SQL Server username"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="SQL Server password"
                required
              />
            </div>
            
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Data Source'}
            </button>
          </form>
        </div>
      )}

      {dataSources.length > 0 ? (
        <div className="card">
          <h3 style={{ color: 'white', marginBottom: '1rem' }}>Connected Data Sources</h3>
          {dataSources.map((ds) => (
            <div key={ds.id} className="datasource-item">
              <h3>{ds.name}</h3>
              <p><strong>Server:</strong> {ds.server}</p>
              <p><strong>Database:</strong> {ds.database}</p>
              <p><strong>Username:</strong> {ds.username}</p>
            </div>
          ))}
        </div>
      ) : (
        !showForm && (
          <div className="card">
            <h3 style={{ color: 'white', marginBottom: '1rem' }}>No Data Sources</h3>
            <p>You haven't connected any data sources yet. Click "Add Data Source" to get started.</p>
          </div>
        )
      )}
    </div>
  );
};

export default DataSources;