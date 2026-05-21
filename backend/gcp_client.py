import os
from google.cloud import container_v1
from google.cloud import billing_v1
import yaml

def load_projects_from_config(config_path="config.yaml"):
    try:
        with open(config_path, "r") as f:
            config = yaml.safe_load(f)
            return config.get("projects", [])
    except Exception as e:
        print(f"Error loading config: {e}")
        return []

class GCPClient:
    def __init__(self):
        # We rely on Application Default Credentials (ADC)
        self.cluster_client = container_v1.ClusterManagerClient()
        self.billing_client = billing_v1.CloudCatalogClient()
    
    def list_clusters(self, project_id):
        # Format: projects/{project}/locations/{location}
        # Using '-' for location means all locations
        parent = f"projects/{project_id}/locations/-"
        clusters = []
        try:
            request = container_v1.ListClustersRequest(parent=parent)
            response = self.cluster_client.list_clusters(request=request)
            for cluster in response.clusters:
                clusters.append({
                    "name": cluster.name,
                    "location": cluster.location,
                    "project_id": project_id,
                    "status": cluster.status.name,
                    "endpoint": cluster.endpoint,
                    "node_pools": [
                        {
                            "name": np.name,
                            "initial_node_count": np.initial_node_count,
                            "machine_type": np.config.machine_type,
                            "disk_size_gb": np.config.disk_size_gb,
                            "disk_type": np.config.disk_type,
                            "autoscaling": {
                                "enabled": np.autoscaling.enabled,
                                "min_node_count": np.autoscaling.min_node_count,
                                "max_node_count": np.autoscaling.max_node_count
                            } if np.autoscaling else None,
                            "locations": np.locations,
                            "version": np.version,
                            "max_pods_per_node": np.max_pods_constraint.max_pods_per_node if np.max_pods_constraint else "Default"
                        } for np in cluster.node_pools
                    ]
                })
        except Exception as e:
            print(f"Error fetching clusters for {project_id}: {e}")
        return clusters

    def get_cluster(self, project_id, location, cluster_name):
        name = f"projects/{project_id}/locations/{location}/clusters/{cluster_name}"
        try:
            return self.cluster_client.get_cluster(name=name)
        except Exception as e:
            print(f"Error fetching cluster {name}: {e}")
            return None

    def get_sku_prices(self):
        # In a real app we would cache this aggressively.
        # We search for Compute Engine SKUs (Service ID: 6F81-5844-456A)
        try:
            # We fetch a subset of SKUs for GKE nodes just to illustrate, 
            # as returning all billing is huge. 
            pass
        except Exception as e:
            print(f"Error fetching SKUs: {e}")
            return []
