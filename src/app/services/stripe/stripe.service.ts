import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GooglePayEventsEnum, PaymentFlowEventsEnum, PaymentSheetEventsEnum, Stripe } from '@capacitor-community/stripe';
import { first, lastValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StripeService {

  constructor(private http :HttpClient) { 
    Stripe.initialize({
      publishableKey: environment.stripe.publishableKey,
    });
  }

  
  async paymentSheet(data) {
    /*
    With PaymentSheet, you can make payments in a single flow. 
    As soon as the User presses the payment button, 
    the payment is completed. (If you want user have some flow after that, 
    please use paymentFlow method)
    */

    try {
      // be able to get event of PaymentSheet
      Stripe.addListener(PaymentSheetEventsEnum.Completed, () => {
        console.log('PaymentSheetEventsEnum.Completed');
      });

    // Connect to your backend endpoint, and get every key.
    const data$  = this.http.post<{
      paymentIntent : string;
      ephemeralKey : string,
      customer : string;
    }>(environment.stripe.api +'stripePaymentSheet',data).pipe(first());
     const { paymentIntent, ephemeralKey, customer } = await lastValueFrom(data$);
      // const { paymentIntent, ephemeralKey, customer } = await (data$).toPromise();

     console.log('paymentIntent: ', paymentIntent);

        // prepare PaymentSheet with CreatePaymentSheetOption.
        await Stripe.createPaymentSheet({
          paymentIntentClientSecret: paymentIntent,
          customerId: customer,
          customerEphemeralKeySecret: ephemeralKey,
          merchantDisplayName: 'RiTi Eats'
        });

    

      // present PaymentSheet and get result.
      const result = await Stripe.presentPaymentSheet();
      console.log('result: ', result);
      if (result && result.paymentResult === PaymentSheetEventsEnum.Completed) {
        
      }
    } catch(e) {
      console.log(e);
      throw(e);
    }
  }


  async paymentFlow(data) {
    /*
    With PaymentSheet, you can make payments in a single flow. 
    As soon as the User presses the payment button, 
    the payment is completed. (If you want user have some flow after that, 
    please use paymentFlow method)
    */

    try {
      // be able to get event of PaymentSheet
      Stripe.addListener(PaymentFlowEventsEnum.Completed, () => {
        console.log('PaymentFlowEventsEnum.Completed');
      });

    // Connect to your backend endpoint, and get every key.
    const data$  = this.http.post<{
      paymentIntent : string;
      ephemeralKey : string,
      customer : string;
    }>(environment.stripe.api +'stripePaymentSheet',data).pipe(first());
     const { paymentIntent, ephemeralKey, customer } = await lastValueFrom(data$);
      // const { paymentIntent, ephemeralKey, customer } = await (data$).toPromise();

     console.log('paymentIntent: ', paymentIntent);

        // prepare PaymentSheet with CreatePaymentSheetOption.
        await Stripe.createPaymentSheet({
          paymentIntentClientSecret: paymentIntent,
          customerId: customer,
          customerEphemeralKeySecret: ephemeralKey,
          merchantDisplayName: 'RiTi Eats'
        });

              // Present PaymentFlow. **Not completed yet.**
        const presentResult = await Stripe.presentPaymentFlow();
        console.log('presentResult: ', presentResult); // { cardNumber: "●●●● ●●●● ●●●● ****" }
     // Confirm PaymentFlow. Completed.
     const confirmResult = await Stripe.confirmPaymentFlow();
     console.log('confirmResult: ', confirmResult);
     if (confirmResult.paymentResult === PaymentFlowEventsEnum.Completed) {
       // Happy path
       return paymentIntent;
     }
     return null;
    } catch(e) {
      console.log(e);
      throw(e);
    }
  }

  async googlePay(data){
    try {
    const isAvailable = Stripe.isGooglePayAvailable().catch(()=> undefined);
    if(isAvailable === undefined){
      return
    }

    Stripe.addListener(GooglePayEventsEnum.Completed, () => {
      console.log('PaymentFlowEventsEnum.Completed');
    });

      // Connect to your backend endpoint, and get every key.
      const data$  = this.http.post<{
        paymentIntent : string
      }>(environment.stripe.api +'stripePaymentSheet',data).pipe(first());
       const { paymentIntent } = await lastValueFrom(data$);
        // const { paymentIntent, ephemeralKey, customer } = await (data$).toPromise();
  
       console.log('paymentIntent: ', paymentIntent);

       //Prepare The google Pay
       await Stripe.createGooglePay({
        paymentIntentClientSecret :paymentIntent,

         // Web only. Google Pay on Android App doesn't need
      paymentSummaryItems: [{
        label: 'Maza Eats',
        amount: data?.amount * 100
      }],
      merchantIdentifier: 'merchant.com.getcapacitor.stripe',
      countryCode: 'IN',
      currency: data.currency,
       })

              // Present PaymentFlow. **Not completed yet.**
              const result = await Stripe.presentGooglePay();
              if(result.paymentResult === GooglePayEventsEnum.Completed){

              }

    }
    catch(e){
      throw e;
    }

  }


  

}
