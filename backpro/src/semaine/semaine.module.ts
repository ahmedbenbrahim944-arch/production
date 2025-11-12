// src/semaine/semaine.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SemaineService } from './semaine.service';
import { SemaineController } from './semaine.controller';
import { Semaine } from './entities/semaine.entity';
import { SemaineLigne } from './entities/semaine-ligne.entity';
import { LigneReference } from './entities/ligne-reference.entity';
import { Planification } from './entities/planification.entity';
import { Product } from '../product/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Semaine, SemaineLigne, LigneReference, Planification, Product])
  ],
  controllers: [SemaineController],
  providers: [SemaineService]
})
export class SemaineModule {}