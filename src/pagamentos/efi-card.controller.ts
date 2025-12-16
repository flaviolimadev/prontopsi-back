import { 
  Body, 
  Controller, 
  Get, 
  Post, 
  Put,
  Param,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
  Request
} from '@nestjs/common';
import { EfiCardService } from './efi-card.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetInstallmentsDto, CreateCardChargeDto, RefundCardDto } from '../dto/card.dto';

enum UserRole {
  ADMIN = 'ADMIN',
  PSYCHOLOGIST = 'PSYCHOLOGIST'
}

@Controller('card')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EfiCardController {
  constructor(private readonly efiCardService: EfiCardService) {}

  /**
   * Consulta parcelas disponíveis para uma bandeira e valor
   * GET /api/card/installments?brand=visa&totalInCents=10000
   */
  @Get('installments')
  @Roles(UserRole.ADMIN, UserRole.PSYCHOLOGIST)
  async getInstallments(@Query() query: GetInstallmentsDto) {
    try {
      if (!query.brand || !query.totalInCents) {
        throw new HttpException(
          'Parâmetros brand e totalInCents são obrigatórios',
          HttpStatus.BAD_REQUEST
        );
      }
      return await this.efiCardService.getInstallments(query.brand, query.totalInCents);
    } catch (error) {
      throw new HttpException(
        `Erro ao consultar parcelas: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Cria uma cobrança com cartão de crédito
   * POST /api/card/charge
   */
  @Post('charge')
  @Roles(UserRole.ADMIN, UserRole.PSYCHOLOGIST)
  async createCharge(
    @Body() createCardChargeDto: CreateCardChargeDto,
    @Request() req: any
  ) {
    try {
      const result = await this.efiCardService.createOneStepCardCharge(createCardChargeDto);
      return {
        success: true,
        data: result,
        message: 'Cobrança com cartão criada com sucesso'
      };
    } catch (error) {
      throw new HttpException(
        `Erro ao criar cobrança com cartão: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Consulta uma cobrança específica
   * GET /api/card/charge/:chargeId
   */
  @Get('charge/:chargeId')
  @Roles(UserRole.ADMIN, UserRole.PSYCHOLOGIST)
  async getCharge(@Param('chargeId') chargeId: string) {
    try {
      // Nota: Este método precisa ser implementado no serviço
      throw new HttpException(
        'Funcionalidade ainda não implementada',
        HttpStatus.NOT_IMPLEMENTED
      );
    } catch (error) {
      throw new HttpException(
        `Erro ao consultar cobrança: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Reembolsa uma cobrança (total ou parcial)
   * PUT /api/card/refund/:chargeId
   */
  @Put('refund/:chargeId')
  @Roles(UserRole.ADMIN, UserRole.PSYCHOLOGIST)
  async refundCharge(
    @Param('chargeId') chargeId: string,
    @Body() refundCardDto: RefundCardDto
  ) {
    try {
      const chargeIdNumber = parseInt(chargeId, 10);
      if (isNaN(chargeIdNumber)) {
        throw new HttpException(
          'ID da cobrança inválido',
          HttpStatus.BAD_REQUEST
        );
      }
      const result = await this.efiCardService.refundCard(
        chargeIdNumber,
        refundCardDto.valueInCents
      );
      return {
        success: true,
        data: result,
        message: 'Reembolso processado com sucesso'
      };
    } catch (error) {
      throw new HttpException(
        `Erro ao processar reembolso: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}






