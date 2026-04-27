#!/bin/bash
set -e

BUCKET="guilford-ctis-portal-frontend"
REGION="us-east-1"

echo "==> Building React frontend..."
cd frontend
npm install
npm run build
cd ..

echo "==> Syncing build to S3..."
aws s3 sync frontend/dist/ s3://$BUCKET/ \
  --region $REGION \
  --delete \
  --cache-control "max-age=31536000,immutable" \
  --exclude "index.html"

aws s3 cp frontend/dist/index.html s3://$BUCKET/index.html \
  --region $REGION \
  --cache-control "no-cache,no-store,must-revalidate"

echo "==> Invalidating CloudFront cache..."
DIST_ID=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?Comment=='Guilford CTIS Academic Portal'].Id" \
  --output text)

if [ -n "$DIST_ID" ]; then
  aws cloudfront create-invalidation \
    --distribution-id "$DIST_ID" \
    --paths "/*"
  echo "==> Cache invalidated for distribution: $DIST_ID"
else
  echo "==> Warning: Could not find CloudFront distribution. Invalidate manually if needed."
fi

echo ""
echo "===> Deployment complete! Your portal is live at:"
aws cloudfront list-distributions \
  --query "DistributionList.Items[?Comment=='Guilford CTIS Academic Portal'].DomainName" \
  --output text | awk '{print "    https://" $1}'