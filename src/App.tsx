import { MotionConfig } from "motion/react";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { Shell } from "./components/Shell";
import { Welcome } from "./components/Welcome";
import type { Lang } from "./config/site";
import { siteConfig } from "./config/site";
import { I18nProvider } from "./lib/i18n";
import { preferredLang } from "./lib/lang";
import { StoreProvider } from "./lib/store";
import { About, Faq } from "./pages/About";
import ClassDetail from "./pages/ClassDetail";
import Contact from "./pages/Contact";
import Gift from "./pages/Gift";
import Home from "./pages/Home";
import My from "./pages/My";
import { Checkout, Pricing } from "./pages/Pricing";
import Profile from "./pages/Profile";
import Quiz from "./pages/Quiz";
import Schedule from "./pages/Schedule";
import { ServiceDetail, Services } from "./pages/Services";

function LangRoot() {
  const { lang } = useParams();
  if (!siteConfig.locale.supported.includes(lang as Lang)) return <Navigate to={`/${preferredLang()}/`} replace />;
  return (
    <I18nProvider lang={lang as Lang}>
      <Welcome />
      <Shell />
    </I18nProvider>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <StoreProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to={`/${preferredLang()}/`} replace />} />
            <Route path="/:lang" element={<LangRoot />}>
              <Route index element={<Home />} />
              <Route path="schedule" element={<Schedule />} />
              <Route path="class/:id" element={<ClassDetail />} />
              <Route path="services" element={<Services />} />
              <Route path="services/:slug" element={<ServiceDetail />} />
              <Route path="pricing" element={<Pricing />} />
              <Route path="checkout/:planId" element={<Checkout />} />
              <Route path="my" element={<My />} />
              <Route path="profile" element={<Profile />} />
              <Route path="about" element={<About />} />
              <Route path="faq" element={<Faq />} />
              <Route path="contact" element={<Contact />} />
              <Route path="quiz" element={<Quiz />} />
              <Route path="gift" element={<Gift />} />
              <Route path="*" element={<Navigate to="." replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </StoreProvider>
    </MotionConfig>
  );
}
