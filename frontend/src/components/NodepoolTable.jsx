import React from 'react';

const NodepoolTable = ({ clusters, onSelectCluster }) => {
  return (
    <div className="card">
      <h2>GKE Clusters & Nodepools</h2>
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Cluster / Project</th>
              <th>Nodepool</th>
              <th>Nodes</th>
              <th>Max Pods</th>
              <th>NodeType</th>
              <th>K8s Version</th>
              <th>Zones</th>
              <th>Autoscaling (Min-Max)</th>
              <th>Boot Disk</th>
              <th>Est. Cost (On-Demand)</th>
              <th>Est. Cost (1yr/3yr CUD)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {clusters.length === 0 ? (
              <tr>
                <td colSpan="12" style={{ textAlign: 'center' }}>No clusters found</td>
              </tr>
            ) : (
              clusters.flatMap((cluster) => 
                cluster.node_pools.map((np, idx) => (
                  <tr key={`${cluster.name}-${np.name}`}>
                    {idx === 0 && (
                      <td rowSpan={cluster.node_pools.length}>
                        <strong>{cluster.name}</strong><br/>
                        <small>{cluster.project_id}</small>
                      </td>
                    )}
                    <td>{np.name}</td>
                    <td>{np.initial_node_count}</td>
                    <td>{np.max_pods_per_node}</td>
                    <td>{np.machine_type}</td>
                    <td>{np.version}</td>
                    <td>{np.locations ? np.locations.join(', ') : cluster.location}</td>
                    <td>
                      {np.autoscaling 
                        ? `${np.autoscaling.min_node_count} - ${np.autoscaling.max_node_count}`
                        : "Disabled"}
                    </td>
                    <td>{np.disk_size_gb}GB {np.disk_type}</td>
                    <td>$TBD/mo</td>
                    <td>$TBD/mo / $TBD/mo</td>
                    <td>
                      <button 
                        className="btn btn-primary"
                        onClick={() => onSelectCluster(cluster)}
                      >
                        View Nodes
                      </button>
                    </td>
                  </tr>
                ))
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NodepoolTable;
