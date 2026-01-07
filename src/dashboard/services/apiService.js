// API service - handle file upload and server communication
// 使用相对路径，通过 Vite 代理转发到后端，避免浏览器直接访问自签名 HTTPS 证书导致 Failed to fetch
const SERVER_URL = '/dashboard_process';

// Convert file to base64 encoding
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove data URL prefix, keep only base64 data
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

// Read JSON file content
const readJsonFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        resolve(jsonData);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = error => reject(error);
    reader.readAsText(file);
  });
};

// Built-in standard criteria (always included)
const BUILT_IN_STANDARD_CRITERIA = {
  "Scope": [
      "3(a)(i),Identify climate-related physical risks the entity is exposed to",
      "3(a)(ii),Identify climate-related transition risks the entity is exposed to",
      "3(b),Identify climate-related opportunities available to the entity",
      "4,Disclose climate-related risks and opportunities that could not reasonably be expected to affect an entityï¿½s prospects are outside the scope of this Standard"
    ],
    "Governance": [
      "5,State the objective of governance disclosures: understanding of governance processes, controls and oversight of climate-related risks and opportunities",
      "6(a)(i),Identify governance body/individual responsible for oversight of climate-related risks/opportunities",
      "6(a)(ii),Describe how appropriate skills/competencies are determined for oversight",
      "6(a)(iii),Explain how and how often oversight body is informed",
      "6(a)(iv),How oversight body incorporates climate risks/opportunities into strategy",
      "6(a)(v),How oversight body sets/monitors climate-related targets and includes metrics in remuneration",
      "6(b)(i),Delegation of oversight to management and structure of responsibility",
      "6(b)(ii),Controls and procedures used by management",
      "7,Avoid unnecessary duplication when climate-related governance is managed as part of broader sustainability oversight",
      "Aus7.1,If AASB S1 is voluntarily applied, integrated governance disclosures should avoid repetition across different sustainability topics"
    ],
    "Strategy": [
      "8,Climate-related financial disclosures on strategy to ensure general purpose financial report to understand entity strategy to manage climate related risk and opportunites.",
      "9(a),Climate-related risks and opportunities that could affect the entityâ€™s prospects",
      "9(b),Current and anticipated effects of climate-related risks/opportunities on business model and value chain",
      "9(c),Effects of risks/opportunities on strategy and decision-making, including transition plan",
      "9(d),Effects of risks/opportunities on financial position, performance and cash flows (current and future)",
      "9(e),Climate resilience of the strategy and business model, based on identified risks and opportunities"
    ],
    "Climate-related risk and opportunities": [
      "10(a),Describe climate-related risks and opportunities",
      "10(b),Classify risk as physical or transition",
      "10(c),Time horizon of risks/opportunities",
      "10(d),Define short/medium/long term",
      "11,Use all reasonable and supportable information (past, current, forecasted) available at the reporting date to identify climate-related risks and opportunities"
    ],
    "Business model and value chain": [
      "13(a),Describe effects on business model and value chain",
      "13(b),Where in the business model/value chain risks are concentrated"
    ],
    "Strategy and decision-making": [
      "14(a),Response plans and target achievement strategies",
      "14(a)(i),Current and anticipated changes to the business model and resource allocation to address climate-related risks/opportunities",
      "14(a)(ii),Current and anticipated direct mitigation and adaptation efforts",
      "14(a)(iii),Current and anticipated indirect mitigation and adaptation efforts",
      "14(a)(iv),Details of climate-related transition plan, including key assumptions and dependencies",
      "14(a)(v),Plan for achieving climate-related targets including GHG emissions targets",
      "14(b),Resourcing, plans to resource, and activities of climate-related risk and opportunities",
      "14(c),Progress since previous disclosures 14 (a)- 2025 data from 14 (a to b)"
    ],
    "Financial position, financial performance and cash flows": [
      "15(a),Current financial effects of climate-related risk and opportunities",
      "15(b),Anticipated financial effects and how climate-related risks and opportunities are included in financial planning",
      "16(a),How climate-related risks/opportunities have affected financial position, performance, and cash flows",
      "16(b),Risks/opportunities likely to cause material adjustments in next reporting period",
      "16(c)(i),Expected financial position changes based on investment/disposal plans, including plans that is not contractually committed",
      "16(c)(ii),Expected financial position changes based on planned sources of funding",
      "16(d),Expected changes to financial performance and cash flows over time",
      "18(a),Use of reasonable and supportable information available at the reporting date",
      "18(b),Use of an approach commensurate with available skills, capabilities, and resources",
      "19(a),Disclosure exemption: effects not separately identifiable",
      "19(b),Disclosure exemption: measurement uncertainty too high",
      "20,Disclosure exemption: lack of skills, capabilities, or resources",
      "21(a),Explanation for not providing quantitative financial information of climate-related risk/opportunity in criteria 19 to 20",
      "21(b),Qualitative info about financial effects and impacted line items",
      "21(c),Quantitative info on combined financial effects about climate-related risk or opportunities where possible"
    ],
    "Climate resilience": [
      "22,Disclose climate resilience of strategy and business model using scenario analysis, including how it reflects identified climate-related risks and opportunities",
      "22(a)(i),Implications of climate resilience assessment on strategy and business model, how to respond, provide climate-related scenario analysis",
      "22(a)(ii),Significant uncertainties in climate resilience assessment",
      "22(a)(iii),Capacity to adjust/adapt strategy and business model to climate change over time, including financial resources, ability to redeploy, repurpose, upgrade or decommission assets, investment effects",
      "22(b)(i),Inputs used in scenario analysis (scenarios, risks, scope, time horizons)",
      "22(b)(ii),Key assumptions in scenario analysis (policy, macro, local, energy, tech)",
      "22(b)(iii),Reporting period in which the scenario analysis was conducted",
      "23,Refer to and consider applicability of cross-industry metric categories in paragraph 29 when preparing disclosures for paragraphs 13ï¿½22"
    ],
    "Risk Management": [
      "24,State the objective of risk management disclosures: to explain how climate-related risks and opportunities are identified, assessed, prioritised, and monitored, and integrated into the overall risk management process",
      "25(a),Processes and policies to identify and assess, prioritise, and monitor climate-related risks and information",
      "25(a)(i),Inputs and parameters used about data sources and scope of operations covered in the process to identifying, assessing, and monitoring climate-related risks",
      "25(a)(ii),Use of climate-related scenario analysis to identify climate-related risks",
      "25(a)(iii),How the nature, likelihood, and magnitude of risks are assessed",
      "25(a)(iv),Prioritisation of climate-related risks relative to other risks",
      "25(a)(v),Processes to monitor climate-related risks",
      "25(a)(vi),Changes to risk identification processes compared with previous reporting period",
      "25(b),Processes used to identify, assess, prioritise and monitor climate-related opportunities, including information on climate-related scenario analysis",
      "25(c),Integration of climate risk/opportunity processes into the overall risk management process",
      "26,Avoid duplication in risk management disclosures when sustainability risks are integrated, per Appendix D",
      "Aus26.1,If AASB S1 is voluntarily applied, avoid repeating information across climate-related and broader sustainability risk disclosures"
    ],
    "Metrics and Targets": [
      "27,State the objective of climate-related financial disclosures on metrics and targets. Understand performance and progress on climate-related targets to meet by law or regulation",
      "28 (a),Disclose information relevant to cross-industry metric categories (see paragraphs 29ï¿½31)",
      "28(c ),Disclose entity's climate-related targets and legally required targets, including to mitigate or adapt climate-related risk or opportunities, including metrics used by governance body or management"
    ],
    "Climate-related metrics": [
      "29 (a),Greenhouse gases:The seven greenhouse gases listed in the Kyoto Protocolï¿½carbon dioxide (CO2); methane (CH4); nitrous oxide (N2O); hydrofluorocarbons (HFCs); nitrogen trifluoride (NF3); perfluorocarbons (PFCs) and sulphur hexafluoride (SF6).",
      "29(a)(i),Absolute gross GHG emissions (Scope 1, 2, 3*) and CO2 equivalent*",
      "29(a)(ii),GHG measurement according to Corporate Accounting and Reporting Standard 2024, or required by juridictional authority with this methodology (see paragraph B23-B25)",
      "29(a)(iii),GHG emission measurement approach include inputs, assumptions, rationale, and changes",
      "29(a)(iv),Disaggregation of Scope 1 and 2 emissions by consolidated group and investees",
      "29(a)(v),Location-based Scope 2 emissions and relevant contractual instruments",
      "29(a)(vi),Scope 3 emissions categories and financed emissions (if applicable)",
      "29(b),Amount and % of assets/business activities vulnerable to transition risks",
      "29(c),Amount and % of assets/business activities vulnerable to physical risks",
      "29(d),Amount and % of assets/business activities aligned with opportunities",
      "29(e),Capital deployed towards climate-related risks and opportunities",
      "29(f)(i),Use of internal carbon pricing* in decision-making, provide scenario analysis",
      "29(f)(ii),Carbon price used per tonne of emissions",
      "29(g)(i),Whether and how climate considerations are factored into executive remuneration",
      "29(g)(ii),Percentage of executive remuneration linked to climate-related considerations",
      "30,Use all reasonable and supportable information available at the reporting date when preparing disclosures under 29(b)ï¿½(d)",
      "31,Refer to paragraphs B64ï¿½B65 when preparing disclosures under 29(b)ï¿½(g)"
    ],
    "Climate-related targets": [
      "33(a),Metric used to set the climate-related targets",
      "33(b),Objective of the target (e.g., mitigation, adaptation, science-based initiatives)",
      "33(c),Part of the entity the target applies to",
      "33(d),Period over which the target applies",
      "33(e),Base period from which progress is measured",
      "33(f),Milestones and interim targets",
      "33(g),Whether the target is absolute or intensity-based",
      "33(h),How the international climate agreement informed the target",
      "34(a),Third-party validation of the target and methodology",
      "34(b),Processes for reviewing the target",
      "34(c),Metrics used to monitor target progress",
      "34(d),Revisions to the target and reasons",
      "35,Performance against each climate-related target and trend analysis",
      "36(a),Which greenhouse gases are covered by the target",
      "36(b),Whether Scope 1, 2, or 3 are covered by the target",
      "36(c),Gross or net target, and disclosure of gross if net is used",
      "36(d),Whether target used sectoral decarbonisation approach",
      "36(e)(i),Reliance on carbon credits to meet the net target",
      "36(e)(ii),Third-party schemes verifying the carbon credits",
      "36(e)(iii),Type of carbon credit (nature-based, tech-based, removal/reduction)",
      "36(e)(iv),Factors affecting credibility and integrity of carbon credits",
      "37.1,Consider applicability of cross-industry metrics when identifying/disclosing target metrics"
    ]
};

// ============================================================================
// LEGACY API CALL - BACKUP (sends full criteria object)
// ============================================================================
// This is the original API call format that sends all criteria requirements
// Kept for backup/reference purposes
export const sendReportToServer_legacy = async (pdfFile, metricsFile) => {
  try {
    // Convert PDF to base64
    const pdfBase64 = await fileToBase64(pdfFile);
    
    // Always start with built-in standard criteria
    const criteria = {
      standard: BUILT_IN_STANDARD_CRITERIA
    };
    
    // If metrics file is provided, add metric section
    if (metricsFile) {
      try {
      const customMetrics = await readJsonFile(metricsFile);
      
        // Add custom metrics if they exist
      if (customMetrics.metric) {
        criteria.metric = customMetrics.metric;
      }
      
        // If custom file has standard section, merge it with built-in (custom takes precedence for overlapping keys)
      if (customMetrics.standard) {
        criteria.standard = {
          ...BUILT_IN_STANDARD_CRITERIA,
          ...customMetrics.standard
        };
        }
      } catch (error) {
        // Continue with built-in criteria only
      }
    }
    
    // Prepare request data - directly use the criteria object
    const payload = {
      pdf_base64: pdfBase64,
      criteria: criteria
    };

    const headers = {
      'Content-Type': 'application/json'
    };

    // Create AbortController for timeout control
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

    try {
      // Send request to server
      const response = await fetch(SERVER_URL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
        // Note: SSL verification should be enabled in production
        // Disabled here for testing purposes
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.statusCode === 200) {
        return {
          success: true,
          data: data.results
        };
      } else {
        throw new Error(data.error || 'Server returned an error');
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout - server took too long to respond');
      }
      throw fetchError;
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// ============================================================================
// NEW API CALL - Optimized format (sends only standard names array + PDF)
// ============================================================================
// Maps display names to API format standard names
const mapStandardNameToAPI = (displayName) => {
  const mapping = {
    'GRI': 'gri',
    'AASB S2': 's2',
    'AASB Scope 3': 'scope3'  // 后端期望 'scope3' 而不是 's3'
  };
  
  return mapping[displayName] || displayName.toLowerCase().replace(/\s+/g, '');
};

// New optimized API call - sends only PDF + array of selected standard names
export const sendReportToServer = async (pdfFile, selectedStandards = []) => {
  try {
    // Validate inputs
    if (!pdfFile) {
      throw new Error('PDF file is required');
    }

    if (!Array.isArray(selectedStandards) || selectedStandards.length === 0) {
      throw new Error('At least one ESG standard must be selected');
    }

    // Convert PDF to base64
    const pdfBase64 = await fileToBase64(pdfFile);
    
    // Map display names to API format (e.g., "GRI" -> "gri", "AASB S2" -> "s2")
    const standardsArray = selectedStandards.map(mapStandardNameToAPI);
    
    // Prepare request data - new optimized format
    const payload = {
      pdf_base64: pdfBase64,
      standards: standardsArray  // e.g., ["gri", "s2", "s3"]
    };

    const headers = {
      'Content-Type': 'application/json'
    };


    // Create AbortController for timeout control
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

    try {
      // Send request to server
      const response = await fetch(SERVER_URL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.statusCode === 200) {
        return {
          success: true,
          data: data.results
        };
      } else {
        throw new Error(data.error || 'Server returned an error');
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout - server took too long to respond');
      }
      throw fetchError;
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Simulated API function (keeping original simulated data functionality)
export const fetchESGReportData = async (companyId, dateRange) => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: {
          // Simulated data
        }
      });
    }, 1000);
  });
};

export const fetchComplianceAnalysis = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: {
          overall: {
            complianceRate: 75,
            greenwashingRisk: 15
          }
        }
      });
    }, 1000);
  });
};

export const fetchRecommendations = async (complianceData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: {
          summary: {
            totalRecommendations: 5
          },
          recommendations: [
            {
              title: "Improve Climate Risk Disclosure",
              description: "Enhance disclosure of climate-related risks and opportunities in line with AASB S2 standards."
            },
            {
              title: "Strengthen Governance Framework",
              description: "Establish clear governance processes for climate-related risk oversight."
            },
            {
              title: "Enhance Metrics and Targets",
              description: "Develop comprehensive climate-related metrics and targets with clear measurement methodologies."
            }
          ]
        }
      });
    }, 1000);
  });
}; 