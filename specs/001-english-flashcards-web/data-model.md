# Data Model: 期末英语闪卡复习 Web 应用

## 1) Wordbook（词书）

- **id**: 词书唯一标识
- **name**: 词书名称
- **sourceType**: 导入来源（image/text/manual）
- **totalCount**: 词条总数
- **masteredCount**: 已掌握词条数
- **createdAt / updatedAt**: 创建与更新时间

**Relationships**
- 一个 Wordbook 包含多个 VocabularyItem

## 2) VocabularyItem（词条）

- **id**: 词条唯一标识
- **word**: 英文单词或词组
- **phonetic**: 音标
- **meaningZh**: 中文释义
- **exampleEn**: 英文例句
- **exampleZh**: 中文例句翻译
- **mnemonic**: 助记内容
- **status**: `learning | mastered`
- **correctStreak**: 连续答对次数（0/1/2）
- **errorCount**: 累计错误次数
- **lastReviewedAt**: 最近复习时间

**Validation Rules**
- `word` 不能为空，去除首尾空格后长度 > 0
- `correctStreak` 仅允许 0~2
- `status=mastered` 时 `correctStreak` 必须为 2

**State Transitions**
- `learning(0/2)` + 认识 -> `learning(1/2)`
- `learning(1/2)` + 认识 -> `mastered(2/2)`
- 任意学习状态 + 不认识 -> `learning(0/2)`
- 撤销 -> 回到上一次判定前状态

## 3) ReviewAttempt（学习判定记录）

- **id**: 记录唯一标识
- **itemId**: 关联词条
- **result**: `known | unknown`
- **isUndo**: 是否由撤销触发回滚
- **timestamp**: 操作时间
- **beforeState / afterState**: 判定前后状态快照（用于审计与回滚）

**Relationships**
- 一个 VocabularyItem 对应多条 ReviewAttempt

## 4) UserPreferences（用户设置）

- **theme**: `light | dark | system`
- **speechRate**: 发音语速
- **interestTags**: 兴趣标签列表
- **keyboardEnabled**: 是否启用快捷键
- **updatedAt**: 更新时间

## 5) DailyActivity（每日学习活动）

- **date**: 学习日期（yyyy-mm-dd）
- **reviewedCount**: 当日复习词条数
- **masteredToday**: 当日新增掌握数
- **completedDailyGoal**: 是否完成当日任务
- **streakLength**: 连续打卡天数

**Relationships**
- DailyActivity 基于 ReviewAttempt 聚合得出
