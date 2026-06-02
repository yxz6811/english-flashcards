#!/usr/bin/env bash
# 一键上线到 https://yangxizhe.com/english-flashcards/
set -euo pipefail

SERVER="root@193.134.211.194"
PORT="41326"
REMOTE_DIR="/var/www/english-flashcards"

echo ">>> 上传代码..."
tar \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  --exclude='specs' \
  --exclude='.env.local' \
  -czf - . | ssh -p "$PORT" "$SERVER" "tar -xzf - -C $REMOTE_DIR"

echo ">>> 远程构建并重启..."
ssh -p "$PORT" "$SERVER" <<EOF
set -e
cd $REMOTE_DIR
npm ci
NEXT_PUBLIC_BASE_PATH=/english-flashcards npm run build
pm2 restart english-flashcards --update-env
pm2 save
EOF

echo ">>> 等待服务启动..."
sleep 5
echo ">>> 健康检查..."
curl -fsI https://yangxizhe.com/english-flashcards/study/ | head -n 1 || echo "WARN: 健康检查未通过，请稍后手动访问"
echo ">>> 完成：https://yangxizhe.com/english-flashcards/"
