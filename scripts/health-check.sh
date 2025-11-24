#!/bin/bash

EC2_HOST=$1
SERVICES=("3001" "3002" "3003" "3004")

if [ -z "$EC2_HOST" ]; then
  echo "❌ Error: EC2_HOST is required"
  exit 1
fi

echo "🏥 Running health checks on $EC2_HOST..."

for PORT in "${SERVICES[@]}"; do
  echo "Checking service on port $PORT..."
  
  RESPONSE=$(ssh ubuntu@${EC2_HOST} "curl -s -o /dev/null -w '%{http_code}' http://localhost:${PORT}/health" || echo "000")
  
  if [ "$RESPONSE" = "200" ]; then
    echo "✅ Service on port $PORT is healthy"
  else
    echo "❌ Service on port $PORT is NOT healthy (HTTP $RESPONSE)"
    exit 1
  fi
done

echo "✅ All services are healthy!"