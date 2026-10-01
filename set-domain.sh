#!/usr/bin/env bash
# ProofMarket — replace SITE_URL / CONTACT_EMAIL / FORM_ENDPOINT across the whole site in one command.
# 一条命令替换全站的 网址 / 联系邮箱 / 表单地址。可重复运行（会读取 assets/config.js 中的当前值）。
#
# Usage / 用法:
#   ./set-domain.sh --site https://proofmarket.io
#   ./set-domain.sh --site https://proofmarket.io --email hello@proofmarket.io --endpoint https://formspree.io/f/abcdwxyz
#   ./set-domain.sh --endpoint ""        # back to the mailto fallback / 恢复为邮件备用方案
#   ./set-domain.sh --show               # print current values / 显示当前值
# Requires: bash + perl (preinstalled on macOS/Linux; included in Git Bash on Windows).
set -euo pipefail
cd "$(dirname "$0")"
CFG="assets/config.js"
[ -f "$CFG" ] || { echo "Run this from the site folder (assets/config.js not found)"; exit 1; }

cur() { perl -ne 'if (/^\s*'"$1"':\s*"([^"]*)"/) { print $1; exit }' "$CFG"; }
OLD_SITE="$(cur SITE_URL)"; OLD_EMAIL="$(cur CONTACT_EMAIL)"; OLD_EP="$(cur FORM_ENDPOINT)"

NEW_SITE=""; NEW_EMAIL=""; NEW_EP="__unset__"
while [ $# -gt 0 ]; do
  case "$1" in
    --site) NEW_SITE="${2:-}"; shift 2 ;;
    --email) NEW_EMAIL="${2:-}"; shift 2 ;;
    --endpoint) NEW_EP="${2-}"; shift 2 ;;
    --show) echo "SITE_URL=$OLD_SITE"; echo "CONTACT_EMAIL=$OLD_EMAIL"; echo "FORM_ENDPOINT=${OLD_EP:-<empty: mailto fallback>}"; exit 0 ;;
    -h|--help) sed -n '2,12p' "$0"; exit 0 ;;
    *) echo "Unknown option: $1 (see --help)"; exit 1 ;;
  esac
done

FILES=$(find . -type f \( -name '*.html' -o -name '*.xml' -o -name '*.txt' -o -name '*.js' \) -not -path './.git/*')

replace_all() { # $1=old $2=new
  OLD="$1" NEW="$2" perl -pi -e 's/\Q$ENV{OLD}\E/$ENV{NEW}/g' $FILES
}

if [ -n "$NEW_SITE" ]; then
  NEW_SITE="${NEW_SITE%/}"
  [[ "$NEW_SITE" =~ ^https?://[^/]+ ]] || { echo "--site must look like https://your-domain.com"; exit 1; }
  replace_all "$OLD_SITE" "$NEW_SITE"
  HOST="$(echo "$NEW_SITE" | perl -pe 's#^https?://([^/]+).*#$1#')"
  PATHPART="$(echo "$NEW_SITE" | perl -pe 's#^https?://[^/]+##')"
  if [[ -z "$PATHPART" && ! "$HOST" =~ (github\.io|pages\.dev)$ ]]; then
    echo "$HOST" > CNAME; echo "• wrote CNAME ($HOST) for GitHub Pages custom domain"
  else
    rm -f CNAME
  fi
  echo "• SITE_URL: $OLD_SITE → $NEW_SITE"
fi

if [ -n "$NEW_EMAIL" ]; then
  [[ "$NEW_EMAIL" =~ ^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$ ]] || { echo "--email looks invalid"; exit 1; }
  replace_all "$OLD_EMAIL" "$NEW_EMAIL"
  echo "• CONTACT_EMAIL: $OLD_EMAIL → $NEW_EMAIL"
fi

if [ "$NEW_EP" != "__unset__" ]; then
  if [ -n "$NEW_EP" ] && [[ ! "$NEW_EP" =~ ^https:// ]]; then echo "--endpoint must start with https://"; exit 1; fi
  NEW="$NEW_EP" perl -pi -e 's/^(\s*FORM_ENDPOINT:\s*)"[^"]*"/$1"$ENV{NEW}"/' "$CFG"
  echo "• FORM_ENDPOINT: ${OLD_EP:-<empty>} → ${NEW_EP:-<empty: mailto fallback>}"
fi

echo "Done. Current values:"; "$0" --show
