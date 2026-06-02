# Tasks: 期末英语闪卡复习 Web 应用

**Input**: Design documents from `/specs/001-english-flashcards-web/`

**Prerequisites**: plan.md（required）, spec.md（required）, research.md, data-model.md, contracts/, quickstart.md

**Tests**: 本特性要求关键流程可验证，已包含必要测试任务。

**Organization**: 任务按用户故事分组，保证每个故事可独立实现与独立验收。

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup（共享基础）

**Purpose**: 初始化工程依赖与目录，建立统一开发基线

- [X] T001 安装并配置项目依赖于 package 配置文件 `package.json`
- [X] T002 创建应用目录骨架于 `src/app`, `src/components`, `src/store`, `src/lib`, `src/types`
- [X] T003 [P] 配置 Tailwind 与主题基础于 `tailwind.config.ts` 与 `src/app/globals.css`
- [X] T004 [P] 配置测试基线（Vitest/RTL/Playwright）于 `vitest.config.ts` 与 `playwright.config.ts`
- [X] T005 配置 PWA 基线能力于 `next.config.ts` 与 `public/manifest.json`

---

## Phase 2: Foundational（阻塞前置）

**Purpose**: 完成所有用户故事共享的核心能力

- [X] T006 定义领域类型与枚举于 `src/types/domain.ts`
- [X] T007 [P] 实现文本清洗与词条去重工具于 `src/lib/text-normalize.ts`
- [X] T008 [P] 实现离线存储访问层于 `src/lib/storage.ts`
- [X] T009 [P] 实现“连续 2 次答对”规则引擎于 `src/lib/review-rule.ts`
- [X] T010 实现学习主状态仓库（词书/学习队列/撤销栈）于 `src/store/useStudyStore.ts`
- [X] T011 [P] 实现用户设置状态仓库（主题/语速/兴趣标签）于 `src/store/useUserStore.ts`
- [X] T012 建立统一 API 错误映射与响应结构于 `src/lib/api-response.ts`
- [X] T013 创建中文界面术语常量与文案约束于 `src/lib/i18n-zh.ts`

**Checkpoint**: 完成后可并行进入各用户故事实现

---

## Phase 3: User Story 1 - 快速制卡并开始学习 (Priority: P1) 🎯 MVP

**Goal**: 用户可快速导入词表并完成核心闪卡学习与撤销

**Independent Test**: 导入 20 词并完成 10 张卡片判定，含撤销回滚，流程无中断

### Tests for User Story 1

- [X] T014 [P] [US1] 编写导入与学习流程集成测试于 `tests/integration/study-flow.spec.ts`
- [X] T015 [P] [US1] 编写学习页交互组件测试于 `tests/unit/study-page.spec.tsx`

### Implementation for User Story 1

- [X] T016 [P] [US1] 实现 OCR 转发接口于 `src/app/api/ocr/route.ts`
- [X] T017 [P] [US1] 实现词条补全接口于 `src/app/api/cards/enrich/route.ts`
- [X] T018 [P] [US1] 实现导入入口页面于 `src/app/(dashboard)/page.tsx`
- [X] T019 [P] [US1] 实现词条预览与编辑组件于 `src/components/study/import-preview.tsx`
- [X] T020 [P] [US1] 实现闪卡组件（翻转/滑动/发音按钮）于 `src/components/flashcard/flashcard.tsx`
- [X] T021 [US1] 实现学习页面主流程编排于 `src/app/study/page.tsx`
- [X] T022 [US1] 实现学习提交与撤销接口于 `src/app/api/study/submit/route.ts` 与 `src/app/api/study/undo/route.ts`
- [X] T023 [US1] 接入快捷键行为（Space/左右/R/Ctrl+Z）于 `src/components/study/study-hotkeys.tsx`
- [X] T024 [US1] 完成 US1 中文文案与空状态处理于 `src/components/study/*.tsx`

**Checkpoint**: US1 可独立演示为 MVP

---

## Phase 4: User Story 2 - 生词强化与掌握判定 (Priority: P2)

**Goal**: 生词本可按 0/2、1/2、2/2 规则流转并可排序管理

**Independent Test**: 在生词本场景验证“答错归零、连续两次掌握移除”完整路径

### Tests for User Story 2

- [X] T025 [P] [US2] 编写规则引擎单元测试于 `tests/unit/review-rule.spec.ts`
- [X] T026 [P] [US2] 编写生词流转集成测试于 `tests/integration/wordbook-flow.spec.ts`

### Implementation for User Story 2

- [X] T027 [P] [US2] 扩展词条状态字段与进度映射于 `src/types/domain.ts`
- [X] T028 [US2] 实现生词本页面与进度展示于 `src/app/words/page.tsx`
- [X] T029 [P] [US2] 实现生词列表组件与排序器于 `src/components/study/wordbook-list.tsx`
- [X] T030 [US2] 将判定结果与生词流转规则接入状态仓库于 `src/store/useStudyStore.ts`
- [X] T031 [US2] 实现生词本过滤与统计聚合于 `src/lib/wordbook-selectors.ts`
- [X] T032 [US2] 完成 US2 中文文案与异常提示于 `src/components/study/wordbook-list.tsx`

**Checkpoint**: US2 可在不依赖 US3 的条件下独立验收

---

## Phase 5: User Story 3 - 游戏化反馈与学习持续性 (Priority: P3)

**Goal**: 完成节点反馈、热力图展示与连续打卡记录

**Independent Test**: 完成当日任务后出现庆祝反馈，首页热力图反映当日学习行为

### Tests for User Story 3

- [X] T033 [P] [US3] 编写热力图数据聚合测试于 `tests/unit/heatmap.spec.ts`
- [X] T034 [P] [US3] 编写庆祝触发流程集成测试于 `tests/integration/celebration.spec.ts`

### Implementation for User Story 3

- [X] T035 [P] [US3] 实现局部庆祝组件于 `src/components/study/micro-celebration.tsx`
- [X] T036 [P] [US3] 实现全局庆祝组件于 `src/components/study/fullscreen-confetti.tsx`
- [X] T037 [P] [US3] 实现热力图组件于 `src/components/dashboard/heatmap.tsx`
- [X] T038 [US3] 实现看板首页数据呈现于 `src/app/(dashboard)/page.tsx`
- [X] T039 [US3] 实现热力图读取接口于 `src/app/api/dashboard/heatmap/route.ts`
- [X] T040 [US3] 将学习活动聚合写入日记录于 `src/lib/daily-activity.ts`
- [X] T041 [US3] 完成 US3 中文文案与反馈提示于 `src/components/dashboard/*.tsx`

**Checkpoint**: US1 + US2 + US3 全部可独立回归验证

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 收敛跨故事质量项与规范项

- [X] T042 [P] 完成设置页（主题/兴趣标签/语速）于 `src/app/settings/page.tsx`
- [X] T043 优化移动端手势阈值与可访问性于 `src/components/flashcard/flashcard.tsx`
- [X] T044 [P] 执行 quickstart 回归并记录结果于 `specs/001-english-flashcards-web/quickstart.md`
- [X] T045 核对全站中文文案与特殊单词例外清单于 `specs/001-english-flashcards-web/research.md`
- [X] T046 统一 UI 视觉与组件状态（`ui-ux-pro-max-skill`）于 `src/components/ui/*`
- [X] T047 完成接口契约一致性检查于 `specs/001-english-flashcards-web/contracts/api-contract.yaml`

---

## RESEARCH.md 缺口对照（Phase 6 之后）

对照 `RESEARCH.md` 与当前实现，以下能力**尚未完成或仅为占位/Mock**：

| RESEARCH 要求 | 当前状态 |
|---------------|----------|
| TTS 朗读 + 语速（0.75/1/1.25）+ R 键重播 | `src/lib/tts.ts` 存在，学习页未接入 |
| 真实 OCR（百度/阿里云）+ 摄像头拍照 | 有接口骨架，无密钥时降级 mock 词表 |
| 真实 LLM 兴趣例句/助记（流式输出） | 有接口，失败时模板；无 SSE 流式 |
| 有道词典 API 标准音标释义 | 未实现 |
| Tinder 左滑/右滑判定 + 卡片飞出 | 仅按钮判定，无 `drag` 手势 |
| 快捷键 Space 翻面 | 仅 ←/→/Ctrl+Z |
| 夜间模式全局生效 | 设置可存主题，页面未切换 `dark` 样式 |
| 助记法折叠面板、词条可编辑、自动配图 | 助记平铺展示；预览仅删除不可改；无配图 |
| 生词本按字母/错误次数排序 + 进度条 | 列表展示，无排序器 |
| 热力图真实数据 + 连续打卡 Streak | 首页/API 为 mock 数据 |
| 撒花/碎卡动画 + 通关音效 | 简单文案层，无 confetti/音频 |
| PWA 离线（next-pwa + localForage） | 仅 manifest；存储为 localStorage |
| 艾宾浩斯长期记忆模式 | 未实现 |
| 拼写听写模式 | 未实现 |
| 60 秒限时冲刺 + Combo | 未实现 |
| 词书云端同步与分享（V3） | 仅本地 LWW mock 同步 |

---

## Phase 7: 学习体验补齐（RESEARCH V1 未完成项）

**Goal**: 补齐 PRD 4.2 闪卡学习模块与 V1.0 Roadmap 中尚未落地的核心交互

**Independent Test**: 学习页可朗读、可滑动判定、可 Space 翻面、深色模式生效，且无 mock 发音占位

### Implementation for Phase 7

- [ ] T048 [P] 在学习页接入 TTS：发音按钮、自动朗读、语速读取于 `src/components/flashcard/flashcard.tsx` 与 `src/lib/tts.ts`
- [ ] T049 [P] 扩展快捷键：Space 翻面、R 重播发音于 `src/components/study/study-hotkeys.tsx`
- [ ] T050 实现 Tinder 式滑动判定与卡片飞出动画于 `src/components/flashcard/swipe-zone.tsx` 并接入 `src/components/flashcard/flashcard.tsx`
- [ ] T051 实现夜间模式全局生效（`html.dark` + 组件样式）于 `src/app/layout.tsx` 与 `src/store/useUserStore.ts`
- [ ] T052 [P] 实现助记法折叠面板于 `src/components/flashcard/mnemonic-panel.tsx`
- [ ] T053 [P] 生词本支持按字母/错误次数排序与 0/2 进度条于 `src/components/study/wordbook-list.tsx`

**Checkpoint**: 达到 RESEARCH「V1.0 闪卡+快捷键+夜间模式」可验收水平（除 OCR/AI 真实接入）

---

## Phase 8: 真实数据接入（RESEARCH V2）

**Goal**: 替换 OCR/LLM/热力图等 Mock，完成「拍照导入 + AI 制卡 + 真实看板」

**Independent Test**: 配置密钥后 OCR/补全返回真实内容；热力图来自真实学习记录；庆祝为动画而非纯文案

### Implementation for Phase 8

- [ ] T054 强化 OCR 生产链路：密钥校验、错误提示、空结果处理于 `src/lib/server/ocr.ts` 与 `src/app/api/ocr/route.ts`
- [ ] T055 [P] 支持摄像头拍照导入（`getUserMedia`）于 `src/components/study/import-preview.tsx`
- [ ] T056 [P] 接入有道词典 API 作为音标/释义前置于 `src/lib/server/dictionary.ts` 与 `src/app/api/dictionary/route.ts`
- [ ] T057 优化 LLM 补全：结构化 JSON 校验、兴趣标签例句质量兜底于 `src/lib/server/llm.ts`
- [ ] T058 实现 AI 流式输出（SSE）于 `src/app/api/cards/enrich/stream/route.ts` 与卡片反面展示
- [ ] T059 [P] 导入预览支持词条 inline 编辑（单词/释义）于 `src/components/study/import-preview.tsx`
- [ ] T060 移除首页 mock 热力图，改为读取真实 `DailyActivity` 聚合于 `src/app/(dashboard)/page.tsx` 与 `src/lib/daily-activity.ts`
- [ ] T061 [P] 实现连续打卡 Streak 统计于 `src/lib/streak.ts` 与看板展示
- [ ] T062 [P] 升级庆祝反馈：canvas-confetti 全屏撒花 + 掌握时碎卡动效于 `src/components/study/fullscreen-confetti.tsx` 与 `src/components/study/micro-celebration.tsx`
- [ ] T063 [P] 可选：词条具象配图缓存于 `src/lib/word-image.ts` 与 `src/types/domain.ts`

**Checkpoint**: 达到 RESEARCH「V2.0 体验飞跃」可演示水平

---

## Phase 9: 进阶模式与离线云端（RESEARCH V3 + 非功能需求）

**Goal**: 交付拼写/艾宾浩斯/限时冲刺、PWA 离线、云端词书（按 Roadmap 分期）

**Independent Test**: 各子模式可独立进入并完成一轮；离线可复习；云端同步可配置后多端一致

### Implementation for Phase 9

- [ ] T064 实现拼写听写模式页面与判定逻辑于 `src/app/spelling/page.tsx` 与 `src/lib/spelling-rule.ts`
- [ ] T065 [P] 实现艾宾浩斯复习调度（1/2/4/7 天）于 `src/lib/ebbinghaus-scheduler.ts` 与 `src/app/review-scheduled/page.tsx`
- [ ] T066 [P] 实现 60 秒限时冲刺模式（Combo + 倒计时）于 `src/app/time-attack/page.tsx` 与 `src/components/game/time-attack-board.tsx`
- [ ] T067 将 localStorage 迁移为 localForage（IndexedDB）于 `src/lib/storage.ts`（或新增 `src/lib/db.ts`）
- [ ] T068 [P] 接入 next-pwa：Service Worker + 离线缓存策略于 `next.config.ts` 与 `public/`
- [ ] T069 设计并实现远端同步 API（PostgreSQL + Prisma）于 `prisma/schema.prisma` 与 `src/app/api/sync/route.ts`
- [ ] T070 [P] 实现词书分享（链接或海报）于 `src/app/share/page.tsx` 与 `src/lib/share-link.ts`
- [ ] T071 [P] 学习页音效（答对/答错/通关）于 `src/lib/sound-effects.ts`
- [ ] T072 移动端响应式与性能优化（GPU 动画、预加载发音）于 `src/app/globals.css` 与闪卡组件

**Checkpoint**: 达到 RESEARCH「V3.0 进阶学习与游戏化」首期目标

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup（Phase 1）可立即开始
- Foundational（Phase 2）依赖 Phase 1，且阻塞所有用户故事
- US1/US2/US3（Phase 3-5）均依赖 Phase 2 完成
- Polish（Phase 6）依赖目标用户故事完成
- Phase 7 依赖 Phase 6，补齐 V1 交互缺口
- Phase 8 依赖 Phase 7（TTS/手势稳定后再接真实 API 体验更佳）
- Phase 9 依赖 Phase 8 数据层真实化，云端同步可并行子任务

### User Story Dependencies

- **US1 (P1)**: 仅依赖基础阶段，是 MVP 首要交付
- **US2 (P2)**: 依赖 US1 的学习判定输入，但可独立验收生词流转
- **US3 (P3)**: 依赖学习事件数据，可在 US1/US2 稳定后接入

### Parallel Opportunities

- Phase 1 中 T003/T004/T005 可并行
- Phase 2 中 T007/T008/T009/T011 可并行
- US1 中接口、页面、组件任务可并行（T016-T020）
- US2 中规则测试与列表组件可并行（T025/T026/T029）
- US3 中反馈组件与热力图组件可并行（T035/T036/T037）

---

## Parallel Example: User Story 1

```bash
Task: "T016 实现 OCR 转发接口于 src/app/api/ocr/route.ts"
Task: "T017 实现词条补全接口于 src/app/api/cards/enrich/route.ts"
Task: "T020 实现闪卡组件于 src/components/flashcard/flashcard.tsx"
```

---

## Implementation Strategy

### MVP First（仅交付 US1）

1. 完成 Phase 1、Phase 2
2. 完成 US1（T014-T024）
3. 通过 quickstart 的场景 A 验收

### Incremental Delivery

1. US1 完成后上线可用学习闭环
2. 增量交付 US2 强化复习效率
3. 最后交付 US3 提升留存与打卡行为
4. Phase 7 交付朗读/滑动/深色模式等「体感」缺口
5. Phase 8 替换 Mock，完成真实 OCR/AI/热力图
6. Phase 9 交付进阶模式、PWA 与云端（可按 T064–T072 拆分迭代）

### Parallel Team Strategy

1. 团队共同完成 Setup + Foundational
2. 成员 A 主 US1，成员 B 主 US2，成员 C 主 US3
3. 每个故事完成后做独立验收与合并
4. Phase 7–9 中标记 `[P]` 的任务可并行（如 T048/T049、T056/T057、T064/T065）

---

## Notes

- 所有任务均包含明确文件路径，可直接执行
- `[P]` 表示文件不冲突且可并行
- 用户可见文案默认中文，特殊单词按宪章例外处理
- 涉及 UI 的任务默认使用 `ui-ux-pro-max-skill`
