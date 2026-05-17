// ============================================================
// MAIN APP — assembles the new homepage with tweaks
// ============================================================

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "heroVariant": "split",
  "headerStyle": "smart",
  "showPathsSection": true,
  "showHowItWorks": true,
  "showTrustBand": true,
  "showFAQ": true
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  return (
    <div className="bg-paper text-ink min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-mint focus:text-teal focus:rounded-lg focus:font-bold">
        Saltar al contenido
      </a>

      <SiteHeaderNew tweaks={tweaks} />

      <main id="main">
        <Hero tweaks={tweaks} />
        <LiveDataStrip />
        <IsapresSection />
        {tweaks.showPathsSection && <PathsSection />}
        {tweaks.showHowItWorks && <HowItWorksSection />}
        {tweaks.showTrustBand && <TrustBand />}
        {tweaks.showFAQ && <FAQSection />}
        <FinalCTA />
      </main>

      <SiteFooter />
      <WhatsAppFAB />

      <TweaksPanel>
        <TweakSection label="Hero" />
        <TweakRadio
          label="Variante"
          value={tweaks.heroVariant}
          options={[
            { value: 'split',     label: 'Split' },
            { value: 'centered',  label: 'Centro' },
            { value: 'editorial', label: 'Foto' },
          ]}
          onChange={(v) => setTweak('heroVariant', v)}
        />

        <TweakSection label="Header" />
        <TweakRadio
          label="Estilo"
          value={tweaks.headerStyle}
          options={[
            { value: 'smart', label: 'Smart' },
            { value: 'solid', label: 'Solid' },
            { value: 'glass', label: 'Glass' },
          ]}
          onChange={(v) => setTweak('headerStyle', v)}
        />

        <TweakSection label="Secciones" />
        <TweakToggle
          label="3 caminos"
          value={tweaks.showPathsSection}
          onChange={(v) => setTweak('showPathsSection', v)}
        />
        <TweakToggle
          label="Cómo funciona"
          value={tweaks.showHowItWorks}
          onChange={(v) => setTweak('showHowItWorks', v)}
        />
        <TweakToggle
          label="Banda confianza"
          value={tweaks.showTrustBand}
          onChange={(v) => setTweak('showTrustBand', v)}
        />
        <TweakToggle
          label="FAQ integrado"
          value={tweaks.showFAQ}
          onChange={(v) => setTweak('showFAQ', v)}
        />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
