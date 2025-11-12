// src/semaine/entities/semaine-ligne.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, Index } from 'typeorm';
import { Semaine } from './semaine.entity';
import { LigneReference } from './ligne-reference.entity';

@Entity('semaine_lignes')
@Index(['semaine', 'nomLigne'], { unique: true })
export class SemaineLigne {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nomLigne: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string;

  @Column({ type: 'varchar', nullable: true })
  imageOriginalName: string; // AJOUTER CETTE LIGNE

  @ManyToOne(() => Semaine, (semaine) => semaine.lignes, { onDelete: 'CASCADE' })
  semaine: Semaine;

  @OneToMany(() => LigneReference, (ligneRef) => ligneRef.semaineLigne, { cascade: true })
  references: LigneReference[];
}