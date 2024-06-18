import * as functions from "firebase-functions";
import * as corsModule  from 'cors';
import Stripe from 'stripe';



const cors = corsModule(({origin: true}));

/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */


// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
export const stripePaymentSheet = functions.https.onRequest((request, response) => {
    cors(request, response, async() => {
        const data = request.body;

        console.log('data: ', data);

        const _stripe = new Stripe(
            '',
            {apiVersion: '2024-04-10'}
        );
        
        try {
            const params: Stripe.CustomerCreateParams = {
                email: data.email,
                name: data.name,
                // source: '',
                // address: {
                //     line1: 'ABC',
                //     postal_code: '',
                //     city: '',
                //     state: '',
                //     country: ''
                // }
                // description: 'test customer',
            };
            const customer: Stripe.Customer = await _stripe.customers.create(params);
            console.log(customer.id);
            const ephemeralKey = await _stripe.ephemeralKeys.create(
                {customer: customer.id},
                {apiVersion: '2020-08-27'}
            );
            const paymentIntent = await _stripe.paymentIntents.create({
                amount: data.amount,
                currency: data.currency,
                customer: customer.id,
                automatic_payment_methods: {
                    enabled: true,
                },
            });
            const result = {
                paymentIntent: paymentIntent.client_secret,
                ephemeralKey: ephemeralKey.secret,
                customer: customer.id,
            };
            response.send(result);
        } catch(e) {
            response.status(500).json(e);
        }
    });
});


