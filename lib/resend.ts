import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_mock_key");

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; id?: string }> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn(`Resend API Key missing. Mocking email to ${to} with subject "${subject}"`);
      return { success: true, id: `mock-email-id-${Date.now()}` };
    }

    const { data, error } = await resend.emails.send({
      from: "Kode To Career <certificates@kodetocareer.com>",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Resend API returned error:", error);
      return { success: false };
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error("Resend Send Email Error:", error);
    return { success: false };
  }
}
