from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from gcp_client import GCPClient, load_projects_from_config
from k8s_client import K8sClient
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

gcp_client = GCPClient()
k8s_client = K8sClient()

@app.get("/api/projects")
def get_projects():
    return load_projects_from_config()

@app.get("/api/clusters")
def get_all_clusters():
    projects = load_projects_from_config()
    all_clusters = []
    for p in projects:
        clusters = gcp_client.list_clusters(p)
        all_clusters.extend(clusters)
    return all_clusters

@app.get("/api/clusters/{project_id}/{location}/{cluster_name}/nodes")
def get_cluster_nodes(project_id: str, location: str, cluster_name: str):
    cluster = gcp_client.get_cluster(project_id, location, cluster_name)
    if not cluster:
        raise HTTPException(status_code=404, detail="Cluster not found")
        
    api_client = k8s_client.get_api_client(cluster)
    nodes = k8s_client.get_nodes(api_client)
    
    node_metrics = k8s_client.get_node_metrics(api_client)
    metrics_by_node = {m['metadata']['name']: m['usage'] for m in node_metrics}
    
    result = []
    for node in nodes:
        name = node.metadata.name
        # extract nodepool from labels
        labels = node.metadata.labels or {}
        nodepool = labels.get('cloud.google.com/gke-nodepool', 'default-pool')
        
        usage = metrics_by_node.get(name, {})
        
        result.append({
            "name": name,
            "nodepool": nodepool,
            "labels": labels,
            "status": "Ready" if any(c.type == "Ready" and c.status == "True" for c in node.status.conditions) else "NotReady",
            "capacity": {
                "cpu": node.status.capacity.get("cpu"),
                "memory": node.status.capacity.get("memory")
            },
            "allocatable": {
                "cpu": node.status.allocatable.get("cpu"),
                "memory": node.status.allocatable.get("memory")
            },
            "usage": usage
        })
    return result

@app.get("/api/clusters/{project_id}/{location}/{cluster_name}/pods")
def get_cluster_pods(project_id: str, location: str, cluster_name: str):
    cluster = gcp_client.get_cluster(project_id, location, cluster_name)
    if not cluster:
        raise HTTPException(status_code=404, detail="Cluster not found")
        
    api_client = k8s_client.get_api_client(cluster)
    pods = k8s_client.get_pods(api_client)
    pod_metrics = k8s_client.get_pod_metrics(api_client)
    
    metrics_by_pod = {f"{m['metadata']['namespace']}/{m['metadata']['name']}": m for m in pod_metrics}
    
    result = []
    for pod in pods:
        name = pod.metadata.name
        ns = pod.metadata.namespace
        node_name = pod.spec.node_name
        
        key = f"{ns}/{name}"
        usage = metrics_by_pod.get(key, {})
        # sum container usage if possible
        cpu_usage = 0
        mem_usage_ki = 0
        if 'containers' in usage:
            for c in usage['containers']:
                c_cpu = c['usage'].get('cpu', '0')
                c_mem = c['usage'].get('memory', '0Ki')
                # parsing logic could be complex, simple representation here
                
        result.append({
            "name": name,
            "namespace": ns,
            "node_name": node_name,
            "status": pod.status.phase,
            "metrics": usage
        })
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
