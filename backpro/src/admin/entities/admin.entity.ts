// src/admin/entities/admin.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  OneToMany 
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { User } from '../../user/entities/user.entity';
import { Product } from '../../product/entities/product.entity';
import { Semaine } from '../../semaine/entities/semaine.entity'; // Ajouter cette importation

@Entity('admins')
export class Admin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  nom: string;

  @Column({ length: 50 })
  prenom: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ default: true })
  isActive: boolean;

  // Relation: Un admin peut créer plusieurs users (chefs secteur)
  @OneToMany(() => User, (user) => user.createdBy)
  usersCreated: User[];

  @OneToMany(() => Product, (product) => product.createdBy)
  productsCreated: Product[];

  // Relation: Un admin peut créer plusieurs semaines
  @OneToMany(() => Semaine, (semaine) => semaine.creePar)
  semainesCrees: Semaine[]; // Ajouter cette ligne

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}