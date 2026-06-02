# Implementation Plan: 期末英语闪卡复习 Web 应用

**Branch**: `001-english-flashcards-web` | **Date**: 2026-06-02 | **Spec**: `/specs/001-english-flashcards-web/spec.md`

**Input**: Feature specification from `/specs/001-english-flashcards-web/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

构建一个面向备考用户的中文界面英语闪卡 Web 应用，核心闭环为“导入词表 → 闪卡判定 → 生词强化 → 庆祝反馈与打卡可视化”。  
实现上采用移动端优先的高交互前端架构，并通过轻量服务层对接 OCR 与 AI 能力，优先交付可离线复习的 MVP（导入、学习、生词流转、撤销、夜间模式）。

## Technical Context

**Language/Version**: TypeScript 5.x、Node.js 20+

**Primary Dependencies**: Next.js (App Router)、React、Tailwind CSS、shadcn/ui、Framer Motion、Zustand、localForage、next-pwa

**Storage**: 本地 IndexedDB（MVP）；后续可扩展 PostgreSQL（云同步阶段）

**Testing**: Vitest + React Testing Library（单元/组件）；Playwright（关键流程 E2E）

**Target Platform**: 现代浏览器（移动端优先，兼容桌面端）

**Project Type**: Web application（前后端同仓，BFF 风格）

**Performance Goals**: 闪卡交互维持 60fps 体感流畅；关键交互操作反馈 < 200ms；首屏可交互时间 < 3s（常规网络）

**Constraints**: 支持离线学习核心流程；UI 文案中文优先；UI 任务默认使用 `ui-ux-pro-max-skill`

**Scale/Scope**: 单用户本地词书 5,000 词级别可用；MVP 覆盖导入、学习、生词本、反馈与基础看板

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

[Gates determined based on constitution file]
- Gate 1（UI 技能统一）：通过。所有 UI 任务在实现与任务拆解中均标注使用 `ui-ux-pro-max-skill`。  
- Gate 2（界面中文统一）：通过。所有用户可见文案默认中文，术语按“特殊单词除外”处理。  
- Gate 3（一致性与可维护性）：通过。要求统一术语表、组件风格和文案语气，并在评审中检查。
- 结论：无阻塞性违例，可进入 Phase 0 与 Phase 1。

## Project Structure

### Documentation (this feature)

```text
specs/001-english-flashcards-web/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)
```text
src/
├── app/
│   ├── (dashboard)/page.tsx
│   ├── study/page.tsx
│   ├── words/page.tsx
│   ├── settings/page.tsx
│   └── api/
│       ├── ocr/route.ts
│       ├── ai/route.ts
│       └── dictionary/route.ts
├── components/
│   ├── flashcard/
│   ├── study/
│   ├── dashboard/
│   └── ui/
├── store/
│   ├── useWordStore.ts
│   ├── useStudyStore.ts
│   └── useUserStore.ts
├── lib/
│   ├── tts.ts
│   ├── review-rule.ts
│   ├── storage.ts
│   └── text-normalize.ts
└── types/
    └── domain.ts

tests/
├── unit/
├── integration/
└── e2e/
```

**Structure Decision**: 采用单体 Web 应用结构（Next.js App Router），在同一代码库中维护页面、BFF API、状态管理与离线能力，降低 MVP 迭代复杂度并支撑后续扩展。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
