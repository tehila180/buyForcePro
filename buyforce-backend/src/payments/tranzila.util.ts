import * as crypto from 'crypto';

export function verifyTranzilaSignature(body: any) {
  const secret = process.env.TRANZILA_SECRET!;
  if (!secret) return false;

  const raw =
    body.supplier +
    body.sum +
    body.currency +
    body.order_id +
    secret;

  const expected = crypto
    .createHash('sha256')
    .update(raw)
    .digest('hex');

  return expected === body.signature;
}
