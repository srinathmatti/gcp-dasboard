import { useState, useEffect } from 'react'
import NodepoolTable from './components/NodepoolTable'
import NodeSelector from './components/NodeSelector'
import PodMetricsTable from './components/PodMetricsTable'

function App() {
  const [clusters, setClusters] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/clusters')
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch clusters");
        return res.json();
      })
      .then(data => {
        setClusters(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error:", err);
        setError("Make sure backend is running and config.yaml is set up.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="dashboard-container">
      <header className="header">
        <h1>GKE Management & Cost Dashboard</h1>
      </header>
      <main className="content">
        {error && <div className="error-banner">{error}</div>}
        
        {loading ? (
          <div className="loading">Loading clusters across all projects...</div>
        ) : (
          <NodepoolTable 
            clusters={clusters} 
            onSelectCluster={(cluster) => {
              setSelectedCluster(cluster);
              setSelectedNodes([]); // reset node selection
            }} 
          />
        )}

        {selectedCluster && (
          <div className="detail-section">
            <NodeSelector 
              cluster={selectedCluster} 
              onNodesSelected={setSelectedNodes} 
            />
            
            <PodMetricsTable 
              cluster={selectedCluster}
              selectedNodes={selectedNodes}
            />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
