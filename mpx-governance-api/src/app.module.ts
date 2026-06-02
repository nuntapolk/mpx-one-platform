import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import databaseConfig from './config/database.config'
import keycloakConfig from './config/keycloak.config'
import { Organization } from './database/entities/organization.entity'
import { ITAsset } from './database/entities/it-asset.entity'
import { ChangeRequest } from './database/entities/change-request.entity'
import { AITool } from './database/entities/ai-tool.entity'
import { DataAsset } from './database/entities/data-asset.entity'
import { RiskRegister } from './database/entities/risk-register.entity'
import { RegMapping } from './database/entities/reg-mapping.entity'
import { HealthModule } from './modules/health/health.module'
import { DashboardModule } from './modules/dashboard/dashboard.module'
import { ITAssetsModule } from './modules/it-assets/it-assets.module'
import { ChangeRequestsModule } from './modules/change-requests/change-requests.module'
import { AIToolsModule } from './modules/ai-tools/ai-tools.module'
import { DataAssetsModule } from './modules/data-assets/data-assets.module'
import { RiskRegistersModule } from './modules/risk-registers/risk-registers.module'
import { RegMappingsModule } from './modules/reg-mappings/reg-mappings.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, keycloakConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('database.url'),
        synchronize: config.get<boolean>('database.synchronize'),
        logging: config.get<boolean>('database.logging'),
        entities: [Organization, ITAsset, ChangeRequest, AITool, DataAsset, RiskRegister, RegMapping],
        migrationsRun: config.get<boolean>('database.migrationsRun'),
      }),
    }),
    HealthModule,
    DashboardModule,
    ITAssetsModule,
    ChangeRequestsModule,
    AIToolsModule,
    DataAssetsModule,
    RiskRegistersModule,
    RegMappingsModule,
  ],
})
export class AppModule {}
