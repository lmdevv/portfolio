import { useKeyboard, useRenderer } from "@opentui/react";
import { HelpOverlay } from "./components/help.tsx";
import { AboutPage } from "./pages/about.tsx";
import { ArticlePage } from "./pages/article.tsx";
import { BlogPage } from "./pages/blog.tsx";
import { ContactPage } from "./pages/contact.tsx";
import { ExperiencePage } from "./pages/experience.tsx";
import { HomePage } from "./pages/home.tsx";
import { NotFoundPage } from "./pages/not-found.tsx";
import { ProjectsPage } from "./pages/projects.tsx";
import { navItems, sectionOf, type Route } from "./router.ts";
import { useApp } from "./state.tsx";

function parentOf(route: Route): Route | undefined {
  if (route.page === "article") return { page: "blog" };
  if (route.page === "blog" && route.category) return { page: "blog" };
  if (route.page === "home") return undefined;
  return { page: "home" };
}

function Page(props: { route: Route }) {
  const { route } = props;
  switch (route.page) {
    case "home":
      return <HomePage />;
    case "projects":
      return <ProjectsPage />;
    case "experience":
      return <ExperiencePage />;
    case "about":
      return <AboutPage />;
    case "contact":
      return <ContactPage />;
    case "blog":
      return <BlogPage category={route.category} />;
    case "article":
      return <ArticlePage slug={route.slug} />;
    case "not-found":
      return <NotFoundPage path={route.path} />;
  }
}

export function App() {
  const renderer = useRenderer();
  const app = useApp();
  const { route, navigate, back, canGoBack, helpOpen, setHelpOpen } = app;

  useKeyboard((key) => {
    if ((key.ctrl && key.name === "c") || (key.name === "q" && !key.ctrl)) {
      renderer.destroy();
      return;
    }

    if (helpOpen) {
      if (key.name === "escape" || key.sequence === "?" || key.name === "return") setHelpOpen(false);
      return;
    }

    if (key.sequence === "?") return setHelpOpen(true);
    if (key.name === "i" && !key.ctrl) return app.cycleImageMode();
    if (key.name === "m" && !key.ctrl) return app.toggleMotion();

    const numbered = navItems.find((item) => item.key === key.name);
    if (numbered) return navigate({ page: numbered.page });

    if (key.name === "tab") {
      const current = navItems.findIndex((item) => item.page === sectionOf(route));
      const next = (current + (key.shift ? -1 : 1) + navItems.length) % navItems.length;
      return navigate({ page: navItems[next]!.page });
    }

    if (key.name === "escape" || key.name === "backspace") {
      if (canGoBack) return back();
      const parent = parentOf(route);
      if (parent) navigate(parent);
    }
  });

  return (
    <box width="100%" height="100%">
      <Page key={JSON.stringify(route)} route={route} />
      {helpOpen && <HelpOverlay />}
    </box>
  );
}
