import { Controller, Get, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentSessionDto } from './dto/payment-seession.dto';
import { Body } from '@nestjs/common';

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
  async stripeWebhook() {
    return 'stripeWebhook';
  }

}
