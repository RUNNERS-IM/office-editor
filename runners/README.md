# RUNNERS 판

이 저장소는 [ranuts/document](https://github.com/ranuts/document)(AGPL-3.0)를 RUNNERS 가 고친 판이다.
[runners.im/tools/word](https://runners.im/tools/word) · [excel](https://runners.im/tools/excel) · [ppt](https://runners.im/tools/ppt) 가
이 편집기를 iframe 으로 띄운다. 문서는 브라우저 안에서만 열리고 저장되며 어느 서버로도 올라가지 않는다.

## 고친 것 (2026-11-21 부터, `runners` 가지)

- `lib/embed-api.ts`: 끼워 쓰기 명령 `document:new`(빈 문서) · `document:set-theme`(밝은 · 어두운 화면)를 더함. 편집기가 페이지를 다 불러온 뒤 말을 듣기 시작해 `document:ready` 를 못 보내던 경우를 고침
- `lib/document.ts`: 새 문서 이름을 바깥 페이지가 정함
- `lib/onlyoffice-editor.ts`: 아래 상태 막대의 글 언어 · 문서 언어 칸을 숨김. 맞춤법 검사를 꺼 두어 쓸 데가 없는 칸인데, 휴대폰(390)에서 막대를 넘쳐 확대 단추를 화면 밖으로 밀어냈다
- `lib/onlyoffice/guards/chrome.ts`: 좁은 화면(600px 이하)에서 워드 상태 막대의 「여러 쪽 보기」 단추를 숨김. 390 에서 막대가 18px 넘쳐 확대 단추가 잘렸다
- `editor.html`: 주소의 `?theme=dark|light` 로 첫 화면 색을 정함
- `lib/onlyoffice/new-document-language.ts`: 새 문서 · 새 프레젠테이션의 글 언어를 화면 언어로 맞춤. 엔진 안 빈 틀이 워드는 영어(미국), 프레젠테이션은 중국어(중국)로 들어 있었다. 손님이 연 파일의 언어는 바꾸지 않는다
- `lib/onlyoffice/blank-templates.ts` · `public/runners/templates/`: 새 워드 문서를 우리 빈 틀에서 연다. 엔진 안 빈 틀이 중국어판 Word 기본값(等线 10.5pt · 좌우 여백 3.17cm)이었다. 한국어 화면은 맑은 고딕 10pt, 그 밖의 언어는 Calibri 11pt(여백 2.54cm · 단락 뒤 8pt · 1.08줄), 중국어 화면은 엔진 틀 그대로. 두 틀은 엔진 틀 문서를 docx 로 저장해 테마 글꼴 · 기본 크기 · 동아시아 언어 · 여백 · 줄 간격만 바꾼 것이다. 새 PPT 도 같다: 엔진 틀은 테마 글꼴이 等线 Light · 等线, 글 언어가 zh-CN 이었다. 우리 틀(blank-ko.pptx · blank-default.pptx)은 제목 Calibri Light · 본문 Calibri, 한국어 화면은 한글에 맑은 고딕, 글 언어는 ko-KR · en-US 로 바꿨다. 엑셀 새 문서는 엔진 틀이 이미 Calibri 11 이라 그대로 둔다
- `public/web-apps/apps/*/main/locale/ko.json`: 영어로 남아 있던 한국어 화면 문구 809개(엑셀 셀 스타일 이름 · 붙여넣기 메뉴 · 단축키 이름 등)를 한국어판 Office 용어로 옮기고, 원래 번역 중 뜻이 틀린 1,318개(홈 탭 「집」, 핀란드어 「끝」, Product 「제품」 등)를 고침
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
