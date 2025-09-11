import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { envs } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-seession.dto';
import { todo } from 'node:test';

@Injectable()
export class PaymentsService {

    private readonly stripe = new Stripe(envs.stripeSecret);

    async createPaymentSession(paymentSessionDto: PaymentSessionDto) {

        const { currency, items, orderId } = paymentSessionDto;

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
                    orderId: orderId,
                },
            },
            line_items: lineItems,
            mode: 'payment',
            success_url: envs.stripeSuccessUrl,
            cancel_url: envs.stripeCancelUrl,
        });
        return session;
    }

    async stripeWebhook(req: Request & { rawBody?: string }, res: Response) {
        const signature = req.headers['stripe-signature'] as string;

        const endpointSecret = envs.stripeEndpointSecret;  // production

        if (!signature) {
            return res.status(400).json({ error: 'Missing stripe-signature header' });
        }

        if (!req.rawBody) {
            return res.status(400).json({ error: 'Raw body is required for webhook verification' });
        }

        try {
            const event = this.stripe.webhooks.constructEvent(
                req.rawBody,
                signature,
                endpointSecret
            );

            // Process the event here based on its type
            switch (event.type) {
                case 'charge.succeeded':
                    // TODO: Handle successful payment
                    const chargeSucceded = event.data.object;
                    console.log({ metadata: chargeSucceded.metadata, orderId: chargeSucceded.metadata.orderId });

                    break;

                default:
                    console.log(`Eevent ${event.type} not handled`);
            }

            return res.status(200).json({ signature });
        } catch (error) {
            console.error('Webhook error:', error);
            return res.status(400).json({
                error: 'Webhook handler failed',
                details: error.message
            });
        }
    }
}
