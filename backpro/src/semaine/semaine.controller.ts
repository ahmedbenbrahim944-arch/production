// src/semaine/semaine.controller.ts - Version complète avec planification
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  UseGuards, 
  UsePipes, 
  ValidationPipe,
  Patch,
  ParseIntPipe,
  Delete,
  Req,
  Query
} from '@nestjs/common';
import { SemaineService } from './semaine.service';
import { CreateSemaineDto } from './dto/create-semaine.dto';
import { UpdateProductionDto } from './dto/update-production.dto';
import { UpdateProductionSimpleDto } from './dto/update-production-simple.dto';
import { CreatePlanificationDto } from './dto/create-planification.dto';
import { UpdatePlanificationDto } from './dto/update-planification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminRoleGuard } from '../auth/guards/admin-role.guard';

@Controller()
export class SemaineController {
  constructor(private readonly semaineService: SemaineService) {}

  // ==================== ROUTES PLANIFICATION ====================

  @Post('planifications')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createPlanification(@Body() createPlanificationDto: CreatePlanificationDto) {
    return this.semaineService.createPlanification(createPlanificationDto);
  }

  @Patch('planifications/:id')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updatePlanification(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePlanificationDto: UpdatePlanificationDto
  ) {
    return this.semaineService.updatePlanification(id, updatePlanificationDto);
  }

  @Get('planifications')
  @UseGuards(JwtAuthGuard)
  async getAllPlanifications() {
    return this.semaineService.getAllPlanifications();
  }

  @Get('planifications/semaine/:semaine')
  @UseGuards(JwtAuthGuard)
  async getPlanificationsBySemaine(@Param('semaine') semaine: string) {
    return this.semaineService.getPlanificationsBySemaine(semaine);
  }

  @Get('planifications/semaine/:semaine/ligne/:ligne')
  @UseGuards(JwtAuthGuard)
  async getPlanificationsBySemaineAndLigne(
    @Param('semaine') semaine: string,
    @Param('ligne') ligne: string
  ) {
    return this.semaineService.getPlanificationsBySemaineAndLigne(semaine, ligne);
  }

  @Get('planifications/semaine/:semaine/ligne/:ligne/jour/:jour')
  @UseGuards(JwtAuthGuard)
  async getPlanificationsBySemaineLigneJour(
    @Param('semaine') semaine: string,
    @Param('ligne') ligne: string,
    @Param('jour') jour: string
  ) {
    return this.semaineService.getPlanificationsBySemaineLigneJour(semaine, ligne, jour);
  }

  @Get('planifications/semaine/:semaine/stats')
  @UseGuards(JwtAuthGuard)
  async getPlanificationStats(@Param('semaine') semaine: string) {
    return this.semaineService.getPlanificationStats(semaine);
  }

  @Delete('planifications/:id')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  async deletePlanification(@Param('id', ParseIntPipe) id: number) {
    return this.semaineService.deletePlanification(id);
  }

  // ==================== ROUTES EXISTANTES SEMAINE ====================

  @Post('semaines')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createSemaine(@Body() createSemaineDto: CreateSemaineDto, @Req() req) {
    return this.semaineService.createSemaine(createSemaineDto, req.user);
  }

  @Get('semaines/all-with-lignes')
  @UseGuards(JwtAuthGuard)
  async getAllSemainesWithLignes() {
    return this.semaineService.getAllSemainesWithLignes();
  }

  @Get('semaines/:id/complete')
  @UseGuards(JwtAuthGuard)
  async getSemaineComplete(@Param('id', ParseIntPipe) id: number) {
    return this.semaineService.getSemaineComplete(id);
  }

  @Get('semaines')
  @UseGuards(JwtAuthGuard)
  async getSemaines() {
    return this.semaineService.getSemaines();
  }

  @Get('semaines/:id')
  @UseGuards(JwtAuthGuard)
  async getSemaineById(@Param('id', ParseIntPipe) id: number) {
    return this.semaineService.getSemaineById(id);
  }

  @Get('semaines/:id/lignes')
  @UseGuards(JwtAuthGuard)
  async getSemaineLignes(@Param('id', ParseIntPipe) id: number) {
    return this.semaineService.getSemaineLignes(id);
  }

  @Get('semaines/lignes/:semaineLigneId/references')
  @UseGuards(JwtAuthGuard)
  async getLigneReferences(@Param('semaineLigneId', ParseIntPipe) semaineLigneId: number) {
    return this.semaineService.getLigneReferences(semaineLigneId);
  }

  @Patch('semaines/references/:referenceId/:jour')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateProductionData(
    @Param('referenceId', ParseIntPipe) referenceId: number,
    @Param('jour') jour: string,
    @Body() updateData: UpdateProductionDto
  ) {
    return this.semaineService.updateProductionData(referenceId, jour, updateData);
  }

  @Post('plan/:jour')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateProductionSimple(
    @Param('jour') jour: string,
    @Body() updateData: UpdateProductionSimpleDto
  ) {
    return this.semaineService.updateProductionSimple(jour, updateData);
  }

  @Get('semaines/:id/stats')
  @UseGuards(JwtAuthGuard)
  async getSemaineStats(@Param('id', ParseIntPipe) id: number) {
    return this.semaineService.getSemaineStats(id);
  }

  @Delete('semaines/:id')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  async deleteSemaine(@Param('id', ParseIntPipe) id: number) {
    return this.semaineService.deleteSemaine(id);
  }
}