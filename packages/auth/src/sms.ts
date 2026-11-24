export interface SmsProvider {
  send(phone: string, message: string): Promise<void>;
}

export const smsProvider: SmsProvider = {
  async send(phone, message) {
    const apiId = process.env.SMS_RU_API_ID;
    if (!apiId) throw new Error("SMS_RU_API_ID не настроен");
    const recipient = phone.replace(/^\+/, "");
    const response = await fetch("https://sms.ru/sms/send", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        api_id: apiId,
        to: recipient,
        msg: message,
        json: "1",
      }),
    });
    const result = (await response.json()) as {
      status?: string;
      status_code?: number;
      sms?: Record<string, { status?: string; status_code?: number }>;
    };
    if (
      !response.ok ||
      result.status !== "OK" ||
      result.sms?.[recipient]?.status !== "OK"
    )
      throw new Error(
        `SMS.ru: ${result.sms?.[recipient]?.status_code ?? result.status_code ?? response.status}`,
      );
  },
};
