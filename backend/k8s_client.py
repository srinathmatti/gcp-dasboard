import os
import google.auth
from google.auth.transport.requests import Request
from kubernetes import client
from kubernetes.client import ApiClient, Configuration

class K8sClient:
    def __init__(self):
        pass

    def get_api_client(self, cluster):
        # Create a kubernetes ApiClient authenticated to the GKE cluster
        credentials, project = google.auth.default(
            scopes=['https://www.googleapis.com/auth/cloud-platform']
        )
        credentials.refresh(Request())

        configuration = Configuration()
        configuration.host = f"https://{cluster.endpoint}"
        configuration.verify_ssl = False # For simplicity in local testing; in prod, provide CA cert
        configuration.api_key = {"authorization": "Bearer " + credentials.token}

        api_client = ApiClient(configuration)
        return api_client

    def get_node_metrics(self, api_client):
        # Uses CustomObjectsApi to fetch metrics.k8s.io
        custom_api = client.CustomObjectsApi(api_client)
        try:
            metrics = custom_api.list_cluster_custom_object(
                group="metrics.k8s.io",
                version="v1beta1",
                plural="nodes"
            )
            return metrics.get("items", [])
        except Exception as e:
            print(f"Error fetching node metrics: {e}")
            return []

    def get_pod_metrics(self, api_client):
        custom_api = client.CustomObjectsApi(api_client)
        try:
            metrics = custom_api.list_cluster_custom_object(
                group="metrics.k8s.io",
                version="v1beta1",
                plural="pods"
            )
            return metrics.get("items", [])
        except Exception as e:
            print(f"Error fetching pod metrics: {e}")
            return []

    def get_nodes(self, api_client):
        core_api = client.CoreV1Api(api_client)
        try:
            return core_api.list_node().items
        except Exception as e:
            print(f"Error fetching nodes: {e}")
            return []
            
    def get_pods(self, api_client):
        core_api = client.CoreV1Api(api_client)
        try:
            return core_api.list_pod_for_all_namespaces().items
        except Exception as e:
            print(f"Error fetching pods: {e}")
            return []
