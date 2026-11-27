import Image from "next/image";
import { useTranslations } from "next-intl";

const groups = [
  { key: "product", items: ["studioSuite", "voiceCloning", "aiMastering", "changelog"] },
  { key: "resources", items: ["documentation", "apiReference", "podcastGuide", "community"] },
  { key: "legal", items: ["privacyPolicy", "termsOfService", "voiceRights", "security"] },
  { key: "social", items: ["discord", "youtube", "github", "substack"] },
] as const;

export function AppFooter() {
  const t = useTranslations("AppFooter");

  return (
    <footer className="border-t border-violet-400/20 bg-[#0b0b0e] px-5 py-8 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-7 py-2 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {groups.map(({ key, items }) => (
            <section key={key} aria-labelledby={`footer-${key}`}>
              <h2
                id={`footer-${key}`}
                className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground"
              >
                {t(key)}
              </h2>
              <ul className="mt-3 space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <span className="text-[11px] text-muted-foreground transition-colors hover:text-foreground">
                      {t(item)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-white/[0.08] py-4 text-[10px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2">
            <Image
              src="/podforge_logo.png"
              alt=""
              width={20}
              height={20}
              className="size-10 rounded-sm object-cover"
            />
            {t("copyright")}
          </p>
          <p>{t("securityNote")}</p>
        </div>
      </div>
    </footer>
  );
}
