import { Dataset } from '../types';

export const COLOR_PALETTES = [
  {
    id: 'slate-blue',
    name: 'Modern Oceanic',
    colors: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#1d4ed8', '#0284c7', '#06b6d4', '#0d9488']
  },
  {
    id: 'emerald-teal',
    name: 'Verdant Forest',
    colors: ['#059669', '#10b981', '#34d399', '#6ee7b7', '#047857', '#0f766e', '#14b8a6', '#2dd4bf']
  },
  {
    id: 'sunset-amber',
    name: 'Amber Glow',
    colors: ['#d97706', '#f59e0b', '#fbbf24', '#fde68a', '#ea580c', '#f97316', '#fb923c', '#fdba74']
  },
  {
    id: 'violet-berry',
    name: 'Purple Indigo',
    colors: ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#6d28d9', '#4f46e5', '#6366f1', '#818cf8']
  },
  {
    id: 'monochrome',
    name: 'Neutral Steel',
    colors: ['#334155', '#475569', '#64748b', '#94a3b8', '#1e293b', '#0f172a', '#cbd5e1', '#e2e8f0']
  },
  {
    id: 'vibrant-spectrum',
    name: 'Vibrant Spectrum',
    colors: ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']
  }
];

export const PRESET_DATASETS: Dataset[] = [
  {
    id: 'global-sales',
    name: 'Global Enterprise Sales & Profitability',
    description: 'Multi-region transactional sales records detailing product categories, sales volume, profit margins, and discounts.',
    source: 'preset',
    createdAt: '2026-01-15',
    columns: [
      { key: 'date', name: 'Order Date', type: 'date' },
      { key: 'region', name: 'Region', type: 'string' },
      { key: 'country', name: 'Country', type: 'string' },
      { key: 'category', name: 'Category', type: 'string' },
      { key: 'subCategory', name: 'Sub-Category', type: 'string' },
      { key: 'customerSegment', name: 'Customer Segment', type: 'string' },
      { key: 'unitsSold', name: 'Units Sold', type: 'number' },
      { key: 'revenue', name: 'Revenue ($)', type: 'number', unit: '$' },
      { key: 'profit', name: 'Profit ($)', type: 'number', unit: '$' },
      { key: 'discount', name: 'Discount (%)', type: 'number', unit: '%' },
      { key: 'customerRating', name: 'Customer Rating', type: 'number' }
    ],
    data: [
      { date: '2025-01-12', region: 'North America', country: 'United States', category: 'Technology', subCategory: 'Laptops', customerSegment: 'Enterprise', unitsSold: 45, revenue: 67500, profit: 16875, discount: 5, customerRating: 4.8 },
      { date: '2025-01-18', region: 'North America', country: 'Canada', category: 'Furniture', subCategory: 'Chairs', customerSegment: 'Corporate', unitsSold: 120, revenue: 24000, profit: 4800, discount: 10, customerRating: 4.2 },
      { date: '2025-01-25', region: 'Europe', country: 'Germany', category: 'Technology', subCategory: 'Monitors', customerSegment: 'Consumer', unitsSold: 85, revenue: 38250, profit: 9560, discount: 8, customerRating: 4.6 },
      { date: '2025-02-04', region: 'Europe', country: 'United Kingdom', category: 'Office Supplies', subCategory: 'Storage', customerSegment: 'Enterprise', unitsSold: 310, revenue: 15500, profit: 4650, discount: 0, customerRating: 4.4 },
      { date: '2025-02-14', region: 'Asia Pacific', country: 'Japan', category: 'Technology', subCategory: 'Laptops', customerSegment: 'Enterprise', unitsSold: 62, revenue: 99200, profit: 27770, discount: 4, customerRating: 4.9 },
      { date: '2025-02-22', region: 'Asia Pacific', country: 'Australia', category: 'Furniture', subCategory: 'Tables', customerSegment: 'Consumer', unitsSold: 35, revenue: 19250, profit: 2880, discount: 15, customerRating: 3.9 },
      { date: '2025-03-05', region: 'Latin America', country: 'Brazil', category: 'Office Supplies', subCategory: 'Paper', customerSegment: 'Corporate', unitsSold: 540, revenue: 10800, profit: 3240, discount: 5, customerRating: 4.1 },
      { date: '2025-03-12', region: 'North America', country: 'United States', category: 'Technology', subCategory: 'Accessories', customerSegment: 'Consumer', unitsSold: 210, revenue: 16800, profit: 6720, discount: 0, customerRating: 4.5 },
      { date: '2025-03-20', region: 'Europe', country: 'France', category: 'Technology', subCategory: 'Laptops', customerSegment: 'Enterprise', unitsSold: 50, revenue: 77500, profit: 20150, discount: 6, customerRating: 4.7 },
      { date: '2025-04-02', region: 'Asia Pacific', country: 'Singapore', category: 'Furniture', subCategory: 'Chairs', customerSegment: 'Corporate', unitsSold: 95, revenue: 20900, profit: 4180, discount: 8, customerRating: 4.3 },
      { date: '2025-04-15', region: 'North America', country: 'United States', category: 'Office Supplies', subCategory: 'Appliances', customerSegment: 'Enterprise', unitsSold: 78, revenue: 31200, profit: 9360, discount: 12, customerRating: 4.6 },
      { date: '2025-04-28', region: 'Europe', country: 'Netherlands', category: 'Technology', subCategory: 'Monitors', customerSegment: 'Corporate', unitsSold: 110, revenue: 49500, profit: 12870, discount: 5, customerRating: 4.8 },
      { date: '2025-05-09', region: 'Asia Pacific', country: 'Japan', category: 'Furniture', subCategory: 'Desks', customerSegment: 'Consumer', unitsSold: 42, revenue: 23100, profit: 3465, discount: 10, customerRating: 4.0 },
      { date: '2025-05-18', region: 'Latin America', country: 'Mexico', category: 'Technology', subCategory: 'Accessories', customerSegment: 'Consumer', unitsSold: 180, revenue: 14400, profit: 5040, discount: 5, customerRating: 4.3 },
      { date: '2025-06-01', region: 'North America', country: 'United States', category: 'Technology', subCategory: 'Laptops', customerSegment: 'Enterprise', unitsSold: 75, revenue: 116250, profit: 31380, discount: 7, customerRating: 4.9 },
      { date: '2025-06-14', region: 'Europe', country: 'Germany', category: 'Office Supplies', subCategory: 'Storage', customerSegment: 'Consumer', unitsSold: 240, revenue: 12000, profit: 3360, discount: 10, customerRating: 4.2 },
      { date: '2025-06-25', region: 'Asia Pacific', country: 'South Korea', category: 'Technology', subCategory: 'Monitors', customerSegment: 'Enterprise', unitsSold: 90, revenue: 42300, profit: 11840, discount: 4, customerRating: 4.7 },
      { date: '2025-07-08', region: 'North America', country: 'Canada', category: 'Furniture', subCategory: 'Desks', customerSegment: 'Corporate', unitsSold: 65, revenue: 37050, profit: 6670, discount: 8, customerRating: 4.4 },
      { date: '2025-07-20', region: 'Europe', country: 'United Kingdom', category: 'Technology', subCategory: 'Accessories', customerSegment: 'Consumer', unitsSold: 320, revenue: 25600, profit: 8960, discount: 5, customerRating: 4.5 },
      { date: '2025-08-04', region: 'Asia Pacific', country: 'India', category: 'Technology', subCategory: 'Laptops', customerSegment: 'Enterprise', unitsSold: 88, revenue: 123200, profit: 30800, discount: 10, customerRating: 4.8 },
      { date: '2025-08-16', region: 'Latin America', country: 'Chile', category: 'Office Supplies', subCategory: 'Paper', customerSegment: 'Consumer', unitsSold: 410, revenue: 8200, profit: 2460, discount: 0, customerRating: 4.1 },
      { date: '2025-08-28', region: 'North America', country: 'United States', category: 'Furniture', subCategory: 'Chairs', customerSegment: 'Enterprise', unitsSold: 140, revenue: 32200, profit: 7730, discount: 6, customerRating: 4.6 },
      { date: '2025-09-10', region: 'Europe', country: 'France', category: 'Office Supplies', subCategory: 'Appliances', customerSegment: 'Corporate', unitsSold: 60, revenue: 25200, profit: 6300, discount: 8, customerRating: 4.3 },
      { date: '2025-09-22', region: 'Asia Pacific', country: 'Japan', category: 'Technology', subCategory: 'Monitors', customerSegment: 'Consumer', unitsSold: 130, revenue: 61100, profit: 16500, discount: 3, customerRating: 4.9 },
      { date: '2025-10-05', region: 'North America', country: 'United States', category: 'Technology', subCategory: 'Laptops', customerSegment: 'Corporate', unitsSold: 92, revenue: 147200, profit: 41210, discount: 5, customerRating: 4.8 },
      { date: '2025-10-18', region: 'Europe', country: 'Italy', category: 'Furniture', subCategory: 'Tables', customerSegment: 'Consumer', unitsSold: 48, revenue: 27840, profit: 4170, discount: 12, customerRating: 4.0 },
      { date: '2025-11-02', region: 'Asia Pacific', country: 'Australia', category: 'Office Supplies', subCategory: 'Storage', customerSegment: 'Enterprise', unitsSold: 280, revenue: 14000, profit: 4200, discount: 0, customerRating: 4.5 },
      { date: '2025-11-15', region: 'North America', country: 'Canada', category: 'Technology', subCategory: 'Accessories', customerSegment: 'Corporate', unitsSold: 250, revenue: 21250, profit: 7430, discount: 5, customerRating: 4.4 },
      { date: '2025-11-28', region: 'North America', country: 'United States', category: 'Furniture', subCategory: 'Desks', customerSegment: 'Enterprise', unitsSold: 80, revenue: 48000, profit: 10560, discount: 10, customerRating: 4.6 },
      { date: '2025-12-10', region: 'Europe', country: 'Germany', category: 'Technology', subCategory: 'Laptops', customerSegment: 'Enterprise', unitsSold: 110, revenue: 176000, profit: 47520, discount: 8, customerRating: 4.9 }
    ]
  },
  {
    id: 'saas-metrics',
    name: 'SaaS Platform & Growth Metrics',
    description: 'Monthly performance data including MRR, active users, churn rate, retention, and service telemetry.',
    source: 'preset',
    createdAt: '2026-02-01',
    columns: [
      { key: 'month', name: 'Month', type: 'string' },
      { key: 'tier', name: 'Plan Tier', type: 'string' },
      { key: 'activeUsers', name: 'Active Users', type: 'number' },
      { key: 'mrr', name: 'Monthly Recurring Revenue ($)', type: 'number', unit: '$' },
      { key: 'arr', name: 'Annual Run Rate ($)', type: 'number', unit: '$' },
      { key: 'churnRate', name: 'Churn Rate (%)', type: 'number', unit: '%' },
      { key: 'npsScore', name: 'NPS Score', type: 'number' },
      { key: 'expansionRevenue', name: 'Expansion Revenue ($)', type: 'number', unit: '$' },
      { key: 'avgLatencyMs', name: 'Avg API Latency (ms)', type: 'number', unit: 'ms' }
    ],
    data: [
      { month: 'Jan 2025', tier: 'Starter', activeUsers: 4500, mrr: 22500, arr: 270000, churnRate: 4.2, npsScore: 52, expansionRevenue: 1200, avgLatencyMs: 142 },
      { month: 'Jan 2025', tier: 'Professional', activeUsers: 1800, mrr: 54000, arr: 648000, churnRate: 2.1, npsScore: 68, expansionRevenue: 5800, avgLatencyMs: 118 },
      { month: 'Jan 2025', tier: 'Enterprise', activeUsers: 240, mrr: 120000, arr: 1440000, churnRate: 0.5, npsScore: 81, expansionRevenue: 18500, avgLatencyMs: 82 },
      
      { month: 'Feb 2025', tier: 'Starter', activeUsers: 4850, mrr: 24250, arr: 291000, churnRate: 3.9, npsScore: 54, expansionRevenue: 1450, avgLatencyMs: 138 },
      { month: 'Feb 2025', tier: 'Professional', activeUsers: 1980, mrr: 59400, arr: 712800, churnRate: 1.9, npsScore: 70, expansionRevenue: 6200, avgLatencyMs: 115 },
      { month: 'Feb 2025', tier: 'Enterprise', activeUsers: 255, mrr: 127500, arr: 1530000, churnRate: 0.4, npsScore: 82, expansionRevenue: 21000, avgLatencyMs: 79 },
      
      { month: 'Mar 2025', tier: 'Starter', activeUsers: 5300, mrr: 26500, arr: 318000, churnRate: 3.6, npsScore: 56, expansionRevenue: 1600, avgLatencyMs: 135 },
      { month: 'Mar 2025', tier: 'Professional', activeUsers: 2150, mrr: 64500, arr: 774000, churnRate: 1.8, npsScore: 72, expansionRevenue: 7100, avgLatencyMs: 112 },
      { month: 'Mar 2025', tier: 'Enterprise', activeUsers: 272, mrr: 136000, arr: 1632000, churnRate: 0.3, npsScore: 84, expansionRevenue: 24500, avgLatencyMs: 76 },
      
      { month: 'Apr 2025', tier: 'Starter', activeUsers: 5800, mrr: 29000, arr: 348000, churnRate: 3.4, npsScore: 58, expansionRevenue: 1900, avgLatencyMs: 130 },
      { month: 'Apr 2025', tier: 'Professional', activeUsers: 2380, mrr: 71400, arr: 856800, churnRate: 1.6, npsScore: 74, expansionRevenue: 8400, avgLatencyMs: 108 },
      { month: 'Apr 2025', tier: 'Enterprise', activeUsers: 290, mrr: 145000, arr: 1740000, churnRate: 0.3, npsScore: 85, expansionRevenue: 28000, avgLatencyMs: 72 },
      
      { month: 'May 2025', tier: 'Starter', activeUsers: 6250, mrr: 31250, arr: 375000, churnRate: 3.2, npsScore: 60, expansionRevenue: 2200, avgLatencyMs: 125 },
      { month: 'May 2025', tier: 'Professional', activeUsers: 2600, mrr: 78000, arr: 936000, churnRate: 1.5, npsScore: 76, expansionRevenue: 9800, avgLatencyMs: 104 },
      { month: 'May 2025', tier: 'Enterprise', activeUsers: 315, mrr: 157500, arr: 1890000, churnRate: 0.2, npsScore: 87, expansionRevenue: 33000, avgLatencyMs: 69 },
      
      { month: 'Jun 2025', tier: 'Starter', activeUsers: 6800, mrr: 34000, arr: 408000, churnRate: 3.0, npsScore: 62, expansionRevenue: 2500, avgLatencyMs: 120 },
      { month: 'Jun 2025', tier: 'Professional', activeUsers: 2880, mrr: 86400, arr: 1036800, churnRate: 1.4, npsScore: 78, expansionRevenue: 11500, avgLatencyMs: 99 },
      { month: 'Jun 2025', tier: 'Enterprise', activeUsers: 340, mrr: 170000, arr: 2040000, churnRate: 0.2, npsScore: 89, expansionRevenue: 38500, avgLatencyMs: 65 }
    ]
  },
  {
    id: 'marketing-attribution',
    name: 'Marketing Acquisition & Multi-Channel ROI',
    description: 'Campaign attribution, ad spend, conversion rates, customer acquisition cost (CAC), and return on ad spend.',
    source: 'preset',
    createdAt: '2026-02-10',
    columns: [
      { key: 'channel', name: 'Channel', type: 'string' },
      { key: 'campaignType', name: 'Campaign Type', type: 'string' },
      { key: 'spend', name: 'Ad Spend ($)', type: 'number', unit: '$' },
      { key: 'impressions', name: 'Impressions', type: 'number' },
      { key: 'clicks', name: 'Clicks', type: 'number' },
      { key: 'conversions', name: 'Conversions', type: 'number' },
      { key: 'revenueGenerated', name: 'Revenue Generated ($)', type: 'number', unit: '$' },
      { key: 'cac', name: 'CAC ($)', type: 'number', unit: '$' },
      { key: 'roas', name: 'ROAS (x)', type: 'number' }
    ],
    data: [
      { channel: 'Google Search', campaignType: 'High-Intent Brand', spend: 28500, impressions: 450000, clicks: 36000, conversions: 1850, revenueGenerated: 142000, cac: 15.4, roas: 4.98 },
      { channel: 'Google Search', campaignType: 'Non-Brand Category', spend: 42000, impressions: 890000, clicks: 48000, conversions: 1440, revenueGenerated: 138000, cac: 29.1, roas: 3.28 },
      { channel: 'LinkedIn Ads', campaignType: 'B2B Decision Makers', spend: 38000, impressions: 210000, clicks: 12500, conversions: 620, revenueGenerated: 168000, cac: 61.2, roas: 4.42 },
      { channel: 'Meta Ads', campaignType: 'Retargeting Flow', spend: 18500, impressions: 620000, clicks: 31000, conversions: 1240, revenueGenerated: 94500, cac: 14.9, roas: 5.10 },
      { channel: 'Meta Ads', campaignType: 'Lookalike Prospecting', spend: 31000, impressions: 1400000, clicks: 42000, conversions: 980, revenueGenerated: 81000, cac: 31.6, roas: 2.61 },
      { channel: 'YouTube Video', campaignType: 'Brand Awareness', spend: 22000, impressions: 950000, clicks: 19000, conversions: 410, revenueGenerated: 48000, cac: 53.6, roas: 2.18 },
      { channel: 'Organic SEO', campaignType: 'Inbound Content Hub', spend: 9500, impressions: 1850000, clicks: 112000, conversions: 3800, revenueGenerated: 295000, cac: 2.5, roas: 31.05 },
      { channel: 'Email Newsletter', campaignType: 'Lifecycle Automation', spend: 4800, impressions: 380000, clicks: 45000, conversions: 2450, revenueGenerated: 186000, cac: 1.9, roas: 38.75 },
      { channel: 'Partner Affiliates', campaignType: 'Co-Marketing Deals', spend: 16000, impressions: 290000, clicks: 18000, conversions: 790, revenueGenerated: 74000, cac: 20.2, roas: 4.62 }
    ]
  },
  {
    id: 'iot-telemetry',
    name: 'Smart Energy & IoT Environmental Telemetry',
    description: 'Real-time readings from sensor nodes tracking temperature, humidity, power consumption, and air quality.',
    source: 'preset',
    createdAt: '2026-02-15',
    columns: [
      { key: 'location', name: 'Facility Location', type: 'string' },
      { key: 'zone', name: 'Building Zone', type: 'string' },
      { key: 'temperature', name: 'Temperature (°C)', type: 'number', unit: '°C' },
      { key: 'humidity', name: 'Humidity (%)', type: 'number', unit: '%' },
      { key: 'co2Level', name: 'CO2 Level (ppm)', type: 'number', unit: 'ppm' },
      { key: 'powerUsageKwh', name: 'Power Usage (kWh)', type: 'number', unit: 'kWh' },
      { key: 'aqiIndex', name: 'Air Quality Index', type: 'number' },
      { key: 'status', name: 'System Status', type: 'string' }
    ],
    data: [
      { location: 'HQ Data Center', zone: 'Server Hall A', temperature: 21.4, humidity: 44, co2Level: 410, powerUsageKwh: 145.8, aqiIndex: 18, status: 'Optimal' },
      { location: 'HQ Data Center', zone: 'Server Hall B', temperature: 22.8, humidity: 46, co2Level: 425, powerUsageKwh: 158.2, aqiIndex: 22, status: 'Optimal' },
      { location: 'HQ Data Center', zone: 'Power UPS Hub', temperature: 24.1, humidity: 40, co2Level: 440, powerUsageKwh: 89.4, aqiIndex: 25, status: 'Optimal' },
      { location: 'North Tower', zone: 'Floor 1 Lobby', temperature: 22.0, humidity: 52, co2Level: 520, powerUsageKwh: 34.2, aqiIndex: 35, status: 'Optimal' },
      { location: 'North Tower', zone: 'Floor 4 Open Office', temperature: 23.5, humidity: 55, co2Level: 680, powerUsageKwh: 48.6, aqiIndex: 45, status: 'Moderate' },
      { location: 'North Tower', zone: 'Floor 8 Executive', temperature: 21.8, humidity: 50, co2Level: 490, powerUsageKwh: 28.1, aqiIndex: 28, status: 'Optimal' },
      { location: 'Innovation Labs', zone: 'Robotics Bay', temperature: 25.2, humidity: 38, co2Level: 560, powerUsageKwh: 112.5, aqiIndex: 40, status: 'Optimal' },
      { location: 'Innovation Labs', zone: 'Chemical Testing', temperature: 19.5, humidity: 42, co2Level: 430, powerUsageKwh: 76.0, aqiIndex: 15, status: 'Optimal' },
      { location: 'South Warehouse', zone: 'Loading Dock', temperature: 27.6, humidity: 62, co2Level: 750, powerUsageKwh: 52.0, aqiIndex: 65, status: 'Warning' },
      { location: 'South Warehouse', zone: 'Cold Storage Area', temperature: 4.2, humidity: 82, co2Level: 390, powerUsageKwh: 185.0, aqiIndex: 12, status: 'Optimal' },
      { location: 'South Warehouse', zone: 'Assembly Line 1', temperature: 24.8, humidity: 58, co2Level: 630, powerUsageKwh: 94.2, aqiIndex: 48, status: 'Optimal' }
    ]
  }
];
