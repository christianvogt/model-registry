#!/usr/bin/env bash

# Check for required tools
command -v kubectl >/dev/null 2>&1 || { echo >&2 "kubectl is required but it's not installed. Aborting."; exit 1; }
command -v kustomize >/dev/null 2>&1 || { echo >&2 "kustomize is required but it's not installed. Aborting."; exit 1; }

echo -e "\033[33mWARNING: You must have access to an OpenShift cluster with ODH installed.\033[0m"

# Default values - can be overridden by environment variables
NAMESPACE=${NAMESPACE:-"kubeflow"}
RHOAI_NAMESPACE=${RHOAI_NAMESPACE:-"opendatahub"}

# Model Registry configuration
MODEL_REGISTRY_CONFIG=$(cat <<EOF
{
    "name": "modelRegistry",
    "remoteEntry": "/remoteEntry.js",
    "authorize": true,
    "tls": true,
    "proxy": [{"path": "/model-registry/api", "pathRewrite": "/api"}],
    "service": {"name": "model-registry-ui-service", "namespace": "$NAMESPACE", "port": 8080},
    "local": {"host": "localhost", "port": 8080}
}
EOF
)

# Create namespace if it doesn't exist
if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
    echo -e "\033[32mCreating kubeflow namespace...\033[0m"
    kubectl create namespace "$NAMESPACE"
fi

# Deploy Model Registry UI to cluster
echo -e "\033[32mDeploying Model Registry UI...\033[0m"
pushd ../../manifests/kustomize/options/ui/base
kustomize edit set image model-registry-ui=${IMG_UI}
pushd ../overlays/odh
kustomize edit set namespace "$NAMESPACE"
kubectl apply -n "$NAMESPACE" -k .

# Scale down opendatahub-operator-controller-manager controller
echo -e "\033[33mWARNING: Scaling down the ODH dashboard controller (opendatahub-operator-controller-manager) to 0 replicas...\033[0m"
echo -e "\033[33mThis will temporarily disable the ODH dashboard to prevent conflicts with our deployment.\033[0m"
kubectl scale deployment opendatahub-operator-controller-manager -n openshift-operators --replicas=0

# Create or update ConfigMap for module federation
echo -e "\033[32mUpdating ConfigMap for module federation...\033[0m"

# Get existing module federation ConfigMap if it exists
if kubectl get configmap module-federation-config -n "$RHOAI_NAMESPACE" &> /dev/null; then
    # Get existing config and parse it
    EXISTING_CONFIG=$(kubectl get configmap module-federation-config -n "$RHOAI_NAMESPACE" -o jsonpath='{.data.MODULE_FEDERATION_CONFIG}')
    
    # Check if modelRegistry entry exists
    if echo "$EXISTING_CONFIG" | jq -e '.[] | select(.name == "modelRegistry")' > /dev/null; then
        # Update existing modelRegistry entry
        NEW_CONFIG=$(echo "$EXISTING_CONFIG" | jq -c "map(if .name == \"modelRegistry\" then $MODEL_REGISTRY_CONFIG else . end)")
    else
        # Add new modelRegistry entry
        NEW_CONFIG=$(echo "$EXISTING_CONFIG" | jq -c ". + [$MODEL_REGISTRY_CONFIG]")
    fi
else
    # Create new ConfigMap with initial config
    NEW_CONFIG="[$MODEL_REGISTRY_CONFIG]"
fi

# Apply the updated ConfigMap
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: module-federation-config
  namespace: $RHOAI_NAMESPACE
data:
  MODULE_FEDERATION_CONFIG: |-
$(echo "$NEW_CONFIG" | sed 's/^/    /')
EOF

# Update odh-dashboard deployment
echo -e "\033[32mUpdating odh-dashboard deployment...\033[0m"

# Prepare the patch operations for odh-dashboard deployment
# TEMP: This is a temporary patch to use a pre-built image which consumes the model registry UI module federation API
ODH_DASHBOARD_PATCH_OPS='[
  {
    "op": "replace",
    "path": "/spec/template/spec/containers/0/image",
    "value": "quay.io/christianvogt/odh-dashboard:mf-mr"
  }
]'

# Check if module federation ConfigMap reference exists in odh-dashboard deployment
if ! kubectl get deployment odh-dashboard -n "$RHOAI_NAMESPACE" -o json | jq -e '.spec.template.spec.containers[0].envFrom[] | select(.configMapRef.name == "module-federation-config")' > /dev/null; then
    echo -e "\033[32mAdding ConfigMap reference to odh-dashboard deployment...\033[0m"
    # Add ConfigMap reference to patch operations
    ODH_DASHBOARD_PATCH_OPS=$(echo "$ODH_DASHBOARD_PATCH_OPS" | jq -c '. + [{
      "op": "add",
      "path": "/spec/template/spec/containers/0/envFrom",
      "value": [
        {
          "configMapRef": {
            "name": "module-federation-config"
          }
        }
      ]
    }]')
fi

# Apply the combined patch
kubectl patch deployment odh-dashboard -n "$RHOAI_NAMESPACE" --type=json -p="$ODH_DASHBOARD_PATCH_OPS"

# Scale odh-dashboard to 0 and then back to 1
echo -e "\033[32mScaling odh-dashboard to 0 replicas...\033[0m"
kubectl scale deployment odh-dashboard -n "$RHOAI_NAMESPACE" --replicas=0

echo -e "\033[32mScaling odh-dashboard back to 1 replica...\033[0m"
kubectl scale deployment odh-dashboard -n "$RHOAI_NAMESPACE" --replicas=1

# Wait for deployments to be available
echo -e "\033[32mWaiting for Model Registry UI to be available...\033[0m"
kubectl wait --for=condition=available -n "$NAMESPACE" deployment/model-registry-ui --timeout=1m

echo -e "\033[32mWaiting for ODH Dashboard to be available...\033[0m"
kubectl wait --for=condition=available -n "$RHOAI_NAMESPACE" deployment/odh-dashboard --timeout=1m
