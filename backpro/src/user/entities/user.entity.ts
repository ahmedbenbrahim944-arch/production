// src/user/entities/user.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  JoinColumn 
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Admin } from '../../admin/entities/admin.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  nom: string;

  @Column({ length: 50 })
  prenom: string;

  @Column()
  @Exclude() // Exclure le password des réponses
  password: string;

  @Column({ default: true })
  isActive: boolean;

  // Relation: L'utilisateur (chef secteur) a été créé par un admin
  @ManyToOne(() => Admin, (admin) => admin.usersCreated, { nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: Admin;

  @Column({ nullable: true })
  createdById: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}