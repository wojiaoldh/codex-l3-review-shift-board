# 项目 Skills 沉淀

## 沉淀原则

第三课要求项目完成后沉淀 Skills。  

本项目不是把所有说明都写成 Skill，而是只沉淀满足这些条件的动作：

1. 会重复出现。
2. AI 容易做错。
3. 有明确输入和输出。
4. 可以被验收。
5. 不是一次性项目背景。

## Skill 1：review-metric-recording

用途：把一次需求评审记录成可统计样本。

适用场景：

- 新增试点需求记录
- 检查记录字段是否完整
- 生成周同步前补齐指标

输入：

- 需求名称
- 负责人
- 阶段
- 评审时长
- AI 报告使用情况
- PRD 打回情况
- 左移问题数
- 证据
- 人工确认点

输出：

- 符合看板数据模型的记录

## Skill 2：ai-report-adoption-check

用途：判断 AI 报告建议是否真实被采纳。

适用场景：

- AI 报告生成后
- PRD 修改后
- 写质量左移阶段报告前

核心规则：

- “看过”不等于“采纳”。
- “模型说有用”不等于“有业务价值”。
- 采纳必须有 PRD 修改、评审记录、负责人确认或等价证据。

## Skill 3：left-shift-evidence-map

用途：把质量左移结论映射到真实证据。

适用场景：

- 写周报、月报、双月报告
- 对上同步质量左移价值
- 检查某个结论是否证据不足

输出表格：

| Claim | Evidence | Source | Strength | Human confirmation |
|---|---|---|---|---|

## 后续迭代

当 App 接入更多真实样本后，可以继续沉淀：

- `weekly-quality-sync-writer`
- `prd-return-reason-classifier`
- `delivery-gate-risk-check`
