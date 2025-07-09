# ESG VerifAi Dashboard - 数据集成指南

## 概述

ESG VerifAi Dashboard 现在支持从服务器API获取JSON格式的ESG数据，并自动计算和显示合规性分析结果。

## 数据结构

### JSON数据格式

服务器返回的JSON数据应具有以下结构：

```json
{
  "Category Name": [
    [
      [
        "Specific Criterion Description",
        "Audit Result",
        "Detailed Results Data"
      ]
    ]
  ]
}
```

### 字段说明

- **Category Name**: ESG类别名称（如 "Scope", "Governance", "Strategy" 等）
- **Specific Criterion Description**: 具体标准描述
- **Audit Result**: 审计结果，可能的值：
  - `"Yes"` - 完全合规
  - `"Few"` - 部分合规
  - `"No"` - 不合规
- **Detailed Results Data**: 详细的结果数据（支持文本描述）

## 数据处理逻辑

### 合规性计算

- **合规标准**: 审计结果不是 "No" 的标准被视为合规
- **合规率**: `(合规标准数量 / 总标准数量) × 100`
- **绿洗风险**: `((Few + No) 标准数量 / 总标准数量) × 100`

### 自动计算指标

1. **各类别合规率**: 每个ESG类别的合规标准比例
2. **总体合规率**: 所有类别的综合合规率
3. **绿洗风险**: 基于部分合规和不合规标准的风险评估
4. **建议生成**: 基于合规性分析自动生成改进建议

## API服务

### 主要API函数

#### `fetchESGReportData(reportId, dateRange)`
获取ESG报告数据
- **参数**:
  - `reportId`: 报告ID
  - `dateRange`: 日期范围对象 `{start, end}`
- **返回**: 包含ESG数据和元数据的对象

#### `fetchComplianceAnalysis()`
获取合规性分析
- **返回**: 包含总体和分类别合规性统计的对象

#### `fetchRecommendations(complianceData)`
获取基于合规性数据的建议
- **参数**: `complianceData` - 合规性分析数据
- **返回**: 包含建议和建议摘要的对象

## 仪表板功能

### Summary区域

显示14个关键指标卡片，分为两行：

**第一行 (7个卡片)**:
- Scope
- Governance  
- Strategy
- Climate-related Risk and Opportunities
- Business Model and Value Chain
- Strategy and Decision Making
- Greenwashing Risk (警告卡片)

**第二行 (7个卡片)**:
- Financial Position and Financial Performance
- Climate Resilience
- Risk Management
- Metrics and Targets
- Climate-related Metrics
- Climate-related Targets
- Compliant Rate (警告卡片)

### Details区域

#### 左侧表格 - AASB Scope2
显示各ESG类别的详细合规性统计：
- Category: 类别名称
- Compliant: 合规标准数量
- Non-Compliant: 不合规标准数量
- Total: 总标准数量

#### 右侧信息区
1. **Latest AASB S2 Standard Update**: 显示分析摘要
2. **AASB S2 and Materiality Matrix**: 合规率进度条和类别热力图
3. **Recommendations**: 基于数据的改进建议

## 使用示例

### 1. 基本数据加载

```javascript
import { fetchESGReportData } from '../services/apiService';

// 加载ESG数据
const result = await fetchESGReportData('QAN_2024', {
  start: '2023-05-23',
  end: '2023-07-16'
});

if (result.success) {
  console.log('ESG Data:', result.data);
  console.log('Metadata:', result.metadata);
}
```

### 2. 获取合规性分析

```javascript
import { fetchComplianceAnalysis } from '../services/apiService';

const analysis = await fetchComplianceAnalysis();
if (analysis.success) {
  console.log('Overall Compliance Rate:', analysis.data.overall.complianceRate);
  console.log('Greenwashing Risk:', analysis.data.overall.greenwashingRisk);
  console.log('Category Stats:', analysis.data.byCategory);
}
```

### 3. 获取建议

```javascript
import { fetchRecommendations } from '../services/apiService';

const complianceData = await fetchComplianceAnalysis();
const recommendations = await fetchRecommendations(complianceData.data);

if (recommendations.success) {
  console.log('Recommendations:', recommendations.data.recommendations);
  console.log('Summary:', recommendations.data.summary);
}
```

## 示例数据

项目包含一个示例JSON文件：`src/dashboard/example_data/QAN_2024_Sustainability_Report.json`

该文件包含Qantas Airways Limited的2024年可持续发展报告数据，涵盖以下类别：
- Scope
- Governance
- Strategy
- Climate-related risk and opportunities
- Business model and value chain
- Strategy and decision-making
- Financial position, financial performance and cash flows
- Climate resilience
- Risk Management
- Metrics and Targets
- Climate-related metrics
- Climate-related targets

## 错误处理

仪表板包含完整的错误处理机制：
- 加载状态显示
- 错误消息显示
- 重试功能
- 网络错误处理

## 未来扩展

### 计划功能
1. **实时数据更新**: 支持WebSocket连接实时更新数据
2. **历史数据比较**: 支持多期数据对比分析
3. **自定义指标**: 允许用户定义自定义合规性指标
4. **导出功能**: 支持PDF和Excel报告导出
5. **多公司支持**: 支持同时分析多个公司的ESG数据

### API扩展
1. **批量数据上传**: 支持批量上传多个ESG报告
2. **数据验证**: 增强的数据格式验证和错误检查
3. **缓存机制**: 实现数据缓存以提高性能
4. **认证授权**: 添加用户认证和权限控制

## 技术栈

- **前端**: React 18 + Material-UI
- **数据处理**: JavaScript ES6+
- **API模拟**: 自定义Promise-based服务
- **构建工具**: Vite
- **包管理**: npm

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

MIT License 