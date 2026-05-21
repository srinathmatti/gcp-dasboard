import React, { useState, useEffect } from 'react';

const PodMetricsTable = ({ cluster, selectedNodes }) => {
  const [pods, setPods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const fetchPods = () => {
    if (!cluster || selectedNodes.length === 0) return;
    setLoading(true);
    fetch(`/api/clusters/${cluster.project_id}/${cluster.location}/${cluster.name}/pods`)
      .then(res => res.json())
      .then(data => {
        // Filter pods to only those running on selected nodes
        const filteredPods = data.filter(pod => selectedNodes.includes(pod.node_name));
        setPods(filteredPods);
        setLastRefreshed(new Date().toLocaleTimeString());
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching pods:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPods();
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchPods();
    }, 30000);
    return () => clearInterval(interval);
  }, [cluster, selectedNodes]);

  if (!cluster || selectedNodes.length === 0) return null;

  return (
    <div className="card">
      <div className="flex-header">
        <h2>Pod Metrics (Auto-refresh 30s)</h2>
        {lastRefreshed && <small className="text-secondary">Last updated: {lastRefreshed}</small>}
      </div>
      
      {loading && pods.length === 0 ? (
        <p>Loading pods...</p>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Pod Name</th>
                <th>Namespace</th>
                <th>Node</th>
                <th>Status</th>
                <th>CPU Usage</th>
                <th>Memory Usage</th>
              </tr>
            </thead>
            <tbody>
              {pods.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>No pods found on selected nodes</td>
                </tr>
              ) : (
                pods.map(pod => {
                  // Calculate total container usage
                  let cpu = 0;
                  let memStr = "0Ki";
                  if (pod.metrics && pod.metrics.containers) {
                    // This is a simplified sum. Real parsing might be needed based on m/n suffix.
                    try {
                      cpu = pod.metrics.containers.reduce((acc, c) => {
                        let cCpu = c.usage.cpu;
                        if (cCpu.endsWith('n')) return acc + parseInt(cCpu.slice(0, -1));
                        if (cCpu.endsWith('m')) return acc + (parseInt(cCpu.slice(0, -1)) * 1000000);
                        return acc;
                      }, 0);
                      cpu = `${cpu}n`;
                      
                      const memSum = pod.metrics.containers.reduce((acc, c) => {
                        let cMem = c.usage.memory;
                        if (cMem.endsWith('Ki')) return acc + parseInt(cMem.slice(0, -2));
                        return acc;
                      }, 0);
                      memStr = `${memSum}Ki`;
                    } catch (e) {
                      cpu = "N/A";
                      memStr = "N/A";
                    }
                  }

                  return (
                    <tr key={`${pod.namespace}-${pod.name}`}>
                      <td>{pod.name}</td>
                      <td>{pod.namespace}</td>
                      <td>{pod.node_name.split('-').slice(-2).join('-')}</td>
                      <td>
                        <span className={`status-badge ${pod.status === 'Running' ? 'ready' : 'not-ready'}`}>
                          {pod.status}
                        </span>
                      </td>
                      <td>{cpu}</td>
                      <td>{memStr}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PodMetricsTable;
