import { profile } from "@portfolio/content";
import { photoPath } from "../content/images.ts";
import { InfoLayout, useContentWidth } from "../components/layout.tsx";
import { PageTitle } from "../components/page-title.tsx";
import { Picture } from "../components/picture.tsx";
import { RichText } from "../components/rich-text.tsx";
import { ScrollPage } from "../components/scroll-page.tsx";

export function AboutPage() {
  const width = useContentWidth();
  const stacked = width < 72;
  const photoWidth = stacked ? Math.min(28, width) : Math.min(32, Math.floor(width * 0.3));

  return (
    <InfoLayout>
      <PageTitle title="About Me" />
      <ScrollPage>
        <box flexDirection={stacked ? "column" : "row"} gap={stacked ? 1 : 4}>
          <Picture path={photoPath} alt={profile.photo.alt} width={photoWidth} cellAspect={2} fit="cover" caption={false} />
          <box flexDirection="column" gap={1} flexShrink={1} maxWidth={80}>
            {profile.bio.map((paragraph, index) => (
              <RichText key={index} value={paragraph} />
            ))}
          </box>
        </box>
      </ScrollPage>
    </InfoLayout>
  );
}
