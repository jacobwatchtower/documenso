import crypto from 'crypto';

import { prisma } from '@documenso/prisma';

import { ONE_DAY } from '../../constants/time';
import { sendForgotPassword } from '../auth/send-forgot-password';

export const forgotPassword = async ({ email }: { email: string }) => {
  console.log('[FORGOT_PASSWORD] Starting password reset flow for email:', email);

  const user = await prisma.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: 'insensitive',
      },
    },
  });

  if (!user) {
    console.log('[FORGOT_PASSWORD] User not found for email:', email);
    return;
  }

  console.log('[FORGOT_PASSWORD] User found, ID:', user.id, 'Email:', user.email);

  // Find a token that was created in the last hour and hasn't expired
  // const existingToken = await prisma.passwordResetToken.findFirst({
  //   where: {
  //     userId: user.id,
  //     expiry: {
  //       gt: new Date(),
  //     },
  //     createdAt: {
  //       gt: new Date(Date.now() - ONE_HOUR),
  //     },
  //   },
  // });

  // if (existingToken) {
  //   return;
  // }

  const token = crypto.randomBytes(18).toString('hex');

  console.log('[FORGOT_PASSWORD] Creating password reset token for user:', user.id);

  await prisma.passwordResetToken.create({
    data: {
      token,
      expiry: new Date(Date.now() + ONE_DAY),
      userId: user.id,
    },
  });

  console.log('[FORGOT_PASSWORD] Token created, attempting to send email...');

  await sendForgotPassword({
    userId: user.id,
  })
    .then(() => {
      console.log('[FORGOT_PASSWORD] ✅ Password reset email sent successfully to:', user.email);
    })
    .catch((err) => {
      console.error('[FORGOT_PASSWORD] ❌ Failed to send password reset email:', err);
      console.error('[FORGOT_PASSWORD] Error details:', err.message);
    });
};
