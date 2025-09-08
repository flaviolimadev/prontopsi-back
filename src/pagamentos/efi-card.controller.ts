import { Body, Controller, Get, Post } from '@nestjs/common';
import { EfiCardService } from './efi-card.service';

@Controller('card')
export class EfiCardController {
  constructor(private readonly efiCardService: EfiCardService) {}

  @Get('installments')
  async installments(@Body() body: { brand: string; totalInCents: number }) {
    return this.efiCardService.getInstallments(body.brand, body.totalInCents);
  }

  @Post('charge')
  async charge(@Body() body: {
    amountInCents: number;
    description: string;
    paymentToken: string;
    installments?: number;
    customer: { name: string; email: string; cpf: string; birth?: string; phone_number?: string };
    billing: { street: string; number: number; neighborhood: string; zipcode: string; city: string; state: string };
  }) {
    return this.efiCardService.createOneStepCardCharge(body);
  }
}






