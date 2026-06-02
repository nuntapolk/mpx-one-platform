import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import databaseConfig from './config/database.config'
import keycloakConfig from './config/keycloak.config'

// ── Entities ──────────────────────────────────────────────────
import { Organization } from './database/entities/organization.entity'
import { BusinessUnit } from './database/entities/business-unit.entity'
import { GovernanceDomain } from './database/entities/governance-domain.entity'
import { Framework } from './database/entities/framework.entity'
import { Obligation } from './database/entities/obligation.entity'
import { Control } from './database/entities/control.entity'
import { ControlMapping } from './database/entities/control-mapping.entity'
import { AssessmentTemplate } from './database/entities/assessment-template.entity'
import { AssessmentTemplateControl } from './database/entities/assessment-template-control.entity'
import { Assessment } from './database/entities/assessment.entity'
import { AssessmentResponse } from './database/entities/assessment-response.entity'
import { RiskRegister } from './database/entities/risk-register.entity'
import { ActionPlan } from './database/entities/action-plan.entity'
import { Issue } from './database/entities/issue.entity'
import { Evidence } from './database/entities/evidence.entity'
import { EvidenceLink } from './database/entities/evidence-link.entity'
import { AuditTrail } from './database/entities/audit-trail.entity'
// Legacy entities (keep for backward compat)
import { ITAsset } from './database/entities/it-asset.entity'
import { ChangeRequest } from './database/entities/change-request.entity'
import { AITool } from './database/entities/ai-tool.entity'
import { DataAsset } from './database/entities/data-asset.entity'
import { RegMapping } from './database/entities/reg-mapping.entity'

// ── Modules ───────────────────────────────────────────────────
import { HealthModule } from './modules/health/health.module'
import { DashboardModule } from './modules/dashboard/dashboard.module'
import { ITAssetsModule } from './modules/it-assets/it-assets.module'
import { ChangeRequestsModule } from './modules/change-requests/change-requests.module'
import { AIToolsModule } from './modules/ai-tools/ai-tools.module'
import { DataAssetsModule } from './modules/data-assets/data-assets.module'
import { RiskRegistersModule } from './modules/risk-registers/risk-registers.module'
import { RegMappingsModule } from './modules/reg-mappings/reg-mappings.module'
import { FrameworksModule } from './modules/frameworks/frameworks.module'
import { ObligationsModule } from './modules/obligations/obligations.module'
import { ControlsModule } from './modules/controls/controls.module'
import { AssessmentsModule } from './modules/assessments/assessments.module'
import { IssuesModule } from './modules/issues/issues.module'
import { EvidencesModule } from './modules/evidences/evidences.module'
import { AuditTrailModule } from './modules/audit-trail/audit-trail.module'

const ALL_ENTITIES = [
  Organization, BusinessUnit, GovernanceDomain,
  Framework, Obligation,
  Control, ControlMapping,
  AssessmentTemplate, AssessmentTemplateControl, Assessment, AssessmentResponse,
  RiskRegister, ActionPlan, Issue,
  Evidence, EvidenceLink,
  AuditTrail,
  // Legacy
  ITAsset, ChangeRequest, AITool, DataAsset, RegMapping,
]

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [databaseConfig, keycloakConfig] }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('database.url'),
        synchronize: config.get<boolean>('database.synchronize'),
        logging: config.get<boolean>('database.logging'),
        entities: ALL_ENTITIES,
      }),
    }),
    HealthModule,
    DashboardModule,
    FrameworksModule,
    ObligationsModule,
    ControlsModule,
    AssessmentsModule,
    IssuesModule,
    EvidencesModule,
    AuditTrailModule,
    // Legacy modules
    ITAssetsModule,
    ChangeRequestsModule,
    AIToolsModule,
    DataAssetsModule,
    RiskRegistersModule,
    RegMappingsModule,
  ],
})
export class AppModule {}
