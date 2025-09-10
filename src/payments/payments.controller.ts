import { Controller, Get, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';


@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @Post('create-payment-session')
  createPaymaentSesion() {
    return this.paymentsService.createPaymentSession();
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
  async stripeWebhook() {
    return 'stripeWebhook';
  }

}
