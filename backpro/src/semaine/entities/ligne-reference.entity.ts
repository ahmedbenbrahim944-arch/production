// src/semaine/entities/ligne-reference.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { SemaineLigne } from './semaine-ligne.entity';

@Entity('ligne_references')
export class LigneReference {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  reference: string;

  // Champs pour chaque jour (lundi à samedi)
  @Column({ type: 'json', nullable: true })
  lundi: ProductionData;

  @Column({ type: 'json', nullable: true })
  mardi: ProductionData;

  @Column({ type: 'json', nullable: true })
  mercredi: ProductionData;

  @Column({ type: 'json', nullable: true })
  jeudi: ProductionData;

  @Column({ type: 'json', nullable: true })
  vendredi: ProductionData;

  @Column({ type: 'json', nullable: true })
  samedi: ProductionData;

  @ManyToOne(() => SemaineLigne, (semaineLigne) => semaineLigne.references)
  semaineLigne: SemaineLigne;
}

export interface ProductionData {
  of: string; // Ordre de fabrication
  qtePlanifiee: number; // Quantité planifiée
  emballage: string;
  nbOperateurs: number; // N°OP
  nbHeuresRealisees: number; // N°H réalisé (auto)
  decProduction: number; // Déclaration production
  deltaProd: number; // Qte planifiée - Dec production (auto)
  pcsProd: number; // % PCs Prod (Dec production / Qte planifiée) (auto)
  decMagasin: number; // Déclaration magasin
  deltaProdMag: number; // Dec magasin - Dec production (auto)
}