# Лаб 9 — Minikube орчинд Deployment, Service үүсгэх

Branch: `lab9-k8s` (`lab8-docker` дээр суурилсан)

## Юу хийсэн

1. `minikube start --driver=docker` командаар локал Kubernetes cluster
   (v1.37.0) эхлүүлсэн.
2. Лаб 8-д бүтээсэн `team10-realestate-api:1.1` image-ийг
   `minikube image load`-оор cluster-т оруулсан. Image нь registry-д байхгүй тул
   Deployment-д `imagePullPolicy: Never` тохируулсан.
3. [k8s/deployment.yaml](../../k8s/deployment.yaml) — `replicas: 3`, `/health`
   дээр readiness ба liveness probe, CPU/санах ойн хязгаартай.
4. [k8s/service.yaml](../../k8s/service.yaml) — `NodePort` төрлийн Service
   (`80` → контейнерийн `3000`, node порт `30080`).
5. `kubectl apply` хийж 3 Pod `Running` болсныг шалгасан.
6. Нэг Pod-ийг устгаж, Kubernetes автоматаар шинэ Pod үүсгэснийг (self-healing)
   ажигласан.

## Ашигласан командууд

```powershell
minikube start --driver=docker
kubectl get nodes

# Локал image-ийг cluster-т оруулах
minikube image load team10-realestate-api:1.1
minikube image ls

# Хэрэгжүүлэх
kubectl apply -f k8s/deployment.yaml -f k8s/service.yaml
kubectl rollout status deployment/realestate-api
kubectl get deployment realestate-api
kubectl get pods -o wide
kubectl get service realestate-api

# Self-healing
kubectl get pods
kubectl delete pod realestate-api-699b97cdb4-6hkl2
kubectl get pods

# Браузераар хандах
minikube service realestate-api
```

## Үр дүн

- `kubectl get pods` — 3 Pod `1/1 Running` (`01-pods-running.png`).
- Service-ээр дамжуулан `/health` дуудахад хариуны `hostname` талбарт өөр өөр
  Pod-ийн нэр гарч байсан, өөрөөр хэлбэл хүсэлтүүд Pod-уудад хуваарилагдаж байна.
- `realestate-api-699b97cdb4-6hkl2` Pod-ийг устгасны дараа 2 секундын дотор
  `realestate-api-699b97cdb4-2ts4c` нэртэй шинэ Pod үүссэн, үлдсэн хоёр Pod
  хэвээр ажилласан (`02-self-healing.png`). Шинэ Pod эхэндээ `0/1` байгаа нь
  readiness probe хараахан амжилттай болоогүйг харуулна; хэдэн секундын дараа
  `1/1 Running` болсон.

## Хүлээлгэж өгөх зүйл

| Файл | Тайлбар |
|---|---|
| [k8s/deployment.yaml](../../k8s/deployment.yaml) | 3 replica-тай Deployment |
| [k8s/service.yaml](../../k8s/service.yaml) | NodePort Service |
| [01-pods-running.png](01-pods-running.png) | Deployment 3/3, 3 Pod Running, Service |
| [02-self-healing.png](02-self-healing.png) | Pod устгасны дараа шинэ Pod автоматаар үүссэн |

## Тайланд оруулах тайлбар

Лаб 8-д бүтээсэн Docker image-ийг `minikube image load` командаар локал
Kubernetes cluster-т оруулж, 3 replica-тай Deployment болон NodePort төрлийн
Service-ийг YAML файлаар тодорхойлон `kubectl apply` командаар хэрэгжүүлсэн.
Image нь зөвхөн локал байгаа тул `imagePullPolicy: Never` гэж тохируулсан.
`kubectl get pods` командаар 3 Pod бүгд `Running` төлөвт байгааг шалгасан. Дараа
нь нэг Pod-ийг `kubectl delete pod` командаар санаатайгаар устгахад Deployment-ийн
ReplicaSet хүссэн тоо (3) ба бодит тоо (2)-ны зөрүүг илрүүлж, 2 секундын дотор
шинэ Pod автоматаар үүсгэсэн. Энэ нь Kubernetes-ийн self-healing чадвар буюу
зарласан төлөвийг (desired state) байнга сахидгийг харуулж байна.
