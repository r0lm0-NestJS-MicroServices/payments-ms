import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { envs } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-seession.dto';

@Injectable()
export class PaymentsService {

    private readonly stripe = new Stripe(envs.stripeSecret);

    async createPaymentSession(paymentSessionDto: PaymentSessionDto) {

        const { currency, items } = paymentSessionDto;

        const lineItems = items.map(item => ({
            price_data: {
                currency,
                product_data: {
                    name: item.name,
                },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
        }));
        const session = await this.stripe.checkout.sessions.create({
            // colocar aca el id de la Ordeen
            payment_intent_data: {
                metadata: {
                },
            },
            line_items: lineItems,
            mode: 'payment',
            success_url: 'http://localhost:3003/payments/success',
            cancel_url: 'http://localhost:3003/payments/cancel',
        });
        return session;
    }

    async stripeWebhook(req: Request, res: Response) {
        const signature = req.headers['stripe-signature'];
        console.log({ signature });
        return res.status(200).json({ signature });
    }
}
