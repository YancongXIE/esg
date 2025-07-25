// API service - handle file upload and server communication
const SERVER_URL = 'https://3.25.57.106/dashboard_process';

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
    "Identify climate-related physical risks the entity is exposed to",
    "Identify climate-related transition risks the entity is exposed to",
    "Identify climate-related opportunities available to the entity",
    "Disclose climate-related risks and opportunities that could not reasonably be expected to affect an entity's prospects are outside the scope of this Standard"
  ],
  "Governance": [
    "State the objective of governance disclosures: understanding of governance processes, controls and oversight of climate-related risks and opportunities",
    "Identify governance body/individual responsible for oversight of climate-related risks/opportunities",
    "Describe how appropriate skills/competencies are determined for oversight",
    "Explain how and how often oversight body is informed",
    "How oversight body incorporates climate risks/opportunities into strategy",
    "How oversight body sets/monitors climate-related targets and includes metrics in remuneration",
    "Delegation of oversight to management and structure of responsibility",
    "Controls and procedures used by management",
    "Avoid unnecessary duplication when climate-related governance is managed as part of broader sustainability oversight",
    "If AASB S1 is voluntarily applied, integrated governance disclosures should avoid repetition across different sustainability topics"
  ],
  "Strategy": [
    "Climate-related financial disclosures on strategy to ensure general purpose financial report to understand entity strategy to manage climate related risk and opportunites.",
    "Climate-related risks and opportunities that could affect the entity's prospects",
    "Current and anticipated effects of climate-related risks/opportunities on business model and value chain",
    "Effects of risks/opportunities on strategy and decision-making, including transition plan",
    "Effects of risks/opportunities on financial position, performance and cash flows (current and future)",
    "Climate resilience of the strategy and business model, based on identified risks and opportunities"
  ],
  "Climate-related risk and opportunities": [
    "Describe climate-related risks and opportunities",
    "Classify risk as physical or transition",
    "Time horizon of risks/opportunities",
    "Define short/medium/long term",
    "Use all reasonable and supportable information (past, current, forecasted) available at the reporting date to identify climate-related risks and opportunities"
  ],
  "Business model and value chain": [
    "Describe effects on business model and value chain",
    "Where in the business model/value chain risks are concentrated"
  ],
  "Strategy and decision-making": [
    "Response plans and target achievement strategies",
    "Current and anticipated changes to the business model and resource allocation to address climate-related risks/opportunities",
    "Current and anticipated direct mitigation and adaptation efforts",
    "Current and anticipated indirect mitigation and adaptation efforts",
    "Details of climate-related transition plan, including key assumptions and dependencies",
    "Plan for achieving climate-related targets including GHG emissions targets",
    "Resourcing, plans to resource, and activities of climate-related risk and opportunities",
    "Progress since previous disclosures 14 (a)- 2025 data from 14 (a to b)"
  ],
  "Financial position, financial performance and cash flows": [
    "Current financial effects of climate-related risk and opportunities",
    "Anticipated financial effects and how climate-related risks and opportunities are included in financial planning",
    "How climate-related risks/opportunities have affected financial position, performance, and cash flows",
    "Risks/opportunities likely to cause material adjustments in next reporting period",
    "Expected financial position changes based on investment/disposal plans, including plans that is not contractually committed",
    "Expected financial position changes based on planned sources of funding",
    "Expected changes to financial performance and cash flows over time",
    "Use of reasonable and supportable information available at the reporting date",
    "Use of an approach commensurate with available skills, capabilities, and resources",
    "Disclosure exemption: effects not separately identifiable",
    "Disclosure exemption: measurement uncertainty too high",
    "Disclosure exemption: lack of skills, capabilities, or resources",
    "Explanation for not providing quantitative financial information of climate-related risk/opportunity in criteria 19 to 20",
    "Qualitative info about financial effects and impacted line items",
    "Quantitative info on combined financial effects about climate-related risk or opportunities where possible"
  ],
  "Climate resilience": [
    "Disclose climate resilience of strategy and business model using scenario analysis, including how it reflects identified climate-related risks and opportunities",
    "Implications of climate resilience assessment on strategy and business model, how to respond, provide climate-related scenario analysis",
    "Significant uncertainties in climate resilience assessment",
    "Capacity to adjust/adapt strategy and business model to climate change over time, including financial resources, ability to redeploy, repurpose, upgrade or decommission assets, investment effects",
    "Inputs used in scenario analysis (scenarios, risks, scope, time horizons)",
    "Key assumptions in scenario analysis (policy, macro, local, energy, tech)",
    "Reporting period in which the scenario analysis was conducted",
    "Refer to and consider applicability of cross-industry metric categories in paragraph 29 when preparing disclosures for paragraphs 13–22"
  ],
  "Risk Management": [
    "State the objective of risk management disclosures: to explain how climate-related risks and opportunities are identified, assessed, prioritised, and monitored, and integrated into the overall risk management process",
    "Processes and policies to identify and assess, prioritise, and monitor climate-related risks and information",
    "Inputs and parameters used about data sources and scope of operations covered in the process to identifying, assessing, and monitoring climate-related risks",
    "Use of climate-related scenario analysis to identify climate-related risks",
    "How the nature, likelihood, and magnitude of risks are assessed",
    "Prioritisation of climate-related risks relative to other risks",
    "Processes to monitor climate-related risks",
    "Changes to risk identification processes compared with previous reporting period",
    "Processes used to identify, assess, prioritise and monitor climate-related opportunities, including information on climate-related scenario analysis",
    "Integration of climate risk/opportunity processes into the overall risk management process",
    "Avoid duplication in risk management disclosures when sustainability risks are integrated, per Appendix D",
    "If AASB S1 is voluntarily applied, avoid repeating information across climate-related and broader sustainability risk disclosures"
  ],
  "Metrics and Targets": [
    "State the objective of climate-related financial disclosures on metrics and targets. Understand performance and progress on climate-related targets to meet by law or regulation",
    "Disclose information relevant to cross-industry metric categories (see paragraphs 29–31)",
    "Disclose entity's climate-related targets and legally required targets, including to mitigate or adapt climate-related risk or opportunities, including metrics used by governance body or management"
  ],
  "Climate-related metrics": [
    "Greenhouse gases:The seven greenhouse gases listed in the Kyoto Protocol—carbon dioxide (CO2); methane (CH4); nitrous oxide (N2O); hydrofluorocarbons (HFCs); nitrogen trifluoride (NF3); perfluorocarbons (PFCs) and sulphur hexafluoride (SF6).",
    "Absolute gross GHG emissions (Scope 1, 2, 3*) and CO2 equivalent*",
    "GHG measurement according to Corporate Accounting and Reporting Standard 2024, or required by juridictional authority with this methodology (see paragraph B23-B25)",
    "GHG emission measurement approach include inputs, assumptions, rationale, and changes",
    "Disaggregation of Scope 1 and 2 emissions by consolidated group and investees",
    "Location-based Scope 2 emissions and relevant contractual instruments",
    "Scope 3 emissions categories and financed emissions (if applicable)",
    "Amount and % of assets/business activities vulnerable to transition risks",
    "Amount and % of assets/business activities vulnerable to physical risks",
    "Amount and % of assets/business activities aligned with opportunities",
    "Capital deployed towards climate-related risks and opportunities",
    "Use of internal carbon pricing* in decision-making, provide scenario analysis",
    "Carbon price used per tonne of emissions",
    "Whether and how climate considerations are factored into executive remuneration",
    "Percentage of executive remuneration linked to climate-related considerations",
    "Use all reasonable and supportable information available at the reporting date when preparing disclosures under 29(b)–(d)",
    "Refer to paragraphs B64–B65 when preparing disclosures under 29(b)–(g)"
  ],
  "Climate-related targets": [
    "Metric used to set the climate-related targets",
    "Objective of the target (e.g., mitigation, adaptation, science-based initiatives)",
    "Part of the entity the target applies to",
    "Period over which the target applies",
    "Base period from which progress is measured",
    "Milestones and interim targets",
    "Whether the target is absolute or intensity-based",
    "How the international climate agreement informed the target",
    "Third-party validation of the target and methodology",
    "Processes for reviewing the target",
    "Metrics used to monitor target progress",
    "Revisions to the target and reasons",
    "Performance against each climate-related target and trend analysis",
    "Which greenhouse gases are covered by the target",
    "Whether Scope 1, 2, or 3 are covered by the target",
    "Gross or net target, and disclosure of gross if net is used",
    "Whether target used sectoral decarbonisation approach",
    "Reliance on carbon credits to meet the net target",
    "Third-party schemes verifying the carbon credits",
    "Type of carbon credit (nature-based, tech-based, removal/reduction)",
    "Factors affecting credibility and integrity of carbon credits",
    "Consider applicability of cross-industry metrics when identifying/disclosing target metrics"
  ]
};

// Send PDF and metrics to server
export const sendReportToServer = async (pdfFile, metricsFile) => {
  try {
    // Convert PDF to base64
    const pdfBase64 = await fileToBase64(pdfFile);
    
    // Prepare criteria - always start with built-in standard criteria
    let criteria = {
      standard: BUILT_IN_STANDARD_CRITERIA
    };
    
    // If metrics file is provided, merge it with standard criteria
    if (metricsFile) {
      const customMetrics = await readJsonFile(metricsFile);
      
      // Merge custom metrics with built-in standard criteria
      if (customMetrics.metric) {
        criteria.metric = customMetrics.metric;
      }
      
      // If custom metrics has standard section, merge it (custom takes precedence)
      if (customMetrics.standard) {
        criteria.standard = {
          ...BUILT_IN_STANDARD_CRITERIA,
          ...customMetrics.standard
        };
      }
    }
    
    // Prepare request data
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
    console.error('Error sending report to server:', error);
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