# English Flashcards Constitution

## Core Principles

### I. UI 设计技能统一
所有涉及 UI/UX 的页面、组件、布局与交互设计任务，必须优先并默认使用 `ui-ux-pro-max-skill`。  
若存在技术限制导致无法直接使用，需在对应任务说明中明确记录原因与替代方案。

### II. 界面语言统一
整个项目的用户界面文案默认使用中文。  
仅在以下场景允许保留非中文：专业术语、品牌名、技术关键字、不可翻译的固有名词（即“特殊单词除外”）。

### III. 一致性与可维护性
新增或修改界面时，必须保证术语、语气、组件风格与现有界面一致。  
禁止在未经说明的情况下引入新的文案风格或命名体系。

### IV. 改完即上线（生产环境）
功能或 UI 修复完成后，应及时部署到生产地址：  
**https://yangxizhe.com/english-flashcards/**

上线步骤（在 `my-project` 目录执行）：

```bash
chmod +x deploy.sh   # 首次
./deploy.sh
```

或手动两步：

```bash
# 1) 上传（不上传 .env.local）
tar --exclude='node_modules' --exclude='.next' --exclude='.git' --exclude='specs' --exclude='.env.local' -czf - . \
  | ssh -p 41326 root@193.134.211.194 "tar -xzf - -C /var/www/english-flashcards"

# 2) 构建并重启
ssh -p 41326 root@193.134.211.194 "cd /var/www/english-flashcards && npm ci && NEXT_PUBLIC_BASE_PATH=/english-flashcards npm run build && pm2 restart english-flashcards --update-env"
```

约束：仅操作 `/var/www/english-flashcards` 与 PM2 进程 `english-flashcards`，不得改动服务器上其他项目。

## Additional Constraints

- 所有新界面在提交前需检查语言一致性（中文优先）与术语一致性。  
- 设计与实现说明中应明确标注是否使用 `ui-ux-pro-max-skill`，便于审查与追溯。

## Workflow & Quality Gates

- 在需求澄清阶段确认是否包含 UI 变更；包含则默认走 `ui-ux-pro-max-skill` 流程。  
- 在评审阶段将“中文界面规范”作为必检项。  
- 若出现英文或混合文案，需在评审意见中说明其“特殊单词”属性。
- 用户可见缺陷修复后，必须在同一轮对话内完成生产部署验证（至少检查首页与学习页可访问）。

## Governance

本宪章优先于项目内其他默认实践。任何与本宪章冲突的实现或流程均视为不合规。  
宪章修订需记录修订原因、影响范围与生效时间，并同步更新相关模板与规范文件。

**Version**: 1.1.0 | **Ratified**: 2026-06-02 | **Last Amended**: 2026-06-03
