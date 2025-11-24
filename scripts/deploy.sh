#!/bin/bash

set -e

EC2_USER="ubuntu"
EC2_HOST=$1  # Pasar como argumento
APP_DIR="/home/ubuntu/apps/app-carrito"

if [ -z "$EC2_HOST" ]; then
  echo "❌ Error: EC2_HOST is required"
  echo "Usage: ./deploy.sh <EC2_IP>"
  exit 1
fi

echo "🚀 Starting deployment to $EC2_HOST..."

# SSH y ejecutar comandos
ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} << 'ENDSSH'
  set -e
  
  cd /home/ubuntu/apps/app-carrito
  
  echo "📥 Pulling latest code..."
  git pull origin aws-apiGateway-apiKey-cors-JWT
  
  echo "📦 Installing dependencies..."
  cd auth-service && npm install --production && cd ..
  cd catalog-service && npm install --production && cd ..
  cd cart-service && npm install --production && cd ..
  cd order-service && npm install --production && cd ..
  
  echo "🔄 Reloading services with PM2..."
  pm2 reload auth-service --update-env
  sleep 2
  pm2 reload catalog-service --update-env
  sleep 2
  pm2 reload cart-service --update-env
  sleep 2
  pm2 reload order-service --update-env
  sleep 2
  
  echo "📊 Service status:"
  pm2 list
  
  echo "✅ Deployment complete!"
ENDSSH

echo "🎉 All services deployed successfully!"