# AISEO Scanner - 产品规格书

## 1. Concept & Vision

**一个专门优化AI搜索可见性的工具** - 让网站被ChatGPT、Claude、Perplexity引用。

不是传统的SEO工具，而是第一个专门为AI搜索引擎设计的扫描器。输入网址，60秒内获得完整的AI-ready分析报告和可操作的修复方案。

**核心价值**：在AI搜索全面取代传统搜索之前，抢占先机。

---

## 2. Design Language

### 色彩系统
- Primary: `#6366F1` (Indigo - 代表AI/科技)
- Secondary: `#8B5CF6` (Purple - AI/创意)
- Accent: `#22D3EE` (Cyan - 强调/CTA)
- Background: `#0F172A` (深蓝黑)
- Surface: `#1E293B` (卡片背景)
- Text Primary: `#F8FAFC`
- Text Secondary: `#94A3B8`
- Success: `#10B981`
- Warning: `#F59E0B`
- Error: `#EF4444`

### 字体
- 标题: Inter (700, 600)
- 正文: Inter (400, 500)
- 代码: JetBrains Mono

### 动效
- 扫描动画: 进度条 + 脉冲效果
- 报告卡片: 交错淡入 (stagger 100ms)
- CTA按钮: hover时微放大 + 发光

---

## 3. Layout & Structure

### 首页
```
[Hero Section]
- 主标题 + 副标题
- URL输入框 (大，醒目)
- "Get FREE AI SEO Score" 按钮
- 4个核心指标图标 (Schema/Content/Technical/Trust)

[Features Section]
- 3列网格展示4个检查维度

[Pricing Section]
- 3个价格卡片 ($29单次, $119/5次, $199/10次)

[FAQ Section]
- 手风琴展开

[Footer]
- 链接 + 版权
```

### 报告页
```
[Header]
- 得分展示 (0-100)
- 4个维度分数条

[Issue Cards]
- 按严重程度分组 (Critical/High/Medium)
- 每个issue显示: 问题描述 + 影响 + 修复建议 + 代码示例

[Download Section]
- 导出PDF按钮
```

---

## 4. Features & Interactions

### 核心功能

**免费扫描**
- 输入URL → 基础评分(0-100)
- 显示4个维度分数
- 显示Critical问题数量
- 不显示详细修复方案

**付费扫描 ($29)**
- 完整报告
- 所有issue详细说明
- 可操作代码示例
- PDF下载
- 保留30天

### 扫描维度

**1. Schema Markup (25分)**
- JSON-LD完整性
- Article schema
- FAQ schema
- Organization schema
- Open Graph

**2. Content Quality (25分)**
- 标题层级
- FAQ存在性
- 内容深度
- 作者署名
- 可读性

**3. Technical SEO (25分)**
- 页面速度
- 移动端友好
- HTTPS
- URL结构
- Meta标签

**4. Trust Signals (25分)**
- About页面
- Contact信息
- 隐私政策
- 社交媒体
- 作者简介

### 交互细节

- 输入框: focus时边框发光
- 扫描中: 进度条 + "Analyzing..."文字 + 脉冲
- 报告卡片: hover微上浮 + 边框发光
- 支付: Stripe Checkout

---

## 5. Component Inventory

### URLInput
- Default: 深色背景，灰色边框
- Focus: 边框变indigo，发光
- Loading: 内嵌进度条
- Error: 红色边框 + 错误信息

### ScoreCard
- 大数字分数 (0-100)
- 维度名称
- 进度条 (颜色根据分数变化: <50红, 50-75黄, >75绿)
- 展开箭头

### IssueCard
- 严重程度图标 (Critical🔴 High🟠 Medium🟡)
- 问题标题
- 影响描述
- 修复建议
- 代码块 (可复制)

### PricingCard
- 价格
- 包含内容列表
- CTA按钮
- "Most Popular" 标签

### FAQAccordion
- 问题标题
- 展开/收起图标
- 答案区域 (展开动画)

---

## 6. Technical Approach

### Stack
- **Frontend**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe Checkout
- **Scraping**: Puppeteer + Cheerio
- **Deployment**: Vercel

### Data Model

```sql
-- 用户扫描记录
scans (
  id UUID PRIMARY KEY,
  url TEXT NOT NULL,
  score_overall INTEGER,
  score_schema INTEGER,
  score_content INTEGER,
  score_technical INTEGER,
  score_trust INTEGER,
  issues JSONB,  -- 完整问题列表
  is_paid BOOLEAN DEFAULT false,
  stripe_session_id TEXT,
  created_at TIMESTAMP
)

-- Stripe webhook记录
stripe_events (
  id UUID PRIMARY KEY,
  event_id TEXT UNIQUE,
  type TEXT,
  processed_at TIMESTAMP
)
```

### API Endpoints

```
POST /api/scan
  Body: { url: string }
  Response: { scanId: string, preview: { scores, criticalCount } }

GET /api/scan/:id
  Response: { scan data } (仅付费)

POST /api/create-checkout-session
  Body: { scanId: string }
  Response: { sessionUrl: string }

POST /api/webhook/stripe
  Stripe webhook handler
```

### 扫描流程
1. 用户输入URL
2. Puppeteer爬取页面
3. Cheerio提取HTML结构
4. 分析4个维度
5. 生成问题列表
6. 计算分数
7. 存储Supabase
8. 返回preview (免费) 或完整报告 (付费)
