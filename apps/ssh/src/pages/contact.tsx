import { TextAttributes } from "@opentui/core";
import { contact, profile, type ContactLink } from "@portfolio/content";
import { displayUrl, useCopy } from "../components/clipboard.ts";
import { InfoLayout } from "../components/layout.tsx";
import { PageTitle } from "../components/page-title.tsx";
import { ScrollPage } from "../components/scroll-page.tsx";
import { useListSelection } from "../components/selection.ts";
import { theme } from "../theme.ts";

const glyphs: Record<ContactLink["kind"], string> = { email: "@", github: "gh", linkedin: "in", x: "x" };
const links = [contact.email, ...contact.socials];

export function ContactPage() {
  const copy = useCopy();
  const { index, setIndex, onKey, scroll } = useListSelection(links.length, "contact");

  return (
    <InfoLayout>
      <PageTitle title="Let's Connect" />
      <ScrollPage
        ref={scroll}
        lineKeys={false}
        onKey={(key) => {
          if (onKey(key)) return;
          const link = links[index];
          if (link && (key.name === "y" || key.name === "return")) copy(displayUrl(link.href));
        }}
      >
        <text fg={theme.muted} maxWidth={70}>
          {contact.intro}
        </text>

        <box flexDirection="column" marginTop={2}>
          {links.map((link, linkIndex) => {
            const selected = linkIndex === index;
            return (
              <box
                id={`contact-${linkIndex}`}
                key={link.href}
                flexDirection="row"
                marginBottom={link.kind === "email" ? 2 : 1}
                onMouseDown={() => setIndex(linkIndex)}
              >
                <text fg={selected ? theme.bright : theme.subtle} attributes={selected ? TextAttributes.BOLD : 0}>
                  {selected ? "› " : "  "}
                  <span fg={theme.muted}>{glyphs[link.kind].padEnd(2)}</span> <a href={link.href}>{link.label}</a>
                  <span fg={theme.faint}> ↗</span>
                  {selected && <span fg={theme.faint}>{`   ${displayUrl(link.href)} · enter to copy`}</span>}
                </text>
              </box>
            );
          })}
        </box>

        <box flexDirection="column" marginTop={2}>
          <text fg={theme.subtle}>{profile.location.city}</text>
          <text fg={theme.subtle}>{profile.location.country}</text>
        </box>
      </ScrollPage>
    </InfoLayout>
  );
}
