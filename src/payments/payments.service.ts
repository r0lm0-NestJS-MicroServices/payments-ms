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

    async stripeWebhook(req: Request & { rawBody?: string }, res: Response) {
        const signature = req.headers['stripe-signature'] as string;
        const endpointSecret = 'whsec_d4210ae39a9d374150281c83f11dbe71ef12adf529912e999cb835a31d66096b';

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
                case 'payment_intent.succeeded':
                    // Handle successful payment
                    console.log('PaymentIntent was successful!', event.data.object);
                    break;
                case 'payment_intent.payment_failed':
                    // Handle failed payment
                    console.log('Payment failed', event.data.object);
                    break;
                // Add more event types as needed
                default:
                    console.log(`Unhandled event type: ${event.type}`);
            }

            return res.status(200).json({ received: true });
        } catch (error) {
            console.error('Webhook error:', error);
            return res.status(400).json({ 
                error: 'Webhook handler failed', 
                details: error.message 
            });
        }
    }
}
