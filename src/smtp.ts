const DEFAULT_FROM_NAME = '论坛管理员';

async function sendViaResend(env: any, to: string, subject: string, htmlContent: string) {
    if (!env.RESEND_KEY) {
        throw new Error('环境变量缺少 RESEND_KEY');
    }

    console.log('[Resend] Sending email via API...');
    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${env.RESEND_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: `${DEFAULT_FROM_NAME} <${env.RESEND_FROM || 'onboarding@resend.dev'}>`,
            to: [to],
            subject: subject,
            html: htmlContent,
        })
    });

    if (!res.ok) {
        const err = await res.text();
        console.error('[Resend] API Error:', err);
        throw new Error(`Resend API 错误：${err}`);
    }
    console.log('[Resend] Email sent successfully');
}

export async function sendEmail(to: string, subject: string, htmlContent: string, env?: any) {
    await sendViaResend(env, to, subject, htmlContent);
}
