import { APP_CONFIG } from "@acme/config";
import { Body, Heading, Html, Link, Text } from "@react-email/components";

export default function VerifyEmail({
  verificationLink,
}: {
  verificationLink: string;
}) {
  return (
    <Html lang="ru">
      <Body>
        <Heading>Подтверждение почты в {APP_CONFIG.shortName}</Heading>
        <Text>
          Откройте ссылку, чтобы подтвердить адрес электронной почты для входа.
        </Text>
        <Link href={verificationLink}>Подтвердить адрес</Link>
        <Text>
          Если вы не запрашивали подтверждение, проигнорируйте письмо.
        </Text>
      </Body>
    </Html>
  );
}
