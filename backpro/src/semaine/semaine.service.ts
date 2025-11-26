// src/semaine/semaine.service.ts - Version complète avec planification
import { Injectable, NotFoundException, ConflictException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Semaine } from './entities/semaine.entity';
import { SemaineLigne } from './entities/semaine-ligne.entity';
import { LigneReference, ProductionData } from './entities/ligne-reference.entity';
import { Planification } from './entities/planification.entity';
import { CreateSemaineDto } from './dto/create-semaine.dto';
import { UpdateProductionDto } from './dto/update-production.dto';
import { CreatePlanificationDto } from './dto/create-planification.dto';
import { UpdatePlanificationDto } from './dto/update-planification.dto';
import { Admin } from '../admin/entities/admin.entity';
import { Product } from '../product/entities/product.entity';
import { UpdateProductionSimpleDto } from './dto/update-production-simple.dto';
import { TempsSec } from '../temps-sec/entities/temps-sec.entity';

@Injectable()
export class SemaineService {
  constructor(
    @InjectRepository(Semaine)
    private semaineRepository: Repository<Semaine>,
    @InjectRepository(SemaineLigne)
    private semaineLigneRepository: Repository<SemaineLigne>,
    @InjectRepository(LigneReference)
    private ligneReferenceRepository: Repository<LigneReference>,
    @InjectRepository(Planification)
    private planificationRepository: Repository<Planification>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
     @InjectRepository(TempsSec) // AJOUTER CETTE LIGNE
  private tempsSecRepository: Repository<TempsSec>, // AJOUTER CETTE LIGNE
  ) {}

  // ==================== MÉTHODES PLANIFICATION ====================

  // Dans src/semaine/semaine.service.ts - Méthode createPlanification
// Dans src/semaine/semaine.service.ts - Méthode createPlanification corrigée
async createPlanification(createPlanificationDto: CreatePlanificationDto) {
  const { semaine, jour, ligne, reference, qtePlanifiee = 0 } = createPlanificationDto;

  console.log('=== DÉBUT CRÉATION PLANIFICATION ===');
  console.log('Données reçues:', { semaine, jour, ligne, reference, qtePlanifiee });

  // Valider le jour
  const joursValides = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  if (!joursValides.includes(jour)) {
    throw new BadRequestException('Jour invalide. Les jours valides sont: lundi, mardi, mercredi, jeudi, vendredi, samedi');
  }

  // Vérifier si la planification existe déjà
  const existingPlanification = await this.planificationRepository.findOne({
    where: {
      semaine,
      jour,
      ligne,
      reference
    }
  });

  if (existingPlanification) {
    throw new ConflictException('Une planification existe déjà pour cette combinaison semaine/jour/ligne/référence');
  }

  // CORRECTION: Bien définir la variable semaineEntity
  const semaineEntity = await this.semaineRepository.findOne({
    where: { nom: semaine }
  });

  if (!semaineEntity) {
    throw new NotFoundException(`Semaine "${semaine}" non trouvée`);
  }

  // RECHERCHER LE TEMPS PAR SECONDE
  const tempsSec = await this.tempsSecRepository.findOne({
    where: { ligne, reference }
  });

  console.log('Temps sec trouvé:', tempsSec);

  if (!tempsSec) {
    throw new NotFoundException(`Temps par seconde non trouvé pour la ligne "${ligne}" et référence "${reference}"`);
  }

  // CALCULER LES CHAMPS AUTOMATIQUES
  const { nbHeuresPlanifiees, nbOperateurs } = this.calculateAutoPlanificationFields(
    qtePlanifiee, 
    tempsSec.seconde
  );

  console.log('Calculs automatiques:', { 
    qtePlanifiee, 
    tempsSec: tempsSec.seconde,
    nbHeuresPlanifiees, 
    nbOperateurs 
  });

  try {
    const planification = new Planification();
    planification.semaine = semaine;
    planification.jour = jour;
    planification.ligne = ligne;
    planification.reference = reference;
    planification.of = createPlanificationDto.of || '';
    planification.qtePlanifiee = qtePlanifiee;
    planification.emballage = createPlanificationDto.emballage || '200';
    planification.nbOperateurs = nbOperateurs;
    planification.nbHeuresPlanifiees = nbHeuresPlanifiees;
    planification.decProduction = 0;
    planification.decMagasin = 0;
    planification.semaineEntity = semaineEntity; // MAINTENANT LA VARIABLE EST DÉFINIE

    console.log('Planification avant sauvegarde:', planification);

    const savedPlanification = await this.planificationRepository.save(planification);

    console.log('Planification sauvegardée:', savedPlanification);

    return {
      message: 'Planification créée avec succès',
      planification: savedPlanification
    };
  } catch (error) {
    console.error('Erreur détaillée création planification:', error);
    throw new InternalServerErrorException('Erreur lors de la création de la planification');
  }
}
 private calculateAutoPlanificationFields(qtePlanifiee: number, tempsSec: number) {
  // Vérifier que les valeurs sont valides
  if (!qtePlanifiee || qtePlanifiee <= 0 || !tempsSec || tempsSec <= 0) {
    return {
      nbHeuresPlanifiees: 0,
      nbOperateurs: 0
    };
  }

  // Calcul du N°H planifié
  const nbHeuresPlanifieesBrut = (qtePlanifiee * tempsSec) / 3600;
  
  // Tronquer à 2 décimales (pas d'arrondi)
  const nbHeuresPlanifiees = Math.floor(nbHeuresPlanifieesBrut * 100) / 100;
  
  // Calcul du N°OP
  const nbOperateursBrut = nbHeuresPlanifiees / 8;
  
  // Tronquer à 2 décimales (pas d'arrondi)
  const nbOperateurs = Math.floor(nbOperateursBrut * 100) / 100;

  console.log('Résultats calcul (tronqués à 2 décimales):', {
    nbHeuresPlanifiees,
    nbOperateurs
  });
  
  return {
    nbHeuresPlanifiees: nbHeuresPlanifiees,
    nbOperateurs: nbOperateurs
  };
}

  async updatePlanification(id: number, updatePlanificationDto: UpdatePlanificationDto) {
  const planification = await this.planificationRepository.findOne({
    where: { id }
  });

  if (!planification) {
    throw new NotFoundException('Planification non trouvée');
  }

  try {
    // Si la quantité planifiée change, recalculer les champs automatiques
    if (updatePlanificationDto.qtePlanifiee !== undefined) {
      // Rechercher le temps par seconde
      const tempsSec = await this.tempsSecRepository.findOne({
        where: { 
          ligne: planification.ligne, 
          reference: planification.reference 
        }
      });

      if (tempsSec) {
        const { nbHeuresPlanifiees, nbOperateurs } = this.calculateAutoPlanificationFields(
          updatePlanificationDto.qtePlanifiee, 
          tempsSec.seconde
        );
        
        planification.nbOperateurs = nbOperateurs;
        // Vous pouvez stocker nbHeuresPlanifiees si vous ajoutez ce champ à l'entité
      }
    }

    // Mettre à jour les autres champs
    if (updatePlanificationDto.of !== undefined) planification.of = updatePlanificationDto.of;
    if (updatePlanificationDto.qtePlanifiee !== undefined) planification.qtePlanifiee = updatePlanificationDto.qtePlanifiee;
    if (updatePlanificationDto.emballage !== undefined) planification.emballage = updatePlanificationDto.emballage;
    if (updatePlanificationDto.decProduction !== undefined) planification.decProduction = updatePlanificationDto.decProduction;
    if (updatePlanificationDto.decMagasin !== undefined) planification.decMagasin = updatePlanificationDto.decMagasin;

    planification.updatedAt = new Date();

    const updatedPlanification = await this.planificationRepository.save(planification);

    return {
      message: 'Planification mise à jour avec succès',
      planification: updatedPlanification
    };
  } catch (error) {
    console.error('Erreur mise à jour planification:', error);
    throw new InternalServerErrorException('Erreur lors de la mise à jour de la planification');
  }
}

  async getPlanificationsBySemaine(semaineNom: string) {
    const semaine = await this.semaineRepository.findOne({
      where: { nom: semaineNom }
    });

    if (!semaine) {
      throw new NotFoundException(`Semaine "${semaineNom}" non trouvée`);
    }

    const planifications = await this.planificationRepository.find({
      where: { semaine: semaineNom },
      order: { ligne: 'ASC', jour: 'ASC', reference: 'ASC' }
    });

    return {
      semaine: {
        id: semaine.id,
        nom: semaine.nom,
        dateDebut: semaine.dateDebut,
        dateFin: semaine.dateFin
      },
      planifications
    };
  }

  async getPlanificationsBySemaineAndLigne(semaineNom: string, ligne: string) {
    const semaine = await this.semaineRepository.findOne({
      where: { nom: semaineNom }
    });

    if (!semaine) {
      throw new NotFoundException(`Semaine "${semaineNom}" non trouvée`);
    }

    const planifications = await this.planificationRepository.find({
      where: { 
        semaine: semaineNom,
        ligne: ligne
      },
      order: { jour: 'ASC', reference: 'ASC' }
    });

    return {
      semaine: {
        id: semaine.id,
        nom: semaine.nom
      },
      ligne: ligne,
      planifications
    };
  }

  async getPlanificationsBySemaineLigneJour(semaineNom: string, ligne: string, jour: string) {
    // Valider le jour
    const joursValides = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    if (!joursValides.includes(jour)) {
      throw new BadRequestException('Jour invalide');
    }

    const semaine = await this.semaineRepository.findOne({
      where: { nom: semaineNom }
    });

    if (!semaine) {
      throw new NotFoundException(`Semaine "${semaineNom}" non trouvée`);
    }

    const planifications = await this.planificationRepository.find({
      where: { 
        semaine: semaineNom,
        ligne: ligne,
        jour: jour
      },
      order: { reference: 'ASC' }
    });

    return {
      semaine: {
        id: semaine.id,
        nom: semaine.nom
      },
      ligne: ligne,
      jour: jour,
      planifications
    };
  }

  async getAllPlanifications() {
    const planifications = await this.planificationRepository.find({
      relations: ['semaineEntity'],
      order: { semaine: 'DESC', ligne: 'ASC', jour: 'ASC' }
    });

    return {
      total: planifications.length,
      planifications: planifications.map(plan => ({
        id: plan.id,
        semaine: plan.semaine,
        jour: plan.jour,
        ligne: plan.ligne,
        reference: plan.reference,
        of: plan.of,
        qtePlanifiee: plan.qtePlanifiee,
        emballage: plan.emballage,
        nbOperateurs: plan.nbOperateurs,
        decProduction: plan.decProduction,
        decMagasin: plan.decMagasin,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
        semaineEntity: {
          id: plan.semaineEntity.id,
          dateDebut: plan.semaineEntity.dateDebut,
          dateFin: plan.semaineEntity.dateFin
        }
      }))
    };
  }

  async deletePlanification(id: number) {
    const planification = await this.planificationRepository.findOne({
      where: { id }
    });

    if (!planification) {
      throw new NotFoundException('Planification non trouvée');
    }

    await this.planificationRepository.remove(planification);

    return {
      message: 'Planification supprimée avec succès',
      planification: {
        id,
        semaine: planification.semaine,
        jour: planification.jour,
        ligne: planification.ligne,
        reference: planification.reference
      }
    };
  }

  async getPlanificationStats(semaineNom: string) {
    const planifications = await this.planificationRepository.find({
      where: { semaine: semaineNom }
    });

    const stats = {
      totalPlanifications: planifications.length,
      totalQtePlanifiee: 0,
      totalDecProduction: 0,
      totalDecMagasin: 0,
      parJour: {},
      parLigne: {}
    };

    planifications.forEach(plan => {
      // Totaux généraux
      stats.totalQtePlanifiee += plan.qtePlanifiee;
      stats.totalDecProduction += plan.decProduction;
      stats.totalDecMagasin += plan.decMagasin;

      // Stats par jour
      if (!stats.parJour[plan.jour]) {
        stats.parJour[plan.jour] = {
          count: 0,
          qtePlanifiee: 0,
          decProduction: 0,
          decMagasin: 0
        };
      }
      stats.parJour[plan.jour].count++;
      stats.parJour[plan.jour].qtePlanifiee += plan.qtePlanifiee;
      stats.parJour[plan.jour].decProduction += plan.decProduction;
      stats.parJour[plan.jour].decMagasin += plan.decMagasin;

      // Stats par ligne
      if (!stats.parLigne[plan.ligne]) {
        stats.parLigne[plan.ligne] = {
          count: 0,
          qtePlanifiee: 0,
          decProduction: 0,
          decMagasin: 0
        };
      }
      stats.parLigne[plan.ligne].count++;
      stats.parLigne[plan.ligne].qtePlanifiee += plan.qtePlanifiee;
      stats.parLigne[plan.ligne].decProduction += plan.decProduction;
      stats.parLigne[plan.ligne].decMagasin += plan.decMagasin;
    });

    return {
      semaine: semaineNom,
      stats
    };
  }

  // ==================== MÉTHODES EXISTANTES (SEMAINE) ====================

  async createSemaine(createSemaineDto: CreateSemaineDto, admin: Admin) {
    const existingSemaine = await this.semaineRepository.findOne({
      where: { nom: createSemaineDto.nom }
    });

    if (existingSemaine) {
      throw new ConflictException(`La semaine "${createSemaineDto.nom}" existe déjà`);
    }

    try {
      const semaine = new Semaine();
      semaine.nom = createSemaineDto.nom;
      semaine.dateDebut = new Date(createSemaineDto.dateDebut);
      semaine.dateFin = new Date(createSemaineDto.dateFin);
      semaine.creePar = admin;

      const savedSemaine = await this.semaineRepository.save(semaine);

      const lignesDistinctes = await this.productRepository
        .createQueryBuilder('product')
        .select('product.ligne', 'ligne')
        .addSelect('MAX(product.imageUrl)', 'imageUrl')
        .addSelect('MAX(product.imageOriginalName)', 'imageOriginalName')
        .groupBy('product.ligne')
        .getRawMany();

      let totalLignesCrees = 0;
      let totalReferencesCrees = 0;

      for (const ligneData of lignesDistinctes) {
        const semaineLigne = new SemaineLigne();
        semaineLigne.nomLigne = ligneData.ligne;
        semaineLigne.imageUrl = ligneData.imageUrl;
        semaineLigne.imageOriginalName = ligneData.imageOriginalName;
        semaineLigne.semaine = savedSemaine;

        const savedSemaineLigne = await this.semaineLigneRepository.save(semaineLigne);
        totalLignesCrees++;

        const references = await this.productRepository.find({
          where: { ligne: ligneData.ligne },
          select: ['reference']
        });

        const ligneReferences: LigneReference[] = [];
        
        for (const ref of references) {
          const ligneRef = new LigneReference();
          ligneRef.reference = ref.reference;
          ligneRef.semaineLigne = savedSemaineLigne;
          
          const emptyProductionData: ProductionData = {
            of: '',
            qtePlanifiee: 0,
            emballage: '',
            nbOperateurs: 0,
            nbHeuresRealisees: 0,
            decProduction: 0,
            deltaProd: 0,
            pcsProd: 0,
            decMagasin: 0,
            deltaProdMag: 0
          };

          ligneRef.lundi = emptyProductionData;
          ligneRef.mardi = emptyProductionData;
          ligneRef.mercredi = emptyProductionData;
          ligneRef.jeudi = emptyProductionData;
          ligneRef.vendredi = emptyProductionData;
          ligneRef.samedi = emptyProductionData;

          ligneReferences.push(ligneRef);
          totalReferencesCrees++;
        }

        if (ligneReferences.length > 0) {
          await this.ligneReferenceRepository.save(ligneReferences);
        }
      }

      return {
        message: `Semaine "${createSemaineDto.nom}" créée avec succès`,
        semaine: {
          id: savedSemaine.id,
          nom: savedSemaine.nom,
          dateDebut: savedSemaine.dateDebut,
          dateFin: savedSemaine.dateFin,
          totalLignes: totalLignesCrees,
          totalReferences: totalReferencesCrees
        }
      };
    } catch (error) {
      console.error('Erreur création semaine:', error);
      throw new InternalServerErrorException('Erreur lors de la création de la semaine');
    }
  }

  async getSemaines() {
    const semaines = await this.semaineRepository.find({
      relations: ['creePar', 'lignes'],
      order: { createdAt: 'DESC' }
    });

    return {
      semaines: semaines.map(semaine => ({
        id: semaine.id,
        nom: semaine.nom,
        dateDebut: semaine.dateDebut,
        dateFin: semaine.dateFin,
        creePar: semaine.creePar.nom,
        totalLignes: semaine.lignes ? semaine.lignes.length : 0,
        createdAt: semaine.createdAt
      }))
    };
  }

  async getSemaineById(id: number) {
    const semaine = await this.semaineRepository.findOne({
      where: { id },
      relations: ['creePar', 'lignes']
    });

    if (!semaine) {
      throw new NotFoundException(`Semaine avec l'ID ${id} non trouvée`);
    }

    return semaine;
  }

  async getSemaineLignes(semaineId: number) {
    const semaine = await this.semaineRepository.findOne({
      where: { id: semaineId },
      relations: ['lignes']
    });

    if (!semaine) {
      throw new NotFoundException('Semaine non trouvée');
    }

    return {
      semaine: {
        id: semaine.id,
        nom: semaine.nom,
        dateDebut: semaine.dateDebut,
        dateFin: semaine.dateFin
      },
      lignes: semaine.lignes ? semaine.lignes.map(ligne => ({
        id: ligne.id,
        nomLigne: ligne.nomLigne,
        imageUrl: ligne.imageUrl
      })) : []
    };
  }

  async getLigneReferences(semaineLigneId: number) {
    const semaineLigne = await this.semaineLigneRepository.findOne({
      where: { id: semaineLigneId },
      relations: ['references', 'semaine']
    });

    if (!semaineLigne) {
      throw new NotFoundException('Ligne non trouvée');
    }

    return {
      semaine: {
        id: semaineLigne.semaine.id,
        nom: semaineLigne.semaine.nom
      },
      ligne: {
        id: semaineLigne.id,
        nomLigne: semaineLigne.nomLigne,
        imageUrl: semaineLigne.imageUrl
      },
      references: semaineLigne.references.map(ref => ({
        id: ref.id,
        reference: ref.reference,
        lundi: this.calculateAutoFields(ref.lundi),
        mardi: this.calculateAutoFields(ref.mardi),
        mercredi: this.calculateAutoFields(ref.mercredi),
        jeudi: this.calculateAutoFields(ref.jeudi),
        vendredi: this.calculateAutoFields(ref.vendredi),
        samedi: this.calculateAutoFields(ref.samedi)
      }))
    };
  }

  async updateProductionData(
    referenceId: number, 
    jour: string, 
    updateData: UpdateProductionDto
  ) {
    const ligneReference = await this.ligneReferenceRepository.findOne({
      where: { id: referenceId }
    });

    if (!ligneReference) {
      throw new NotFoundException('Référence non trouvée');
    }

    const joursValides = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    if (!joursValides.includes(jour)) {
      throw new NotFoundException('Jour invalide');
    }

    try {
      const currentData = ligneReference[jour] || {};
      const updatedData = { ...currentData, ...updateData };
      const finalData = this.calculateAutoFields(updatedData);

      ligneReference[jour] = finalData;
      await this.ligneReferenceRepository.save(ligneReference);

      return {
        message: `Données de production mises à jour pour le ${jour}`,
        data: finalData
      };
    } catch (error) {
      throw new InternalServerErrorException('Erreur lors de la mise à jour des données de production');
    }
  }

  async deleteSemaine(id: number) {
    const semaine = await this.getSemaineById(id);
    
    // Supprimer d'abord les planifications associées
    const planifications = await this.planificationRepository.find({
      where: { semaine: semaine.nom }
    });
    
    if (planifications.length > 0) {
      await this.planificationRepository.remove(planifications);
    }
    
    const semaineLignes = await this.semaineLigneRepository.find({
      where: { semaine: { id } },
      relations: ['references']
    });

    for (const ligne of semaineLignes) {
      if (ligne.references && ligne.references.length > 0) {
        await this.ligneReferenceRepository.remove(ligne.references);
      }
    }

    await this.semaineLigneRepository.remove(semaineLignes);
    await this.semaineRepository.remove(semaine);

    return { message: `Semaine "${semaine.nom}" supprimée avec succès` };
  }

  async getSemaineStats(semaineId: number) {
    const semaine = await this.getSemaineById(semaineId);
    const lignes = await this.semaineLigneRepository.find({
      where: { semaine: { id: semaineId } },
      relations: ['references']
    });

    let totalReferences = 0;
    let totalQtePlanifiee = 0;
    let totalDecProduction = 0;

    lignes.forEach(ligne => {
      ligne.references.forEach(ref => {
        const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
        jours.forEach(jour => {
          const data = ref[jour];
          if (data && data.qtePlanifiee) {
            totalQtePlanifiee += data.qtePlanifiee;
          }
          if (data && data.decProduction) {
            totalDecProduction += data.decProduction;
          }
        });
      });
      totalReferences += ligne.references.length;
    });

    const tauxRealisation = totalQtePlanifiee > 0 
      ? (totalDecProduction / totalQtePlanifiee) * 100 
      : 0;

    return {
      semaine: semaine.nom,
      totalLignes: lignes.length,
      totalReferences,
      totalQtePlanifiee,
      totalDecProduction,
      tauxRealisation: Math.round(tauxRealisation * 100) / 100
    };
  }

  async getAllSemainesWithLignes() {
    const semaines = await this.semaineRepository.find({
      relations: ['lignes'],
      order: { nom: 'DESC' }
    });

    return {
      semaines: semaines.map(semaine => ({
        id: semaine.id,
        nom: semaine.nom,
        dateDebut: semaine.dateDebut,
        dateFin: semaine.dateFin,
        totalLignes: semaine.lignes ? semaine.lignes.length : 0,
        lignes: semaine.lignes ? semaine.lignes.map(ligne => ({
          id: ligne.id,
          nomLigne: ligne.nomLigne,
          imageUrl: ligne.imageUrl
        })) : []
      }))
    };
  }

  async getSemaineComplete(semaineId: number) {
    const semaine = await this.semaineRepository.findOne({
      where: { id: semaineId },
      relations: ['lignes', 'lignes.references', 'creePar']
    });

    if (!semaine) {
      throw new NotFoundException(`Semaine avec l'ID ${semaineId} non trouvée`);
    }

    return {
      id: semaine.id,
      nom: semaine.nom,
      dateDebut: semaine.dateDebut,
      dateFin: semaine.dateFin,
      creePar: semaine.creePar.nom,
      lignes: semaine.lignes.map(ligne => ({
        id: ligne.id,
        nomLigne: ligne.nomLigne,
        imageUrl: ligne.imageUrl,
        references: ligne.references.map(ref => ({
          id: ref.id,
          reference: ref.reference,
          lundi: this.calculateAutoFields(ref.lundi),
          mardi: this.calculateAutoFields(ref.mardi),
          mercredi: this.calculateAutoFields(ref.mercredi),
          jeudi: this.calculateAutoFields(ref.jeudi),
          vendredi: this.calculateAutoFields(ref.vendredi),
          samedi: this.calculateAutoFields(ref.samedi)
        }))
      }))
    };
  }

  async updateProductionSimple(
    jour: string,
    updateData: UpdateProductionSimpleDto
  ) {
    const { semaine, ligne, reference } = updateData;

    const joursValides = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    if (!joursValides.includes(jour)) {
      throw new NotFoundException('Jour invalide');
    }

    try {
      const semaineEntity = await this.semaineRepository.findOne({
        where: { nom: semaine },
        relations: ['lignes']
      });

      if (!semaineEntity) {
        throw new NotFoundException(`Semaine "${semaine}" non trouvée`);
      }

      const semaineLigne = await this.semaineLigneRepository.findOne({
        where: { 
          semaine: { id: semaineEntity.id },
          nomLigne: ligne 
        },
        relations: ['references']
      });

      if (!semaineLigne) {
        throw new NotFoundException(`Ligne "${ligne}" non trouvée dans la semaine "${semaine}"`);
      }

      const ligneReference = await this.ligneReferenceRepository.findOne({
        where: {
          semaineLigne: { id: semaineLigne.id },
          reference: reference
        }
      });

      if (!ligneReference) {
        throw new NotFoundException(`Référence "${reference}" non trouvée dans la ligne "${ligne}"`);
      }

      const currentData = ligneReference[jour] || {};
      const updatedData = { ...currentData, ...updateData };
      
      const { semaine: _, ligne: __, reference: ___, ...productionData } = updatedData;
      
      const finalData = this.calculateAutoFields(productionData);

      ligneReference[jour] = finalData;
      await this.ligneReferenceRepository.save(ligneReference);

      return {
        message: `Données de production mises à jour pour le ${jour}`,
        semaine: semaine,
        ligne: ligne,
        reference: reference,
        data: finalData
      };
    } catch (error) {
      console.error('Erreur mise à jour simple:', error);
      throw new InternalServerErrorException('Erreur lors de la mise à jour des données de production');
    }
  }

  private calculateAutoFields(data: ProductionData | null): ProductionData {
    if (!data) {
      return {
        of: '',
        qtePlanifiee: 0,
        emballage: '',
        nbOperateurs: 0,
        nbHeuresRealisees: 0,
        decProduction: 0,
        deltaProd: 0,
        pcsProd: 0,
        decMagasin: 0,
        deltaProdMag: 0
      };
    }

    const qtePlanifiee = data.qtePlanifiee || 0;
    const decProduction = data.decProduction || 0;
    const decMagasin = data.decMagasin || 0;

    const deltaProd = qtePlanifiee - decProduction;
    const pcsProd = qtePlanifiee > 0 ? (decProduction / qtePlanifiee) * 100 : 0;
    const deltaProdMag = decMagasin - decProduction;

    return {
      of: data.of || '',
      qtePlanifiee: qtePlanifiee,
      emballage: data.emballage || '',
      nbOperateurs: data.nbOperateurs || 0,
      nbHeuresRealisees: data.nbHeuresRealisees || 0,
      decProduction: decProduction,
      deltaProd: deltaProd,
      pcsProd: Math.round(pcsProd * 100) / 100,
      decMagasin: decMagasin,
      deltaProdMag: deltaProdMag
    };
  }
}