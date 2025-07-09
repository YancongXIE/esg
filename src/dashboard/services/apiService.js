// 模拟API服务 - 用于从服务器获取ESG数据
import exampleData from '../example_data/QAN_2024_Sustainability_Report.json';

// 模拟API延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 获取ESG报告数据
export const fetchESGReportData = async (reportId, dateRange) => {
  try {
    // 模拟网络延迟
    await delay(1000);
    
    // 在实际应用中，这里会是一个真实的API调用
    // const response = await fetch(`/api/esg-reports/${reportId}?startDate=${dateRange.start}&endDate=${dateRange.end}`);
    // const data = await response.json();
    
    // 现在使用示例数据
    return {
      success: true,
      data: exampleData,
      metadata: {
        reportId: reportId || 'QAN_2024',
        company: 'Qantas Airways Limited',
        period: 'FY24 (1 July 2023 - 30 June 2024)',
        lastUpdated: new Date().toISOString(),
        totalCategories: Object.keys(exampleData).length,
        totalCriteria: Object.values(exampleData).reduce((total, category) => {
          return total + category.reduce((catTotal, criterion) => {
            return catTotal + criterion.length;
          }, 0);
        }, 0)
      }
    };
  } catch (error) {
    console.error('Error fetching ESG report data:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch ESG report data'
    };
  }
};

// 获取特定类别的详细数据
export const fetchCategoryDetails = async (categoryName) => {
  try {
    await delay(500);
    
    if (!exampleData[categoryName]) {
      throw new Error(`Category '${categoryName}' not found`);
    }
    
    return {
      success: true,
      data: exampleData[categoryName],
      metadata: {
        category: categoryName,
        totalCriteria: exampleData[categoryName].reduce((total, criterion) => total + criterion.length, 0)
      }
    };
  } catch (error) {
    console.error('Error fetching category details:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch category details'
    };
  }
};

// 获取合规性分析
export const fetchComplianceAnalysis = async () => {
  try {
    await delay(800);
    
    // 计算合规性统计
    let totalCriteria = 0;
    let compliantCriteria = 0;
    let riskCriteria = 0;
    const categoryStats = {};
    
    Object.keys(exampleData).forEach(category => {
      const criteria = exampleData[category];
      let categoryTotal = 0;
      let categoryCompliant = 0;
      let categoryRisk = 0;
      
      criteria.forEach(criterion => {
        criterion.forEach(item => {
          const [specificCriterion, auditResult, resultsData] = item;
          categoryTotal++;
          totalCriteria++;
          
          if (auditResult.toLowerCase() !== 'no') {
            categoryCompliant++;
            compliantCriteria++;
          }
          
          if (auditResult.toLowerCase() === 'few' || auditResult.toLowerCase() === 'no') {
            categoryRisk++;
            riskCriteria++;
          }
        });
      });
      
      categoryStats[category] = {
        total: categoryTotal,
        compliant: categoryCompliant,
        risk: categoryRisk,
        complianceRate: categoryTotal > 0 ? Math.round((categoryCompliant / categoryTotal) * 100) : 0
      };
    });
    
    const overallComplianceRate = totalCriteria > 0 ? Math.round((compliantCriteria / totalCriteria) * 100) : 0;
    const greenwashingRisk = totalCriteria > 0 ? Math.round((riskCriteria / totalCriteria) * 100 * 10) / 10 : 0;
    
    return {
      success: true,
      data: {
        overall: {
          totalCriteria,
          compliantCriteria,
          complianceRate: overallComplianceRate,
          greenwashingRisk
        },
        byCategory: categoryStats
      }
    };
  } catch (error) {
    console.error('Error fetching compliance analysis:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch compliance analysis'
    };
  }
};

// 获取建议和洞察
export const fetchRecommendations = async (complianceData) => {
  try {
    await delay(600);
    
    const { complianceRate, greenwashingRisk } = complianceData.overall;
    
    const recommendations = [];
    
    // 基于合规率的建议
    if (complianceRate < 70) {
      recommendations.push({
        priority: 'high',
        category: 'Compliance',
        title: 'Improve Overall Compliance',
        description: `Current compliance rate of ${complianceRate}% is below target. Focus on areas with lowest scores.`,
        action: 'Review and enhance disclosure practices in low-scoring categories'
      });
    } else if (complianceRate < 85) {
      recommendations.push({
        priority: 'medium',
        category: 'Compliance',
        title: 'Enhance Compliance Standards',
        description: `Good compliance rate of ${complianceRate}%. Identify opportunities for improvement.`,
        action: 'Analyze specific criteria with "Few" or "No" responses'
      });
    }
    
    // 基于绿洗风险的建议
    if (greenwashingRisk > 15) {
      recommendations.push({
        priority: 'high',
        category: 'Transparency',
        title: 'Address Greenwashing Risk',
        description: `High greenwashing risk of ${greenwashingRisk}%. Improve transparency and disclosure quality.`,
        action: 'Enhance disclosure quality and reduce "Few" responses'
      });
    } else if (greenwashingRisk > 8) {
      recommendations.push({
        priority: 'medium',
        category: 'Transparency',
        title: 'Monitor Greenwashing Risk',
        description: `Moderate greenwashing risk of ${greenwashingRisk}%. Continue monitoring and improvement.`,
        action: 'Focus on converting "Few" responses to "Yes"'
      });
    }
    
    // 基于具体类别的建议
    Object.keys(complianceData.byCategory).forEach(category => {
      const stats = complianceData.byCategory[category];
      if (stats.complianceRate < 60) {
        recommendations.push({
          priority: 'medium',
          category: category,
          title: `Improve ${category} Compliance`,
          description: `${category} has ${stats.complianceRate}% compliance rate.`,
          action: `Review ${stats.total - stats.compliant} non-compliant criteria in ${category}`
        });
      }
    });
    
    return {
      success: true,
      data: {
        recommendations,
        summary: {
          totalRecommendations: recommendations.length,
          highPriority: recommendations.filter(r => r.priority === 'high').length,
          mediumPriority: recommendations.filter(r => r.priority === 'medium').length
        }
      }
    };
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch recommendations'
    };
  }
}; 