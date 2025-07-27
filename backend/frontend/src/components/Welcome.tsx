import React from 'react';

interface WelcomeProps {
  user: {
    id: string;
    username: string;
  };
}

const Welcome: React.FC<WelcomeProps> = ({ user }) => {
  return (
    <div>
      <div className="card">
        <h2>Welcome to HarmonyGraph, {user.username}!</h2>
        <p>
          HarmonyGraph is a powerful data mapping and visualization platform that connects your SQL Server databases 
          to Neo4j graph databases. Transform your relational data into meaningful graph relationships and explore 
          them with intuitive visualizations.
        </p>
      </div>

      <div className="grid">
        <div className="card">
          <h3 style={{ color: 'white', marginBottom: '1rem' }}>🔗 Connect Data Sources</h3>
          <p>
            Start by connecting to your SQL Server databases. You can add multiple data sources 
            and HarmonyGraph will securely store your connection details in the Neo4j graph.
          </p>
          <a href="/datasources" className="btn" style={{ display: 'inline-block', marginTop: '1rem' }}>
            Manage Data Sources
          </a>
        </div>

        <div className="card">
          <h3 style={{ color: 'white', marginBottom: '1rem' }}>🎯 Map Your Data</h3>
          <p>
            Create visual mappings between your SQL Server columns and Neo4j nodes and properties. 
            Define relationships and transform your tabular data into graph structures.
          </p>
          <a href="/mapping" className="btn" style={{ display: 'inline-block', marginTop: '1rem' }}>
            Create Mappings
          </a>
        </div>

        <div className="card">
          <h3 style={{ color: 'white', marginBottom: '1rem' }}>📊 Visualize & Query</h3>
          <p>
            Explore your graph data with interactive visualizations. Execute Cypher queries 
            and see the results rendered in real-time graph networks.
          </p>
          <a href="/graph" className="btn" style={{ display: 'inline-block', marginTop: '1rem' }}>
            Open Graph Explorer
          </a>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ color: 'white', marginBottom: '1rem' }}>🚀 Getting Started</h3>
        <ol style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.8' }}>
          <li>Connect to your SQL Server database in the Data Sources section</li>
          <li>Browse your database schema and select tables to map</li>
          <li>Create mappings between SQL columns and Neo4j node properties</li>
          <li>Use the Graph Explorer to visualize and query your transformed data</li>
        </ol>
      </div>
    </div>
  );
};

export default Welcome;