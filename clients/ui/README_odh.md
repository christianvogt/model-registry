# Model Registry UI for Open Data Hub (ODH)

This guide explains how to deploy the Model Registry UI as a federated module in ODH. The deployment process involves several key components to ensure secure communication and proper integration with the ODH dashboard.

## Deployment Overview

The deployment process involves several key steps:

1. Configuring TLS for secure communication
2. Setting up module federation
3. Integrating with the ODH dashboard

### TLS Configuration

The Model Registry UI is configured to use TLS for secure communication. This is achieved through:

- Service serving certification using OpenShift's built-in certificate management
- Automatic creation of a secret containing the TLS certificate and key
- Mounting of the TLS secret in the deployment
- Configuration of the Model Registry UI deployment to use the TLS certificates

The necessary changes are applied through the ODH overlay in `manifests/kustomize/options/ui/overlays/odh/`:

- `model-registry-ui-service.yaml`: Configures the service to use OpenShift's serving certificate
- `model-registry-ui-deployment.yaml`: Mounts the TLS secret and configures the UI to use HTTPS

### Module Federation

For the Model Registry UI to be loaded as a federated module in the ODH dashboard, a module federation configuration is required. This configuration:

- Defines how the Model Registry UI module should be loaded
- Specifies the remote entry point
- Configures the proxy settings for API communication
- Sets up the necessary environment variables

The configuration is injected into the ODH dashboard through a ConfigMap, which is created and managed by the deployment script.

The module federation configuration is stored in a ConfigMap named `module-federation-config` in the `opendatahub` namespace. You can inspect the configuration using:

```bash
kubectl get configmap module-federation-config -n opendatahub -o jsonpath='{.data.MODULE_FEDERATION_CONFIG}' | jq '.'
```

## Deployment Steps

1. Log in to your OpenShift cluster:
   ```bash
   oc login --token=<your-token> --server=<your-cluster-url>
   ```

2. (Optional) Build and push your own Model Registry UI image:
   ```bash
   # Build the image with Model Registry integration
   STYLE_THEME=default make docker-build
   
   # Push the image to your registry
   make docker-push
   ```

   Note: You can override the default image by setting the `IMG_UI` variable in your `.env.local` file:
   ```bash
   echo "IMG_UI=<your-registry>/model-registry-ui:latest" >> .env.local
   ```

3. Run the `odh-deployment` make target:
   ```bash
   make odh-deployment
   ```

   The script will:
   - Create the necessary namespace (`kubeflow` by default) if it doesn't exist
   - Deploy the Model Registry UI with TLS configuration
   - Create or update the module federation ConfigMap
   - Configure the ODH dashboard to load the Model Registry UI module

4. Wait for the deployments to be available:
   - Model Registry UI
   - ODH Dashboard

## Important Notes

- The frontend must be built with `STYLE_THEME=default` to ensure that the PatternFly theme is properly applied and matches the ODH dashboard's styling
- The deployment script temporarily scales down the ODH dashboard controller to prevent conflicts during deployment
- A pre-built image of the ODH dashboard is used that includes the necessary API integration for the Model Registry UI
  - This is done for the purpose of prototyping

## Additional Resources

- [OpenShift Service Serving Certificates](https://docs.openshift.com/container-platform/latest/security/certificates/service-serving-certificate.html)

