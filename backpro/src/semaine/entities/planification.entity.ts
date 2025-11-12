// src/semaine/entities/planification.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Semaine } from './semaine.entity';

@Entity('planifications')
export class Planification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  semaine: string; // "semaine46"

  @Column({ type: 'varchar', length: 20 })
  jour: string; // "lundi", "mardi", etc.

  @Column({ type: 'varchar', length: 255 })
  ligne: string; // "L04:RXT1"

  @Column({ type: 'varchar', length: 100 })
  reference: string; // "RA5246801"

  @Column({ type: 'varchar', length: 100, default: '' })
  of: string; // "OF-2024-L04-48-LUNDI"

  @Column({ type: 'int', default: 0 })
  qtePlanifiee: number;

  @Column({ type: 'varchar', length: 100, default: '200' })
  emballage: string;

  @Column({ type: 'int', default: 0 })
  nbOperateurs: number;

  @Column({ type: 'int', default: 0 })
  decProduction: number;

  @Column({ type: 'int', default: 0 })
  decMagasin: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Semaine, (semaine) => semaine.planifications, { onDelete: 'CASCADE' })
  semaineEntity: Semaine;
}