import { prisma } from '@documenso/prisma';
import crypto from 'crypto';

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

  const token = crypto.randomBytes(18).toString('hex');

  console.log('[FORGOT_PASSWORD] Creating password reset token for user:', user.id);

  // Invalidate any prior reset tokens for this user before issuing a new one, so
  // only a single token is ever live at a time. We still always issue a fresh
  // token (and email) so the user can request a new link if a prior email never
  // arrived, while bounding the number of usable tokens to one.
  await prisma.$transaction(async (tx) => {
    await tx.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
      },
    });

    await tx.passwordResetToken.create({
      data: {
        token,
        expiry: new Date(Date.now() + ONE_DAY),
        userId: user.id,
      },
    });
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
