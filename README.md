# Shopease E-Commerce App

This repository contains a simple e-commerce frontend and backend, ready to be containerized and deployed on a VM.

## Project Structure

- `ecommerce-app/backend` - Node.js/Express backend
- `ecommerce-app/frontend` - React/Vite frontend

## Prerequisites

On the VM, you only need Docker and Git.

Install Docker:

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin git
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER
```

Log out and log back in after the `usermod` step.

No additional Node.js or package installation is required on the VM because the app is containerized.

## Environment Files

Create these files before building containers:

### Backend
File: `ecommerce-app/backend/.env`

```env
JWT_SECRET=your_jwt_secret
DB_HOST=your_rds_host
DB_PORT=3306
DB_USER=your_rds_user
DB_PASSWORD=your_rds_password
DB_NAME=authdb
AUTH_DB_NAME=authdb
ORDER_DB_NAME=ordersdb
CLIENT_ORIGIN=http://localhost:3000
PORT=5000
```

Use one RDS instance with two databases:
- `authdb` for registration/login/user data
- `ordersdb` for order data

### Frontend
File: `ecommerce-app/frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

## Build and Run Containers

Build the backend image:

```bash
cd ecommerce-app/backend
docker build -t shopease-backend .
```

Run the backend container:

```bash
docker run -d --name shopease-backend -p 5000:5000 --env-file .env shopease-backend
```

Build the frontend image:

```bash
cd ../frontend
docker build -t shopease-frontend .
```

Run the frontend container:

```bash
docker run -d --name shopease-frontend -p 3000:3000 --env-file .env shopease-frontend
```

## Check Running Containers

```bash
docker ps
```

## Access from VM Public IP

If the VM has a public IP, open the following ports in the VM's security group and use the public IP to access the app:

- Backend: `http://<VM_PUBLIC_IP>:5000`
- Frontend: `http://<VM_PUBLIC_IP>:3000`

If you are using the frontend in the browser, the frontend app will call the backend at `http://<VM_PUBLIC_IP>:5000/api`.

## Security Group / Firewall Ports

Allow inbound traffic to these ports in your security group:

- `3000/tcp` for the frontend UI
- `5000/tcp` for the backend API

If you want external access only to the frontend, open `3000/tcp` and keep `5000/tcp` restricted to the VM or internal network only.

## View Logs

```bash
docker logs shopease-backend
docker logs shopease-frontend
```

## Stop and Remove Containers

```bash
docker stop shopease-backend shopease-frontend
docker rm shopease-backend shopease-frontend
```

## Push Changes to GitHub

From the repository root:

```bash
git add .
git commit -m "Update deployment docs"
git push origin main
```
