import { createElement } from 'react';

import { msg } from '@lingui/core/macro';

import { mailer } from '@documenso/email/mailer';
import { ForgotPasswordTemplate } from '@documenso/email/templates/forgot-password';
import { prisma } from '@documenso/prisma';

import { getI18nInstance } from '../../client-only/providers/i18n-server';
import { NEXT_PUBLIC_WEBAPP_URL } from '../../constants/app';
import { env } from '../../utils/env';
import { renderEmailWithI18N } from '../../utils/render-email-with-i18n';

export interface SendForgotPasswordOptions {
  userId: number;
}

export const sendForgotPassword = async ({ userId }: SendForgotPasswordOptions) => {
  console.log('[SEND_FORGOT_PASSWORD] Fetching user data for userId:', userId);

  const user = await prisma.user.findFirstOrThrow({
    where: {
      id: userId,
    },
    include: {
      passwordResetTokens: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
    },
  });

  if (!user) {
    console.error('[SEND_FORGOT_PASSWORD] User not found for userId:', userId);
    throw new Error('User not found');
  }

  console.log('[SEND_FORGOT_PASSWORD] User found:', user.email);

  const token = user.passwordResetTokens[0].token;
  const assetBaseUrl = NEXT_PUBLIC_WEBAPP_URL() || 'http://localhost:3000';
  const resetPasswordLink = `${NEXT_PUBLIC_WEBAPP_URL()}/reset-password/${token}`;

  console.log('[SEND_FORGOT_PASSWORD] Reset link:', resetPasswordLink);

  const template = createElement(ForgotPasswordTemplate, {
    assetBaseUrl,
    resetPasswordLink,
  });

  console.log('[SEND_FORGOT_PASSWORD] Rendering email template...');

  const [html, text] = await Promise.all([
    renderEmailWithI18N(template),
    renderEmailWithI18N(template, { plainText: true }),
  ]);

  const i18n = await getI18nInstance();

  const fromAddress = env('NEXT_PRIVATE_SMTP_FROM_ADDRESS') || 'noreply@documenso.com';
  const fromName = env('NEXT_PRIVATE_SMTP_FROM_NAME') || 'Documenso';

  console.log('[SEND_FORGOT_PASSWORD] Sending email...');
  console.log('[SEND_FORGOT_PASSWORD]   To:', user.email);
  console.log('[SEND_FORGOT_PASSWORD]   From:', fromName, '<' + fromAddress + '>');
  console.log('[SEND_FORGOT_PASSWORD]   Subject:', i18n._(msg`Forgot Password?`));

  const result = await mailer.sendMail({
    to: {
      address: user.email,
      name: user.name || '',
    },
    from: {
      name: fromName,
      address: fromAddress,
    },
    subject: i18n._(msg`Forgot Password?`),
    html,
    text,
  });

  console.log('[SEND_FORGOT_PASSWORD] ✅ Email sent successfully!');
  console.log('[SEND_FORGOT_PASSWORD]   Message ID:', result.messageId);
  console.log('[SEND_FORGOT_PASSWORD]   Response:', result.response);

  return result;
};
