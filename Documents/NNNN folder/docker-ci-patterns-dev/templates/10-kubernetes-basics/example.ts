/**
 * Kubernetes Basics Patterns
 * Deployment, Service, Ingress, ConfigMap, Secret, HPA manifests as TypeScript constants
 */
import { writeFileSync } from "fs";

// ── Namespace ─────────────────────────────────────────────────────────────────

export const NAMESPACE_MANIFEST = `apiVersion: v1
kind: Namespace
metadata:
  name: myapp
  labels:
    app.kubernetes.io/managed-by: kubectl
`;

// ── ConfigMap ─────────────────────────────────────────────────────────────────

export const CONFIGMAP_MANIFEST = `apiVersion: v1
kind: ConfigMap
metadata:
  name: api-config
  namespace: myapp
data:
  NODE_ENV: production
  PORT: "3000"
  LOG_LEVEL: info
  REDIS_HOST: redis-service
  REDIS_PORT: "6379"
`;

// ── Secret ────────────────────────────────────────────────────────────────────

export const SECRET_MANIFEST = `apiVersion: v1
kind: Secret
metadata:
  name: api-secrets
  namespace: myapp
type: Opaque
# Values are base64-encoded: echo -n 'value' | base64
data:
  DATABASE_URL: cG9zdGdyZXNxbDovL3Bvc3RncmVzOnBhc3NAZGItc2VydmljZTo1NDMyL215YXBw
  JWT_SECRET: eW91ci0yNTYtYml0LXNlY3JldC1oZXJl
  REDIS_PASSWORD: Y2hhbmdlbWU=
# Use stringData for plaintext (k8s will encode automatically):
# stringData:
#   DATABASE_URL: postgresql://postgres:pass@db-service:5432/myapp
`;

// ── Deployment ────────────────────────────────────────────────────────────────

export const DEPLOYMENT_MANIFEST = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  namespace: myapp
  labels:
    app: api
    version: "1.0.0"
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0       # zero-downtime deployment
  template:
    metadata:
      labels:
        app: api
        version: "1.0.0"
    spec:
      containers:
        - name: api
          image: registry.example.com/my-app:1.0.0
          ports:
            - containerPort: 3000
          envFrom:
            - configMapRef:
                name: api-config
            - secretRef:
                name: api-secrets
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 512Mi
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 5
            failureThreshold: 3
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
            failureThreshold: 3
          lifecycle:
            preStop:
              exec:
                command: ["/bin/sh", "-c", "sleep 5"]    # drain connections
      terminationGracePeriodSeconds: 30
`;

// ── Service ───────────────────────────────────────────────────────────────────

export const SERVICE_MANIFEST = `apiVersion: v1
kind: Service
metadata:
  name: api-service
  namespace: myapp
spec:
  selector:
    app: api
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: ClusterIP    # internal only; use LoadBalancer for cloud public IP
`;

// ── Ingress (nginx-ingress) ───────────────────────────────────────────────────

export const INGRESS_MANIFEST = `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ingress
  namespace: myapp
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"
spec:
  tls:
    - hosts:
        - api.example.com
      secretName: api-tls-cert
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api-service
                port:
                  number: 80
`;

// ── HorizontalPodAutoscaler ───────────────────────────────────────────────────

export const HPA_MANIFEST = `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
  namespace: myapp
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300   # wait 5 min before scale-down
`;

// ── PersistentVolumeClaim (for databases) ─────────────────────────────────────

export const PVC_MANIFEST = `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: myapp
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  storageClassName: standard    # use 'gp2' on AWS, 'premium-rwo' on GKE
`;

// ── Manifest types ────────────────────────────────────────────────────────────

export type K8sManifestKind =
  | "namespace"
  | "configmap"
  | "secret"
  | "deployment"
  | "service"
  | "ingress"
  | "hpa"
  | "pvc";

const MANIFEST_MAP: Record<K8sManifestKind, string> = {
  namespace: NAMESPACE_MANIFEST,
  configmap: CONFIGMAP_MANIFEST,
  secret: SECRET_MANIFEST,
  deployment: DEPLOYMENT_MANIFEST,
  service: SERVICE_MANIFEST,
  ingress: INGRESS_MANIFEST,
  hpa: HPA_MANIFEST,
  pvc: PVC_MANIFEST,
};

export function getManifest(kind: K8sManifestKind): string {
  return MANIFEST_MAP[kind];
}

export function writeAllManifests(outputDir = "k8s"): void {
  const allManifests = Object.values(MANIFEST_MAP).join("\n---\n");
  writeFileSync(`${outputDir}/manifests.yaml`, allManifests);
  console.log(`[Kubernetes] Wrote all manifests to ${outputDir}/manifests.yaml`);
  console.log(`[Kubernetes] Apply with: kubectl apply -f ${outputDir}/manifests.yaml`);
}

// ── kustomization.yaml pattern ────────────────────────────────────────────────

export const KUSTOMIZATION = `apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: myapp

resources:
  - namespace.yaml
  - configmap.yaml
  - secret.yaml
  - deployment.yaml
  - service.yaml
  - ingress.yaml
  - hpa.yaml

images:
  - name: registry.example.com/my-app
    newTag: "1.2.3"    # updated by CI: kustomize edit set image ...

commonLabels:
  app.kubernetes.io/part-of: myapp
  app.kubernetes.io/managed-by: kustomize
`;

// ── Demo ──────────────────────────────────────────────────────────────────────

function main() {
  console.log("=== Kubernetes Basics Patterns ===\n");
  console.log("Available manifests:", Object.keys(MANIFEST_MAP).join(", "));
  console.log("\nDeployment manifest (excerpt):");
  console.log(DEPLOYMENT_MANIFEST.slice(0, 300) + "...");
  console.log("\nHPA manifest:");
  console.log(HPA_MANIFEST);
}

main();
