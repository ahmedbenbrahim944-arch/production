// src/semaine/entities/semaine.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Admin } from '../../admin/entities/admin.entity';
import { SemaineLigne } from './semaine-ligne.entity';
import { Planification } from './planification.entity';

@Entity('semaines')
export class Semaine {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  nom: string; // ex: "semaine46"

  @Column({ type: 'date' })
  dateDebut: Date;

  @Column({ type: 'date' })
  dateFin: Date;

  @ManyToOne(() => Admin, (admin) => admin.semainesCrees)
  creePar: Admin;

  @OneToMany(() => SemaineLigne, (semaineLigne) => semaineLigne.semaine, { cascade: true })
  lignes: SemaineLigne[];

  @OneToMany(() => Planification, (planification) => planification.semaineEntity, { cascade: true })
  planifications: Planification[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}