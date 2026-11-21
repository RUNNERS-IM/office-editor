# RUNNERS 판

이 저장소는 [ranuts/document](https://github.com/ranuts/document)(AGPL-3.0)를 RUNNERS 가 고친 판이다.
[runners.im/tools/word](https://runners.im/tools/word) · [excel](https://runners.im/tools/excel) · [ppt](https://runners.im/tools/ppt) 가
이 편집기를 iframe 으로 띄운다. 문서는 브라우저 안에서만 열리고 저장되며 어느 서버로도 올라가지 않는다.

## 고친 것 (2026-11-21 부터, `runners` 가지)

- `lib/embed-api.ts`: 끼워 쓰기 명령 `document:new`(빈 문서) · `document:set-theme`(밝은 · 어두운 화면)를 더함. 편집기가 페이지를 다 불러온 뒤 말을 듣기 시작해 `document:ready` 를 못 보내던 경우를 고침
- `lib/document.ts`: 새 문서 이름을 바깥 페이지가 정함
- `editor.html`: 주소의 `?theme=dark|light` 로 첫 화면 색을 정함
- x2t 변환기: 압축 안 한 `x2t.wasm` 을 받게 바꿈(`x2t_helper.js` · `x2t.worker.js` · `sw.js`). 빌드 때 `x2t.wasm.br` 를 풀어 만든다
- `runners/build.sh`: 위 압축 풀기 + 원래 빌드 + 첫 화면을 runners.im 도구로 넘김
- `.github/workflows/runners-pages.yml`: `runners` 가지에 올리면 GitHub Pages(office.runners.im)로 배포. 원래 저장소의 배포 · 시험 작업은 뺐다

## 빌드

```sh
pnpm install --frozen-lockfile
sh runners/build.sh   # dist/
```

## 라이선스

원래 저장소와 같이 AGPL-3.0 이다. [LICENSE](../LICENSE) · [NOTICE](../NOTICE) 를 보라.
ONLYOFFICE 는 Ascensio System SIA 의 상표이며, 이 판은 ONLYOFFICE 의 공식 제품이 아니다.
