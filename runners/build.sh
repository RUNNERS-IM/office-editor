#!/bin/sh
# RUNNERS 판 빌드: runners.im/tools/word · excel · ppt 가 iframe 으로 띄우는 편집기 묶음을 dist/ 에 만든다.
# 원래 빌드(bin/build.sh) 앞뒤로 아래 일을 더한다.
#   앞: x2t 변환기(x2t.wasm.br)의 압축을 풀어 x2t.wasm 으로 둔다. GitHub Pages 는 Content-Encoding 헤더를 붙일 수 없어
#       .br 그대로는 브라우저가 wasm 으로 읽지 못한다. 대신 Pages 가 wasm 을 gzip 으로 보내 주므로 받는 양은 비슷하다(약 10MB).
#   뒤: 첫 화면 · 404 는 runners.im 도구로 넘기고, 검색에 걸리지 않게 하고, Pages 주소(CNAME)를 적는다.
set -e
cd "$(dirname "$0")/.."

X2T=public/sdkjs/common/wasm/x2t
node -e "
const z=require('node:zlib'),fs=require('node:fs');
const w=z.brotliDecompressSync(fs.readFileSync('$X2T/x2t.wasm.br'));
if(!w.subarray(0,4).equals(Buffer.from([0,97,115,109])))throw new Error('x2t 압축을 푼 내용이 wasm 이 아닙니다');
fs.writeFileSync('$X2T/x2t.wasm',w);console.log('x2t.wasm',w.length,'bytes');"

sh ./bin/build.sh

rm -f dist/sdkjs/common/wasm/x2t/x2t.wasm.br dist/sitemap.xml dist/llms.txt dist/llms-full.txt dist/_headers dist/_redirects
REDIRECT='<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><title>RUNNERS</title><script>location.replace("https://runners.im/tools/word")</script><a href="https://runners.im/tools/word">runners.im/tools/word</a>'
echo "$REDIRECT" > dist/index.html
echo "$REDIRECT" > dist/404.html
printf 'User-agent: *\nDisallow: /\n' > dist/robots.txt
echo "${PAGES_DOMAIN:-office.runners.im}" > dist/CNAME
touch dist/.nojekyll
echo "RUNNERS 판 빌드 끝: $(du -sh dist | cut -f1)"
