import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PaypalService {
  private baseUrl() {
    return process.env.PAYPAL_ENV === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
  }

  private async getAccessToken() {
    const clientId = process.env.PAYPAL_CLIENT_ID!;
    const secret = process.env.PAYPAL_SECRET!;
    const auth = Buffer.from(`${clientId}:${secret}`).toString('base64');

    const res = await axios.post(
      `${this.baseUrl()}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    return res.data.access_token as string;
  }

  async createOrder(amountIls: number, paymentId: string) {
  const token = await this.getAccessToken();

  const frontend = process.env.FRONTEND_URL || 'http://localhost:19006';

  const res = await axios.post(
    `${this.baseUrl()}/v2/checkout/orders`,
    {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'ILS',
            value: amountIls.toFixed(2),
          },
        },
      ],
      application_context: {
        return_url: `${frontend}/payment/success?paymentId=${paymentId}`,
        cancel_url: `${frontend}/payment/cancel?paymentId=${paymentId}`,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );

  return res.data;
}


  async captureOrder(orderId: string) {
    const accessToken = await this.getAccessToken();

    const res = await axios.post(
      `${this.baseUrl()}/v2/checkout/orders/${orderId}/capture`,
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    return res.data;
  }
}
