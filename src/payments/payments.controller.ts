import { Controller, Get, Post, Req, Res, Body } from '@nestjs/common';
import type { Request, Response } from 'express';
import { PaymentsService } from './payments.service';
import { PaymentSessionDto } from './dto/payment-seession.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @Post('create-payment-session')
  createPaymaentSesion(@Body() paymentSessionDto: PaymentSessionDto) {

    return this.paymentsService.createPaymentSession(paymentSessionDto);
  }

  @Get('success')
  success() {
    return { ok: true, message: 'success' };
  }

  @Get('cancel')
  cancel() {
    return { ok: false, message: 'cancel' };
  }

  @Post('webhook')
  async stripeWebhook(
    @Req() req: Request,
    @Res() res: Response
  ) {
    return this.paymentsService.stripeWebhook(req, res);
  }

}
