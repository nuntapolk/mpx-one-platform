import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import databaseConfig from './config/database.config'
import keycloakConfig from './config/keycloak.config'

// ── Core entities ─────────────────────────────────────────────
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
// ── M02 Shared Inventory entities ─────────────────────────────
import { Application } from './database/entities/application.entity'
import { DataAssetInventory } from './database/entities/data-asset-inventory.entity'
import { RopaActivity } from './database/entities/ropa.entity'
import { Vendor } from './database/entities/vendor.entity'
import { Project } from './database/entities/project.entity'
import { AIUseCase } from './database/entities/ai-use-case.entity'
import { OicRequirement } from './database/entities/oic-requirement.entity'
import { Lookup } from './database/entities/lookup.entity'
import { OwnerAssignment } from './database/entities/owner-assignment.entity'
// PDPA
import { DataSubject } from './database/entities/data-subject.entity'
import { ConsentTemplate } from './database/entities/consent-template.entity'
import { Consent } from './database/entities/consent.entity'
import { RightsRequest } from './database/entities/rights-request.entity'
import { RightsRequestNote } from './database/entities/rights-request-note.entity'
import { BreachIncident } from './database/entities/breach-incident.entity'
import { BreachTimeline } from './database/entities/breach-timeline.entity'
import { PrivacyNotice } from './database/entities/privacy-notice.entity'
import { RetentionSchedule } from './database/entities/retention-schedule.entity'
import { Dpia } from './database/entities/dpia.entity'
import { DpoTask } from './database/entities/dpo-task.entity'
import { CookieBannerSetting } from './database/entities/cookie-banner.entity'
import { CookieConsent } from './database/entities/cookie-consent.entity'
import { TrainingCourse } from './database/entities/training-course.entity'
import { TrainingCompletion } from './database/entities/training-completion.entity'
import { ExternalParty } from './database/entities/external-party.entity'
import { DataProcessingAgreement } from './database/entities/dpa.entity'
import { RopaCampaign } from './database/entities/ropa-campaign.entity'
import { RopaCampaignInvitee } from './database/entities/ropa-campaign-invitee.entity'
// Legacy entities (kept for old dashboard widgets)
import { ITAsset } from './database/entities/it-asset.entity'
import { ChangeRequest } from './database/entities/change-request.entity'
import { AITool } from './database/entities/ai-tool.entity'
import { RegMapping } from './database/entities/reg-mapping.entity'

// ── Modules ───────────────────────────────────────────────────
import { HealthModule } from './modules/health/health.module'
import { DashboardModule } from './modules/dashboard/dashboard.module'
import { RiskRegistersModule } from './modules/risk-registers/risk-registers.module'
import { FrameworksModule } from './modules/frameworks/frameworks.module'
import { ObligationsModule } from './modules/obligations/obligations.module'
import { ControlsModule } from './modules/controls/controls.module'
import { AssessmentsModule } from './modules/assessments/assessments.module'
import { IssuesModule } from './modules/issues/issues.module'
import { EvidencesModule } from './modules/evidences/evidences.module'
import { AuditTrailModule } from './modules/audit-trail/audit-trail.module'
// M02 Shared Inventory modules
import { ApplicationsModule } from './modules/applications/applications.module'
import { DataAssetsModule } from './modules/data-assets/data-assets.module'
import { RopaModule } from './modules/ropa/ropa.module'
import { VendorsModule } from './modules/vendors/vendors.module'
import { ProjectsModule } from './modules/projects/projects.module'
import { AiUseCasesModule } from './modules/ai-use-cases/ai-use-cases.module'
import { OicModule } from './modules/oic/oic.module'
import { ImportExportModule } from './modules/import-export/import-export.module'
import { AdminModule } from './modules/admin/admin.module'
import { OwnersModule } from './modules/owners/owners.module'
import { ConsentModule } from './modules/consent/consent.module'
import { DsarModule } from './modules/dsar/dsar.module'
import { BreachModule } from './modules/breach/breach.module'
import { PrivacyModule } from './modules/privacy/privacy.module'
import { DpiaModule } from './modules/dpia/dpia.module'
import { DpoModule } from './modules/dpo/dpo.module'
import { TrainingModule } from './modules/training/training.module'
import { ExternalPartiesModule } from './modules/external-parties/external-parties.module'
import { RopaCampaignsModule } from './modules/ropa-campaigns/ropa-campaigns.module'
import { CookieModule } from './modules/cookie/cookie.module'
import { DataMapModule } from './modules/data-map/data-map.module'
import { ReportsModule } from './modules/reports/reports.module'
import { PublicPortalModule } from './modules/public-portal/public-portal.module'
// Legacy modules
import { ITAssetsModule } from './modules/it-assets/it-assets.module'
import { ChangeRequestsModule } from './modules/change-requests/change-requests.module'
import { AIToolsModule } from './modules/ai-tools/ai-tools.module'
import { RegMappingsModule } from './modules/reg-mappings/reg-mappings.module'

const ALL_ENTITIES = [
  Organization, BusinessUnit, GovernanceDomain,
  Framework, Obligation,
  Control, ControlMapping,
  AssessmentTemplate, AssessmentTemplateControl, Assessment, AssessmentResponse,
  RiskRegister, ActionPlan, Issue,
  Evidence, EvidenceLink,
  AuditTrail,
  // M02 Shared Inventory
  Application, DataAssetInventory, RopaActivity, Vendor, Project, AIUseCase,
  OicRequirement, Lookup, OwnerAssignment,
  DataSubject, ConsentTemplate, Consent, RightsRequest, RightsRequestNote,
  BreachIncident, BreachTimeline, PrivacyNotice, RetentionSchedule, Dpia,
  DpoTask, CookieBannerSetting, CookieConsent, TrainingCourse, TrainingCompletion,
  ExternalParty, DataProcessingAgreement, RopaCampaign, RopaCampaignInvitee,
  // Legacy
  ITAsset, ChangeRequest, AITool, RegMapping,
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
    // Governance library
    FrameworksModule,
    ObligationsModule,
    ControlsModule,
    AssessmentsModule,
    IssuesModule,
    EvidencesModule,
    AuditTrailModule,
    RiskRegistersModule,
    // M02 Shared Inventory
    ApplicationsModule,
    DataAssetsModule,
    RopaModule,
    VendorsModule,
    ProjectsModule,
    AiUseCasesModule,
    OicModule,
    ImportExportModule,
    AdminModule,
    OwnersModule,
    ConsentModule,
    DsarModule,
    BreachModule,
    PrivacyModule,
    DpiaModule,
    DpoModule,
    TrainingModule,
    ExternalPartiesModule,
    RopaCampaignsModule,
    CookieModule,
    DataMapModule,
    ReportsModule,
    PublicPortalModule,
    // Legacy
    ITAssetsModule,
    ChangeRequestsModule,
    AIToolsModule,
    RegMappingsModule,
  ],
})
export class AppModule {}
