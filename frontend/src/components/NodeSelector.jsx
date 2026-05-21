import React, { useState, useEffect } from 'react';

const NodeSelector = ({ cluster, onNodesSelected }) => {
  const [nodes, setNodes] = useState([]);
  const [selectedNodes, setSelectedNodes] = useState(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!cluster) return;
    setLoading(true);
    // Use the backend API to fetch nodes for the selected cluster
    fetch(`/api/clusters/${cluster.project_id}/${cluster.location}/${cluster.name}/nodes`)
      .then(res => res.json())
      .then(data => {
        setNodes(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching nodes:", err);
        setLoading(false);
      });
  }, [cluster]);

  const toggleNodeSelection = (nodeName) => {
    const newSelection = new Set(selectedNodes);
    if (newSelection.has(nodeName)) {
      newSelection.delete(nodeName);
    } else {
      newSelection.add(nodeName);
    }
    setSelectedNodes(newSelection);
  };

  useEffect(() => {
    onNodesSelected(Array.from(selectedNodes));
  }, [selectedNodes]);

  if (!cluster) return null;

  return (
    <div className="card node-selector-card">
      <h2>Nodes in {cluster.name}</h2>
      {loading ? (
        <p>Loading nodes...</p>
      ) : (
        <div className="node-grid">
          {nodes.map(node => {
            const isSelected = selectedNodes.has(node.name);
            return (
              <div 
                key={node.name} 
                className={`node-card ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleNodeSelection(node.name)}
              >
                <div className="node-header">
                  <strong>{node.name.split('-').slice(-2).join('-')}</strong>
                  <span className={`status-badge ${node.status === 'Ready' ? 'ready' : 'not-ready'}`}>
                    {node.status}
                  </span>
                </div>
                <div className="node-body">
                  <small>Pool: {node.nodepool}</small>
                  <div className="usage-bar">
                    <label>CPU:</label>
                    <span>{node.usage?.cpu || 'N/A'} / {node.allocatable?.cpu}</span>
                  </div>
                  <div className="usage-bar">
                    <label>Mem:</label>
                    <span>{node.usage?.memory || 'N/A'} / {node.allocatable?.memory}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NodeSelector;
