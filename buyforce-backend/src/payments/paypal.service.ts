import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PaypalService {
  private baseUrl() {
    return process.env.PAYPAL_ENV === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
  }

  /**
   * קבלת Access Token מ-PayPal
   */
  private async getAccessToken(): Promise<string> {
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

  /**
   * 🔥 יצירת Order ב-PayPal
   * 🔥 החזרה ל-Frontend עם URL מלא וחוקי בלבד
   */
  async createOrder(amountIls: number, paymentId: string) {
    const token = await this.getAccessToken();

    // ✅ הגנה מוחלטת: FRONTEND_URL חייב להיות URL מלא
    const frontend =
      process.env.FRONTEND_URL && process.env.FRONTEND_URL.startsWith('http')
        ? process.env.FRONTEND_URL
        : 'http://localhost:8081';

    const res = await axios.post(
      `${this.baseUrl()}/v2/checkout/orders`,
      {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'ILS',
              value: amountIls.toFixed(2), // לדוגמה: "1.00"
            },
          },
        ],
        application_context: {
          // ❗ חייב להיות URL מלא (כולל http://localhost:8081)
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

  /**
   * Capture של Order אחרי אישור מה-Frontend
   */
  async captureOrder(orderId: string) {
    const accessToken = await this.getAccessToken();

    const res = await axios.post(
      `${this.baseUrl()}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return res.data;
  }
}
