# ESG VerifAi Dashboard - Data Integration Guide

## Overview

ESG VerifAi Dashboard now supports fetching JSON format ESG data from server APIs and automatically calculating and displaying compliance analysis results.

## Data Structure

### JSON Data Format

The JSON data returned by the server should have the following structure:

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

### Field Descriptions

- **Category Name**: ESG category name (e.g., "Scope", "Governance", "Strategy", etc.)
- **Specific Criterion Description**: Specific standard description
- **Audit Result**: Audit result, possible values:
  - `"Yes"` - Fully compliant
  - `"Few"` - Partially compliant
  - `"No"` - Non-compliant
- **Detailed Results Data**: Detailed result data (supports text description)

## Data Processing Logic

### Compliance Calculation

- **Compliance Standard**: Standards with audit results not "No" are considered compliant
- **Compliance Rate**: `(Compliant Standards Count / Total Standards Count) × 100`
- **Greenwashing Risk**: `((Few + No) Standards Count / Total Standards Count) × 100`

### Automatic Calculation Metrics

1. **Category Compliance Rates**: Compliance standard ratio for each ESG category
2. **Overall Compliance Rate**: Comprehensive compliance rate across all categories
3. **Greenwashing Risk**: Risk assessment based on partially compliant and non-compliant standards
4. **Recommendation Generation**: Automatically generate improvement recommendations based on compliance analysis

## API Services

### Main API Functions

#### `fetchESGReportData(reportId, dateRange)`
Fetch ESG report data
- **Parameters**:
  - `reportId`: Report ID
  - `dateRange`: Date range object `{start, end}`
- **Returns**: Object containing ESG data and metadata

#### `fetchComplianceAnalysis()`
Fetch compliance analysis
- **Returns**: Object containing overall and category-specific compliance statistics

#### `fetchRecommendations(complianceData)`
Fetch recommendations based on compliance data
- **Parameters**: `complianceData` - Compliance analysis data
- **Returns**: Object containing recommendations and recommendation summary

## Dashboard Features

### Summary Area

Displays 14 key metric cards, divided into two rows:

**First Row (7 cards)**:
- Scope
- Governance  
- Strategy
- Climate-related Risk and Opportunities
- Business Model and Value Chain
- Strategy and Decision Making
- Greenwashing Risk (Warning card)

**Second Row (7 cards)**:
- Financial Position and Financial Performance
- Climate Resilience
- Risk Management
- Metrics and Targets
- Climate-related Metrics
- Climate-related Targets
- Compliant Rate (Warning card)

### Details Area

#### Left Table - AASB Scope2
Displays detailed compliance statistics for each ESG category:
- Category: Category name 