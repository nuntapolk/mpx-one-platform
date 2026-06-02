// Control → Framework mappings
// Format: [control_id, framework_id, clause, mapping_type, coverage_level]
export const CONTROL_MAPPING_SEED: Array<{
  control_id: string
  framework_id: string
  clause: string
  mapping_type: string
  coverage_level: string
  rationale?: string
}> = [
  // ROPA (CTL-DAT-001) → multiple frameworks
  { control_id: 'CTL-DAT-001', framework_id: 'PDPA-TH',    clause: 'มาตรา 39',        mapping_type: 'full',    coverage_level: 'full',    rationale: 'ROPA required by PDPA มาตรา 39' },
  { control_id: 'CTL-DAT-001', framework_id: 'ISO-27701',  clause: '7.2.1',            mapping_type: 'full',    coverage_level: 'full',    rationale: 'ISO 27701 requires records of processing' },

  // Consent Management
  { control_id: 'CTL-DAT-003', framework_id: 'PDPA-TH',    clause: 'มาตรา 19-26',      mapping_type: 'full',    coverage_level: 'full'    },
  { control_id: 'CTL-DAT-003', framework_id: 'ISO-27701',  clause: '7.3.1',            mapping_type: 'full',    coverage_level: 'full'    },

  // Privacy Notice
  { control_id: 'CTL-DAT-005', framework_id: 'PDPA-TH',    clause: 'มาตรา 23',         mapping_type: 'full',    coverage_level: 'full'    },
  { control_id: 'CTL-DAT-005', framework_id: 'ISO-27701',  clause: '7.3.2',            mapping_type: 'full',    coverage_level: 'full'    },

  // DSAR
  { control_id: 'CTL-DAT-006', framework_id: 'PDPA-TH',    clause: 'มาตรา 30-37',      mapping_type: 'full',    coverage_level: 'full'    },
  { control_id: 'CTL-DAT-006', framework_id: 'ISO-27701',  clause: '7.3.4',            mapping_type: 'full',    coverage_level: 'full'    },

  // DPIA
  { control_id: 'CTL-RSK-005', framework_id: 'PDPA-TH',    clause: 'มาตรา 39(2)',      mapping_type: 'full',    coverage_level: 'full'    },
  { control_id: 'CTL-RSK-005', framework_id: 'ISO-27701',  clause: '7.4.4',            mapping_type: 'full',    coverage_level: 'full'    },

  // Data Breach Notification
  { control_id: 'CTL-INC-002', framework_id: 'PDPA-TH',    clause: 'มาตรา 37(1)',      mapping_type: 'full',    coverage_level: 'full'    },
  { control_id: 'CTL-INC-002', framework_id: 'ISO-27701',  clause: '8.4',              mapping_type: 'full',    coverage_level: 'full'    },

  // DPA Agreement
  { control_id: 'CTL-DAT-009', framework_id: 'PDPA-TH',    clause: 'มาตรา 40-41',      mapping_type: 'full',    coverage_level: 'full'    },
  { control_id: 'CTL-DAT-009', framework_id: 'ISO-27701',  clause: '8.5.2',            mapping_type: 'full',    coverage_level: 'full'    },

  // Data Retention
  { control_id: 'CTL-DAT-004', framework_id: 'PDPA-TH',    clause: 'มาตรา 22',         mapping_type: 'full',    coverage_level: 'full'    },
  { control_id: 'CTL-DAT-004', framework_id: 'ISO-27001',  clause: 'A.8.10',           mapping_type: 'full',    coverage_level: 'full'    },

  // Access Management
  { control_id: 'CTL-ACC-001', framework_id: 'ISO-27001',  clause: 'A.5.15',           mapping_type: 'full',    coverage_level: 'full'    },
  { control_id: 'CTL-ACC-001', framework_id: 'NIST-CSF-2', clause: 'PR.AA-01',         mapping_type: 'full',    coverage_level: 'full'    },
  { control_id: 'CTL-ACC-001', framework_id: 'BOT-IT-RISK', clause: 'หมวด 4 ข้อ 4.1', mapping_type: 'full',    coverage_level: 'full'    },
  { control_id: 'CTL-ACC-001', framework_id: 'COBIT-2019', clause: 'DSS05.04',         mapping_type: 'full',    coverage_level: 'full'    },

  // Privileged Access
  { control_id: 'CTL-ACC-002', framework_id: 'ISO-27001',  clause: 'A.5.18',           mapping_type: 'full',    coverage_level: 'full'    },
  { control_id: 'CTL-ACC-002', framework_id: 'NIST-CSF-2', clause: 'PR.AA-05',         mapping_type: 'full',    coverage_level: 'full'    },
  { control_id: 'CTL-ACC-002', framework_id: 'BOT-IT-RISK', clause: 'หมวด 4 ข้อ 4.2', mapping_type: 'full',    coverage_level: 'full'    },

  // MFA
  { control_id: 'CTL-ACC-004', framework_id: 'ISO-27001',  clause: 'A.8.5',            mapping_type: 'full',    coverage_level: 'full'    },
  { control_id: 'CTL-ACC-004', framework_id: 'NIST-CSF-2', clause: 'PR.AA-03',         mapping_type: 'full',    coverage_level: 'full'    },
  { control_id: 'CTL-ACC-004', framework_id: 'NCSA-CYBER', clause: 'PR.AC-7',          mapping_type: 'full',    coverage_level: 'full'    },

  // Periodic Access Review
  { control_id: 'CTL-ACC-003', framework_id: 'ISO-27001',  clause: 'A.5.18',           mapping_type: 'full',    coverage_level: 'full'    },
  { control_id: 'CTL-ACC-003', framework_id: 'COBIT-2019', clause: 'DSS05.04',         mapping_type: 'full',    coverage_level: 'full'    },
  { control_id: 'CTL-ACC-003', framework_id: 'BOT-IT-RISK', clause: 'หมวด 4 ข้อ 4.3', mapping_type: 'full',    coverage_level: 'full'    },

  // Incident Response
  { control_id: 'CTL-INC-001', framework_id: 'ISO-27001',  clause: 'A.5.26',           mapping_type: 'full',    coverage_level: 'full'    },
  { control_id: 'CTL-INC-001', framework_id: 'NIST-CSF-2', clause: 'RS.MA-01',         mapping_type: 'full',    coverage_level: 'full'    },
  { control_id: 'CTL-INC-001', framework_id: 'BOT-IT-RISK', clause: 'หมวด 7',         mapping_type: 'full',    coverage_level: 'full'    },
  { control_id: 'CTL-INC-001', framework_id: 'NCSA-CYBER', clause: 'RS.RP-1',          mapping_type: 'full',    coverage_level: 'full'    },

  // Security Monitoring
  { control_id: 'CTL-INC-006', framework_id: 'ISO-27001',  clause: 'A.8.16',           mapping_type: 'full',    coverage_level: 'full'    },
  { control_id: 'CTL-INC-006', framework_id: 'NIST-CSF-2', clause: 'DE.CM-01',         mapping_type: 'full',    coverage_level: 'full'    },
  { control_id: 'CTL-INC-006', framework_id: 'NCSA-CYBER', clause: 'DE.CM-7',          mapping_type: 'full',    coverage_level: 'full'    },

  // Vulnerability Management
  { control_id: 'CTL-INC-007', framework_id: 'ISO-27001',  clause: 'A.8.8',            mapping_type: 'full',    coverage_level: 'full'    },
  { control_id: 'CTL-INC-007', framework_id: 'NIST-CSF-2', clause: 'ID.RA-01',         mapping_type: 'full',    coverage_level: 'full'    },
  { control_id: 'CTL-INC-007', framework_id: 'NCSA-CYBER', clause: 'RS.MI-3',          mapping_type: 'full',    coverage_level: 'full'    },

  // Change Management
  { control_id: 'CTL-CHG-001', framework_id: 'ISO-27001',  clause: 'A.8.32',           mapping_type: 'full',    coverage_level: 'full'    },
  { control_id: 'CTL-CHG-001', framework_id: 'COBIT-2019', clause: 'BAI06',            mapping_type: 'full',    coverage_level: 'full'    },
  { control_id: 'CTL-CHG-001', framework_id: 'BOT-IT-RISK', clause: 'หมวด 5',         mapping_type: 'full',    coverage_level: 'full'    },

  // Patch Management
  { control_id: 'CTL-CHG-008', framework_id: 'ISO-27001',  clause: 'A.8.8',            mapping_type: 'full',    coverage_level: 'full'    },
  { control_id: 'CTL-CHG-008', framework_id: 'NIST-CSF-2', clause: 'PR.MA-01',         mapping_type: 'full',    coverage_level: 'full'    },
  { control_id: 'CTL-CHG-008', framework_id: 'NCSA-CYBER', clause: 'PR.IP-12',         mapping_type: 'full',    coverage_level: 'full'    },

  // Governance Committee
  { control_id: 'CTL-GOV-001', framework_id: 'COBIT-2019', clause: 'EDM01',            mapping_type: 'full',    coverage_level: 'full'    },
  { control_id: 'CTL-GOV-001', framework_id: 'ISO-27001',  clause: 'A.5.1',            mapping_type: 'partial', coverage_level: 'partial'  },
  { control_id: 'CTL-GOV-001', framework_id: 'BOT-IT-RISK', clause: 'หมวด 2',         mapping_type: 'full',    coverage_level: 'full'    },

  // IT Risk Assessment
  { control_id: 'CTL-RSK-001', framework_id: 'ISO-27001',  clause: '6.1.2',            mapping_type: 'full',    coverage_level: 'full'    },
  { control_id: 'CTL-RSK-001', framework_id: 'NIST-CSF-2', clause: 'ID.RA-01',         mapping_type: 'full',    coverage_level: 'full'    },
  { control_id: 'CTL-RSK-001', framework_id: 'BOT-IT-RISK', clause: 'หมวด 3',         mapping_type: 'full',    coverage_level: 'full'    },
  { control_id: 'CTL-RSK-001', framework_id: 'COBIT-2019', clause: 'APO12',            mapping_type: 'full',    coverage_level: 'full'    },

  // AI Use Case Approval
  { control_id: 'CTL-AI-001', framework_id: 'NIST-AI-RMF', clause: 'GOVERN 1.1',       mapping_type: 'full',    coverage_level: 'full'    },
  { control_id: 'CTL-AI-001', framework_id: 'BOT-IT-RISK', clause: 'AI Guideline ข้อ 1', mapping_type: 'full', coverage_level: 'full'    },

  // AI Bias Assessment
  { control_id: 'CTL-AI-004', framework_id: 'NIST-AI-RMF', clause: 'MEASURE 2.5',      mapping_type: 'full',    coverage_level: 'full'    },
  { control_id: 'CTL-AI-004', framework_id: 'BOT-IT-RISK', clause: 'AI Guideline ข้อ 3', mapping_type: 'full', coverage_level: 'full'    },

  // AI Transparency
  { control_id: 'CTL-AI-003', framework_id: 'NIST-AI-RMF', clause: 'GOVERN 4.1',       mapping_type: 'full',    coverage_level: 'full'    },

  // Human Oversight
  { control_id: 'CTL-AI-002', framework_id: 'NIST-AI-RMF', clause: 'MANAGE 2.4',       mapping_type: 'full',    coverage_level: 'full'    },

  // Vendor Due Diligence
  { control_id: 'CTL-3RD-001', framework_id: 'ISO-27001',  clause: 'A.5.19',           mapping_type: 'full',    coverage_level: 'full'    },
  { control_id: 'CTL-3RD-001', framework_id: 'PDPA-TH',    clause: 'มาตรา 40',         mapping_type: 'full',    coverage_level: 'full'    },

  // Third Party Contract
  { control_id: 'CTL-3RD-002', framework_id: 'ISO-27001',  clause: 'A.5.20',           mapping_type: 'full',    coverage_level: 'full'    },
  { control_id: 'CTL-3RD-002', framework_id: 'PDPA-TH',    clause: 'มาตรา 41',         mapping_type: 'full',    coverage_level: 'full'    },

  // Audit Trail
  { control_id: 'CTL-EVD-002', framework_id: 'ISO-27001',  clause: 'A.8.15',           mapping_type: 'full',    coverage_level: 'full'    },
  { control_id: 'CTL-EVD-002', framework_id: 'NIST-CSF-2', clause: 'DE.AE-03',         mapping_type: 'full',    coverage_level: 'full'    },
  { control_id: 'CTL-EVD-002', framework_id: 'BOT-IT-RISK', clause: 'หมวด 6',         mapping_type: 'full',    coverage_level: 'full'    },

  // SDLC Security
  { control_id: 'CTL-CHG-003', framework_id: 'ISO-27001',  clause: 'A.8.25',           mapping_type: 'full',    coverage_level: 'full'    },
  { control_id: 'CTL-CHG-003', framework_id: 'NIST-CSF-2', clause: 'PR.DS-02',         mapping_type: 'full',    coverage_level: 'full'    },

  // Data Classification
  { control_id: 'CTL-DAT-002', framework_id: 'ISO-27001',  clause: 'A.5.12',           mapping_type: 'full',    coverage_level: 'full'    },
  { control_id: 'CTL-DAT-002', framework_id: 'NIST-CSF-2', clause: 'ID.AM-05',         mapping_type: 'full',    coverage_level: 'full'    },

  // SoD
  { control_id: 'CTL-ACC-007', framework_id: 'ISO-27001',  clause: 'A.5.3',            mapping_type: 'full',    coverage_level: 'full'    },
  { control_id: 'CTL-ACC-007', framework_id: 'COBIT-2019', clause: 'DSS05.04',         mapping_type: 'full',    coverage_level: 'full'    },
]
