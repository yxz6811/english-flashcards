# Feature Specification: 期末英语闪卡复习 Web 应用

**Feature Branch**: `001-english-flashcards-web`

**Created**: 2026-06-02

**Status**: Draft

**Input**: User description: "按照 RESEARCH.md 构建拍照导入 + AI 制卡 + 闪卡学习 + 生词强化 + 游戏化激励的中文界面英语闪卡复习产品"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - 快速制卡并开始学习 (Priority: P1)

作为期末备考学生，我希望可以快速导入一批英语单词并立即进入闪卡学习，这样我可以在最短时间内开始高频复习，不被繁琐录入流程打断。

**Why this priority**: 没有高效导入与基础学习闭环，用户无法开始核心复习行为，产品主价值无法成立。

**Independent Test**: 通过导入一份词表并完成至少 10 张卡片的翻转与认识/不认识标记，能独立验证该故事闭环价值（从导入到学习）。

**Acceptance Scenarios**:

1. **Given** 用户首次进入产品且无词书，**When** 用户上传图片或粘贴文本词表，**Then** 系统生成可确认的词条列表并允许一键创建词书。
2. **Given** 用户已进入学习页，**When** 用户翻转卡片并标记“认识/不认识”，**Then** 系统立即记录判定结果并进入下一张卡片。
3. **Given** 用户误操作，**When** 用户点击或触发撤销，**Then** 系统恢复上一步判定并允许重新作答。

---

### User Story 2 - 生词强化与掌握判定 (Priority: P2)

作为正在冲刺考试的学生，我希望系统自动把不会的词集中到生词本，并在我连续答对后标记为已掌握，这样我能把时间集中在薄弱点。

**Why this priority**: 精准复习是学习效率提升关键，直接决定用户是否能感知“越学越轻松”的效果。

**Independent Test**: 通过构造“答错一次、连续答对两次、再答错”的场景，可独立验证生词流转、进度清零、掌握移除等核心规则是否正确。

**Acceptance Scenarios**:

1. **Given** 用户把单词标记为“不认识”，**When** 学习结果提交，**Then** 该词进入生词本且正确进度为 0/2。
2. **Given** 生词本中的词连续两次被标记为“认识”，**When** 第二次结果提交，**Then** 该词被标记为“已掌握”并移出生词本。
3. **Given** 生词本中的词在 1/2 状态下答错，**When** 结果提交，**Then** 该词进度回到 0/2。

---

### User Story 3 - 游戏化反馈与学习持续性 (Priority: P3)

作为容易疲劳的复习用户，我希望在完成关键学习节点时获得即时反馈，并能看到每日学习热力图，这样我更愿意持续打卡。

**Why this priority**: 游戏化不是启动门槛，但对留存和连续复习有显著促进，是提升长期学习行为的重要增益。

**Independent Test**: 在完成“生词攻克”和“当日任务清空”两类场景后检查反馈效果与热力图更新，可独立验证激励系统有效性。

**Acceptance Scenarios**:

1. **Given** 用户攻克一个生词，**When** 状态从学习中变为已掌握，**Then** 系统展示局部庆祝反馈。
2. **Given** 用户完成当日全部学习任务，**When** 最后一张卡片提交后，**Then** 系统展示全局庆祝反馈并记录当日打卡。
3. **Given** 用户回到首页，**When** 查看学习看板，**Then** 可看到反映当日学习量的热力图变化。

---

### Edge Cases
- OCR 未识别出任何可用词条时，系统需给出可操作反馈并允许重新上传或手动粘贴文本。
- 导入结果包含重复词、大小写差异词或异常字符时，系统需进行去重与清洗提示。
- 用户在离线或弱网场景学习时，已下载词书与进度应保持可用，恢复网络后不应造成进度冲突。
- 用户连续触发快捷键或快速滑动时，系统不应出现重复计分、漏计分或卡片状态错乱。
- 当词书为空或当日任务已清空时，学习页需展示明确状态引导，避免空白页面。

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: 系统必须支持用户通过图片拍照/上传或文本粘贴两种方式批量导入英语词汇。
- **FR-002**: 系统必须在导入后提供词条预览与编辑能力，包括删除无关词条与修正识别错误。
- **FR-003**: 系统必须为每个词条提供学习卡片正反面内容，包含英文展示面与中文释义展示面。
- **FR-004**: 用户必须能够通过点击、滑动与键盘快捷键完成翻卡、认识/不认识判定与重新发音操作。
- **FR-005**: 系统必须提供“撤销上一步”能力，并恢复到可重新判定的学习状态。
- **FR-006**: 系统必须将“不认识”判定的词条自动纳入生词本管理。
- **FR-007**: 系统必须按“连续 2 次答对即掌握、途中答错进度归零”的规则维护生词状态。
- **FR-008**: 系统必须在词条达到掌握条件时将其移出生词本并记录为已掌握。
- **FR-009**: 系统必须提供当日学习进度可视化，并在完成当日任务时给出明确庆祝反馈。
- **FR-010**: 系统必须支持夜间模式切换，并保证主要学习流程在移动端与桌面端均可完成。
- **FR-011**: 系统必须允许用户设置兴趣标签，并在学习内容中体现个性化例句或助记内容。
- **FR-012**: 系统必须在无网或弱网时保证已存在词书与学习进度可继续使用，并在恢复连接后保持数据一致性。

### Key Entities *(include if feature involves data)*

- **词条（Vocabulary Item）**: 表示单个单词或词组，包含拼写、音标、词性释义、例句、助记内容、学习状态和连续正确进度。
- **词书（Wordbook）**: 表示用户的一组学习词条，包含名称、来源、总词数、已掌握数、待复习数等聚合信息。
- **学习记录（Review Attempt）**: 表示用户对某词条一次判定行为，包含判定结果、时间、是否撤销与前后状态快照。
- **用户设置（User Preferences）**: 表示学习偏好，包括界面主题、语速、兴趣标签、快捷键偏好等。
- **打卡日记录（Daily Activity）**: 表示某日学习完成情况，用于热力图呈现，包含学习量、完成状态与连续打卡信息。

## Success Criteria *(mandatory)*

### Measurable Outcomes
- **SC-001**: 新用户在首次使用时，90% 以上可在 3 分钟内完成“导入词表并开始第一轮学习”。
- **SC-002**: 用户在 20 词的复习任务中，95% 以上可无中断完成全部卡片判定流程。
- **SC-003**: 生词本规则准确率达到 100%（连续答对两次移除、答错归零、撤销可回滚）。
- **SC-004**: 连续 7 天内，至少 60% 的活跃用户产生 3 天及以上学习打卡记录。
- **SC-005**: 在可用离线词书场景下，用户离线学习任务完成率不低于在线场景的 90%。

## Assumptions

- 默认目标用户为备考阶段学生，不要求复杂账号体系即可开始本地学习。
- 默认首期优先覆盖“导入-学习-生词流转-反馈”核心闭环，长期记忆高级模式可在后续迭代完善。
- 默认界面文案遵循项目宪章，整体使用中文，特殊术语可保留原文。
- 默认 AI 内容生成在成本可控前提下启用，若第三方服务不可用时可降级为基础词典内容。
- 默认用户可在同一设备持续学习，跨设备同步不作为首期强制目标。
