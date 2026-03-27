import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Section,
  Text,
} from "@react-email/components";
import { render } from "@react-email/render";
import fs from "fs";
import path from "path";

let logoDataUri: string | null = null;

function getLogoDataUri(): string {
  if (logoDataUri) return logoDataUri;
  try {
    const logoPath = path.join(process.cwd(), "public", "SECLOGO.png");
    const logoBuffer = fs.readFileSync(logoPath);
    logoDataUri = `data:image/png;base64,${logoBuffer.toString("base64")}`;
  } catch {
    logoDataUri = "";
  }
  return logoDataUri;
}

interface SecEmailProps {
  bodyContent: string;
}

function SecEmail({ bodyContent }: SecEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Img
              src={getLogoDataUri()}
              width="80"
              height="80"
              alt="SEC @ UF"
              style={{ margin: "0 auto", display: "block" }}
            />
          </Section>

          {/* Azure divider */}
          <Hr style={dividerStyle} />

          {/* Content */}
          <Section style={contentStyle}>
            <div dangerouslySetInnerHTML={{ __html: bodyContent }} />
          </Section>

          {/* Footer */}
          <Hr style={{ ...dividerStyle, marginTop: "32px" }} />
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              Software Engineering Club at UF
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle: React.CSSProperties = {
  backgroundColor: "#0f0f1a",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  margin: 0,
  padding: "40px 0",
};

const containerStyle: React.CSSProperties = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#1a1a2e",
  borderRadius: "12px",
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.06)",
};

const headerStyle: React.CSSProperties = {
  padding: "32px 24px 16px",
  textAlign: "center" as const,
};

const dividerStyle: React.CSSProperties = {
  border: "none",
  borderTop: "2px solid #2196F3",
  margin: "0 24px",
};

const contentStyle: React.CSSProperties = {
  padding: "24px",
  color: "#e0e0e0",
  fontSize: "15px",
  lineHeight: "1.6",
};

const footerStyle: React.CSSProperties = {
  padding: "16px 24px 24px",
  textAlign: "center" as const,
};

const footerTextStyle: React.CSSProperties = {
  color: "rgba(255,255,255,0.35)",
  fontSize: "12px",
  margin: 0,
};

export async function renderEmailHtml(bodyContent: string): Promise<string> {
  return render(<SecEmail bodyContent={bodyContent} />);
}
