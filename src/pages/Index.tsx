import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const HERO_IMG = "https://cdn.poehali.dev/projects/7cb8a5ae-3c5d-4311-9153-67b286eadf9c/files/ea0d1004-b3e7-434a-b336-226546309558.jpg";
const FOREST_IMG = "https://cdn.poehali.dev/projects/7cb8a5ae-3c5d-4311-9153-67b286eadf9c/files/261b6a01-8c9a-40a0-b00a-0cce4565159c.jpg";
const MANSION_IMG = "https://cdn.poehali.dev/projects/7cb8a5ae-3c5d-4311-9153-67b286eadf9c/files/a6653169-f39f-4ecc-ab3f-17ee4a40f437.jpg";

// Fix default leaflet icon paths
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const MAP_POINTS = [
  {
    id: 1,
    name: "Псковский кром",
    route: "Путь теней",
    desc: "Средневековая крепость с тёмной историей. Ночные экскурсии в старинные подземелья.",
    coords: [57.819, 28.332] as [number, number],
    color: "#C9A84C",
    days: "7 дней",
    price: "от 45 000 ₽",
  },
  {
    id: 2,
    name: "Кижский погост",
    route: "Северная мистерия",
    desc: "Деревянные церкви на острове посреди карельского озера. Место силы и тишины.",
    coords: [62.065, 35.225] as [number, number],
    color: "#6B8FA8",
    days: "10 дней",
    price: "от 78 000 ₽",
  },
  {
    id: 3,
    name: "Мангуп-Кале",
    route: "Крымские тайны",
    desc: "Пещерный город на вершине горного плато. Последний оплот готского княжества.",
    coords: [44.593, 33.801] as [number, number],
    color: "#8F6BAA",
    days: "5 дней",
    price: "от 32 000 ₽",
  },
  {
    id: 4,
    name: "Усадьба Марьино",
    route: "Путь теней",
    desc: "Заброшенная дворянская усадьба XIX века. Призраки прошлого живут здесь до сих пор.",
    coords: [51.72, 36.18] as [number, number],
    color: "#C9A84C",
    days: "7 дней",
    price: "от 45 000 ₽",
  },
  {
    id: 5,
    name: "Соловецкий монастырь",
    route: "Северная мистерия",
    desc: "Суровые острова Белого моря. Монастырь с многовековой историей и тайными лабиринтами.",
    coords: [65.017, 35.727] as [number, number],
    color: "#6B8FA8",
    days: "10 дней",
    price: "от 78 000 ₽",
  },
  {
    id: 6,
    name: "Судакская крепость",
    route: "Крымские тайны",
    desc: "Генуэзская цитадель на скале над морем. Башни, хранящие секреты средиземноморских торговцев.",
    coords: [44.847, 34.969] as [number, number],
    color: "#8F6BAA",
    days: "5 дней",
    price: "от 32 000 ₽",
  },
];

function createCustomIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width: 14px; height: 14px;
      background: ${color};
      border: 2px solid rgba(255,255,255,0.4);
      border-radius: 50%;
      box-shadow: 0 0 12px ${color}, 0 0 24px ${color}55;
      cursor: pointer;
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function FlyToMarker({ coords }: { coords: [number, number] }) {
  const map = useMap();
  map.flyTo(coords, 7, { duration: 1.2 });
  return null;
}

const NAV_ITEMS = [
  { label: "О местах", href: "#places" },
  { label: "Маршруты", href: "#routes" },
  { label: "Карта", href: "#map" },
  { label: "Галерея", href: "#gallery" },
  { label: "Отзывы", href: "#reviews" },
  { label: "Контакты", href: "#contacts" },
];

const PLACES = [
  {
    icon: "Castle",
    title: "Заброшенные замки",
    desc: "Вековые стены хранят тайны давно ушедших эпох. Каждый камень — свидетель событий, о которых молчат учебники истории.",
    tag: "История",
  },
  {
    icon: "Trees",
    title: "Мистические леса",
    desc: "Древние рощи, где туман не рассеивается даже в полдень. Места силы, известные лишь посвящённым.",
    tag: "Природа",
  },
  {
    icon: "Waves",
    title: "Тёмные побережья",
    desc: "Скалистые берега, где море шепчет легенды о затонувших кораблях и морских существах.",
    tag: "Море",
  },
  {
    icon: "Mountain",
    title: "Горные святилища",
    desc: "Высокогорные места, где небо ближе, а граница между мирами становится зыбкой и прозрачной.",
    tag: "Горы",
  },
];

const ROUTES = [
  {
    name: "Путь теней",
    days: "7 дней",
    difficulty: "Средний",
    price: "от 45 000 ₽",
    desc: "Маршрут по заброшенным усадьбам и старинным некрополям центральной России. Ночные экскурсии, медиумные сеансы.",
    color: "#C9A84C",
  },
  {
    name: "Северная мистерия",
    days: "10 дней",
    difficulty: "Сложный",
    price: "от 78 000 ₽",
    desc: "Карелия и русский Север: языческие капища, белые ночи, северное сияние и предания лесных духов.",
    color: "#6B8FA8",
  },
  {
    name: "Крымские тайны",
    days: "5 дней",
    difficulty: "Лёгкий",
    price: "от 32 000 ₽",
    desc: "Пещерные города, генуэзские крепости и подземные храмы. Путешествие через слои времени.",
    color: "#8F6BAA",
  },
];

const GALLERY_ITEMS = [
  { img: HERO_IMG, title: "Ночные руины", location: "Псковская область" },
  { img: FOREST_IMG, title: "Лесные духи", location: "Карелия" },
  { img: MANSION_IMG, title: "Замок на скале", location: "Крым" },
  { img: FOREST_IMG, title: "Туманный путь", location: "Вологодская область" },
  { img: HERO_IMG, title: "Лунный арх", location: "Новгородская область" },
  { img: MANSION_IMG, title: "Буря и тайна", location: "Калининград" },
];

const REVIEWS = [
  {
    name: "Александра М.",
    date: "Октябрь 2024",
    route: "Путь теней",
    text: "Это было нечто запредельное. Ночь в заброшенной усадьбе перевернула моё представление о реальности. Гид знал каждую историю, каждый шёпот этих стен. Вернусь обязательно.",
    stars: 5,
  },
  {
    name: "Дмитрий К.",
    date: "Август 2024",
    route: "Северная мистерия",
    text: "Белые ночи Карелии — это отдельная вселенная. Языческие места, которые нам показали, не найти ни в одном путеводителе. Организация на высшем уровне, атмосфера — вне слов.",
    stars: 5,
  },
  {
    name: "Елена В.",
    date: "Сентябрь 2024",
    route: "Крымские тайны",
    text: "Пещерные города Крыма с таким рассказчиком превращаются в живую историю. Чувствовала себя путешественницей во времени. Фотографии получились невероятные.",
    stars: 5,
  },
];

// ── Hero particles & parallax ──────────────────────────────────────────────

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  drift: number;
}

function useParticles(count: number): Particle[] {
  return useRef<Particle[]>(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.6 + 0.1,
      duration: Math.random() * 10 + 8,
      delay: Math.random() * 8,
      drift: (Math.random() - 0.5) * 40,
    }))
  ).current;
}

function HeroParticles() {
  const particles = useParticles(60);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[2]">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.id % 5 === 0 ? "#C9A84C" : "#ffffff",
            opacity: p.opacity,
            animation: `particleFloat ${p.duration}s ease-in-out ${p.delay}s infinite`,
            "--drift": `${p.drift}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

function useParallax() {
  const [offset, setOffset] = useState(0);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  const onScroll = useCallback(() => {
    setOffset(window.scrollY);
  }, []);

  const onMouse = useCallback((e: MouseEvent) => {
    const cx = (e.clientX / window.innerWidth - 0.5) * 2;
    const cy = (e.clientY / window.innerHeight - 0.5) * 2;
    setMouseX(cx);
    setMouseY(cy);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouse, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouse);
    };
  }, [onScroll, onMouse]);

  return { offset, mouseX, mouseY };
}

function HeroSection() {
  const { offset, mouseX, mouseY } = useParallax();

  const bgY = offset * 0.35;
  const bgX = mouseX * 18;
  const bgYm = mouseY * 10;

  const fogY = offset * 0.15;
  const fog2Y = offset * 0.25;

  return (
    <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Parallax background */}
      <div
        className="absolute inset-[-8%] bg-cover bg-center will-change-transform"
        style={{
          backgroundImage: `url(${HERO_IMG})`,
          transform: `translate(${bgX}px, ${bgYm - bgY}px) scale(1.15)`,
          transition: "transform 0.1s linear",
        }}
      />

      {/* Deep gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0C10]/60 via-[#0A0C10]/30 to-[#0A0C10] z-[1]" />

      {/* Radial vignette */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 40%, transparent 0%, rgba(10,12,16,0.55) 100%)",
        }}
      />

      {/* Fog layers with parallax */}
      <div
        className="fog-overlay absolute inset-0 z-[2]"
        style={{ transform: `translateY(${fogY}px)`, opacity: 0.7 }}
      />
      <div
        className="absolute inset-0 z-[2]"
        style={{
          background: "radial-gradient(ellipse 120% 40% at 50% 100%, rgba(201,168,76,0.04) 0%, transparent 70%)",
          transform: `translateY(${fog2Y}px)`,
        }}
      />

      {/* Animated aurora streaks */}
      <div className="absolute inset-0 z-[2] overflow-hidden pointer-events-none">
        <div className="aurora-streak aurora-1" />
        <div className="aurora-streak aurora-2" />
        <div className="aurora-streak aurora-3" />
      </div>

      {/* Particles */}
      <HeroParticles />

      {/* Content */}
      <div
        className="relative z-10 text-center px-6 max-w-4xl mx-auto"
        style={{
          transform: `translateY(${offset * 0.18}px)`,
          opacity: Math.max(0, 1 - offset / 500),
        }}
      >
        <p className="text-[#C9A84C] text-xs tracking-[0.4em] uppercase mb-6 animate-fade-in opacity-0 delay-100">
          ✦ Мистические путешествия по России ✦
        </p>
        <h1
          className="font-cormorant text-6xl md:text-8xl font-light leading-none mb-6 animate-fade-in-up opacity-0 delay-200"
          style={{ textShadow: "0 0 80px rgba(201,168,76,0.4), 0 0 160px rgba(201,168,76,0.15)" }}
        >
          Туда, где<br />
          <em className="gold-shimmer not-italic">время замерло</em>
        </h1>
        <p className="text-[#9A8A6A] text-lg font-light leading-relaxed mb-10 max-w-2xl mx-auto animate-fade-in-up opacity-0 delay-300">
          Мы открываем места, о которых не пишут в путеводителях. Заброшенные усадьбы,
          древние леса и тайные тропы — для тех, кто ищет настоящее.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up opacity-0 delay-400">
          <a
            href="#routes"
            className="px-8 py-4 bg-[#C9A84C] text-[#0A0C10] text-sm tracking-widest uppercase font-medium hover:bg-[#E8C97A] transition-all duration-300 glow-border"
          >
            Смотреть маршруты
          </a>
          <a
            href="#places"
            className="px-8 py-4 border border-[#9A8A6A]/50 text-[#9A8A6A] text-sm tracking-widest uppercase hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all duration-300"
          >
            Узнать больше
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float z-10"
        style={{ opacity: Math.max(0, 1 - offset / 200) }}
      >
        <span className="text-[#9A8A6A] text-xs tracking-widest uppercase">Листайте</span>
        <Icon name="ChevronDown" size={16} className="text-[#C9A84C]" />
      </div>
    </section>
  );
}

// ── Map section ────────────────────────────────────────────────────────────

function MapSection() {
  const [activePoint, setActivePoint] = useState<number | null>(null);
  const [flyTo, setFlyTo] = useState<[number, number] | null>(null);
  const [activeRoute, setActiveRoute] = useState<string>("all");

  const filtered = activeRoute === "all"
    ? MAP_POINTS
    : MAP_POINTS.filter((p) => p.route === activeRoute);

  const routes = ["all", ...Array.from(new Set(MAP_POINTS.map((p) => p.route)))];

  function handleMarkerClick(point: typeof MAP_POINTS[0]) {
    setActivePoint(point.id);
    setFlyTo(point.coords);
  }

  const selected = MAP_POINTS.find((p) => p.id === activePoint);

  return (
    <section id="map" className="py-28 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="text-center mb-20">
        <p className="text-[#C9A84C] text-xs tracking-[0.4em] uppercase mb-4">✦ Где мы бываем ✦</p>
        <h2 className="section-title text-5xl md:text-6xl text-foreground mb-6">Карта маршрутов</h2>
        <div className="gold-line max-w-24 mx-auto" />
        <p className="text-[#9A8A6A] mt-8 max-w-lg mx-auto text-sm leading-relaxed">
          Нажмите на метку, чтобы узнать подробности о месте
        </p>
      </div>

      {/* Route filter */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
        {routes.map((r) => {
          const color = r === "all" ? "#C9A84C"
            : MAP_POINTS.find((p) => p.route === r)?.color ?? "#C9A84C";
          const isActive = activeRoute === r;
          return (
            <button
              key={r}
              onClick={() => { setActiveRoute(r); setActivePoint(null); setFlyTo(null); }}
              className="px-4 py-2 text-xs tracking-widest uppercase transition-all duration-300"
              style={{
                border: `1px solid ${color}${isActive ? "ff" : "44"}`,
                color: isActive ? "#0A0C10" : color,
                background: isActive ? color : "transparent",
              }}
            >
              {r === "all" ? "Все маршруты" : r}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border border-[#C9A84C]/15" style={{ height: "520px" }}>
        {/* Sidebar */}
        <div className="border-r border-[#C9A84C]/15 overflow-y-auto" style={{ background: "rgba(10,12,16,0.95)" }}>
          {filtered.map((point) => {
            const isActive = activePoint === point.id;
            return (
              <button
                key={point.id}
                onClick={() => handleMarkerClick(point)}
                className="w-full text-left p-5 border-b border-white/5 transition-all duration-300 group"
                style={{ background: isActive ? `${point.color}11` : "transparent" }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5"
                    style={{ background: point.color, boxShadow: isActive ? `0 0 8px ${point.color}` : "none" }}
                  />
                  <div>
                    <p className="font-cormorant text-lg leading-tight"
                      style={{ color: isActive ? point.color : "#E8C97A" }}>
                      {point.name}
                    </p>
                    <p className="text-[#9A8A6A] text-xs mt-0.5 tracking-wider" style={{ color: `${point.color}99` }}>
                      {point.route}
                    </p>
                    {isActive && (
                      <p className="text-[#9A8A6A] text-xs mt-2 leading-relaxed">{point.desc}</p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Map */}
        <div className="lg:col-span-2 relative">
          <MapContainer
            center={[58, 38]}
            zoom={4}
            style={{ width: "100%", height: "100%" }}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {flyTo && <FlyToMarker coords={flyTo} />}
            {filtered.map((point) => (
              <Marker
                key={point.id}
                position={point.coords}
                icon={createCustomIcon(point.color)}
                eventHandlers={{ click: () => handleMarkerClick(point) }}
              >
                <Popup className="dark-popup">
                  <div style={{
                    background: "#0E1015",
                    border: `1px solid ${point.color}55`,
                    padding: "12px 16px",
                    minWidth: "200px",
                    fontFamily: "'Golos Text', sans-serif",
                  }}>
                    <p style={{ fontFamily: "'Cormorant', serif", fontSize: "18px", color: point.color, marginBottom: "4px" }}>
                      {point.name}
                    </p>
                    <p style={{ fontSize: "11px", color: "#9A8A6A", marginBottom: "8px", letterSpacing: "0.1em" }}>
                      {point.route}
                    </p>
                    <p style={{ fontSize: "12px", color: "#B0A080", lineHeight: "1.5", marginBottom: "10px" }}>
                      {point.desc}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "8px" }}>
                      <span style={{ fontSize: "12px", color: "#9A8A6A" }}>{point.days}</span>
                      <span style={{ fontSize: "14px", color: point.color, fontFamily: "'Cormorant', serif" }}>{point.price}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Map overlay hint */}
          {!activePoint && (
            <div className="absolute bottom-4 right-4 z-[1000] text-xs text-[#9A8A6A] bg-[#0A0C10]/80 px-3 py-2 border border-[#C9A84C]/15 flex items-center gap-2">
              <Icon name="MousePointer" size={12} className="text-[#C9A84C]" />
              Нажмите на метку
            </div>
          )}
          {selected && (
            <div className="absolute bottom-4 left-4 z-[1000] text-xs bg-[#0A0C10]/90 px-4 py-3 border flex items-center gap-3"
              style={{ borderColor: `${selected.color}44` }}>
              <div className="w-2 h-2 rounded-full" style={{ background: selected.color }} />
              <span className="text-[#E8C97A] font-cormorant text-base">{selected.name}</span>
              <a href="#booking" className="ml-2 text-[#C9A84C] tracking-wider uppercase hover:underline">
                Забронировать →
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function Index() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", route: "", date: "", message: "" });

  return (
    <div className="min-h-screen bg-background text-foreground font-golos relative overflow-x-hidden">
      <div className="grain" />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5"
        style={{ background: "linear-gradient(to bottom, rgba(10,12,16,0.95) 0%, transparent 100%)" }}>
        <a href="#hero" className="flex items-center gap-3">
          <div className="w-8 h-8 border border-[#C9A84C] rotate-45 flex items-center justify-center">
            <div className="w-2 h-2 bg-[#C9A84C] rotate-45" />
          </div>
          <span className="font-cormorant text-xl font-light tracking-[0.2em] text-[#E8C97A] uppercase">
            Тени Прошлого
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href}
              className="text-sm tracking-widest uppercase text-[#9A8A6A] hover:text-[#C9A84C] transition-colors duration-300">
              {item.label}
            </a>
          ))}
          <a href="#booking"
            className="px-5 py-2 border border-[#C9A84C] text-[#C9A84C] text-sm tracking-widest uppercase hover:bg-[#C9A84C] hover:text-[#0A0C10] transition-all duration-300">
            Забронировать
          </a>
        </div>

        <button className="md:hidden text-[#C9A84C]" onClick={() => setMobileOpen(!mobileOpen)}>
          <Icon name={mobileOpen ? "X" : "Menu"} size={24} />
        </button>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-[#0A0C10]/98 flex flex-col items-center justify-center gap-8">
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
              className="font-cormorant text-3xl font-light tracking-widest text-[#C9A84C]">
              {item.label}
            </a>
          ))}
          <a href="#booking" onClick={() => setMobileOpen(false)}
            className="mt-4 px-8 py-3 border border-[#C9A84C] text-[#C9A84C] tracking-widest uppercase">
            Забронировать
          </a>
        </div>
      )}

      {/* HERO */}
      <HeroSection />

      {/* О МЕСТАХ */}
      <section id="places" className="py-28 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-[#C9A84C] text-xs tracking-[0.4em] uppercase mb-4">✦ Куда мы идём ✦</p>
          <h2 className="section-title text-5xl md:text-6xl text-foreground mb-6">О местах</h2>
          <div className="gold-line max-w-24 mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PLACES.map((place, i) => (
            <div key={i} className="group p-8 border border-[#C9A84C]/15 hover:border-[#C9A84C]/50 transition-all duration-500 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.03) 0%, transparent 60%)" }}>
              <div className="absolute top-0 left-0 w-0 h-[1px] bg-[#C9A84C] group-hover:w-full transition-all duration-700" />
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 border border-[#C9A84C]/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <Icon name={place.icon as "Castle"} size={20} className="text-[#C9A84C]" fallback="MapPin" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-cormorant text-2xl font-light">{place.title}</h3>
                    <span className="text-xs px-2 py-0.5 border border-[#C9A84C]/30 text-[#C9A84C] tracking-wider">
                      {place.tag}
                    </span>
                  </div>
                  <p className="text-[#9A8A6A] leading-relaxed">{place.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 relative overflow-hidden h-72 md:h-96">
          <img src={FOREST_IMG} alt="Мистический лес" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-transparent to-[#0A0C10]/50" />
          <div className="absolute bottom-8 left-8 right-8">
            <p className="font-cormorant text-3xl font-light italic text-[#E8C97A]">
              "Каждое место хранит свою историю — нужно лишь уметь слушать"
            </p>
          </div>
        </div>
      </section>

      <div className="gold-line opacity-20" />

      {/* МАРШРУТЫ */}
      <section id="routes" className="py-28 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-[#C9A84C] text-xs tracking-[0.4em] uppercase mb-4">✦ Выбери свой путь ✦</p>
          <h2 className="section-title text-5xl md:text-6xl text-foreground mb-6">Маршруты</h2>
          <div className="gold-line max-w-24 mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {ROUTES.map((route, i) => (
            <div key={i} className="group relative border border-white/5 hover:border-[#C9A84C]/30 transition-all duration-500 overflow-hidden"
              style={{ background: "rgba(255,255,255,0.02)" }}>
              <div className="h-1 w-0 group-hover:w-full transition-all duration-700"
                style={{ background: route.color }} />
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs px-3 py-1 tracking-widest uppercase"
                    style={{ color: route.color, border: `1px solid ${route.color}40` }}>
                    {route.difficulty}
                  </span>
                  <span className="text-[#9A8A6A] text-sm flex items-center gap-1">
                    <Icon name="Clock" size={14} /> {route.days}
                  </span>
                </div>
                <h3 className="font-cormorant text-3xl font-light mb-4" style={{ color: route.color }}>
                  {route.name}
                </h3>
                <p className="text-[#9A8A6A] leading-relaxed mb-8 text-sm">{route.desc}</p>
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <span className="font-cormorant text-2xl" style={{ color: route.color }}>
                    {route.price}
                  </span>
                  <a href="#booking"
                    className="text-xs tracking-widest uppercase text-[#9A8A6A] hover:text-[#C9A84C] transition-colors flex items-center gap-1">
                    Выбрать <Icon name="ArrowRight" size={14} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-[#9A8A6A] text-sm mb-6">Не нашли подходящий маршрут? Мы составим персональный тур</p>
          <a href="#contacts"
            className="inline-flex items-center gap-2 text-[#C9A84C] border border-[#C9A84C]/40 px-6 py-3 text-sm tracking-widest uppercase hover:bg-[#C9A84C]/10 transition-all">
            Связаться с нами <Icon name="MessageCircle" size={14} />
          </a>
        </div>
      </section>

      <div className="gold-line opacity-20" />

      {/* КАРТА */}
      <MapSection />

      <div className="gold-line opacity-20" />

      {/* ГАЛЕРЕЯ */}
      <section id="gallery" className="py-28 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-[#C9A84C] text-xs tracking-[0.4em] uppercase mb-4">✦ Визуальные истории ✦</p>
          <h2 className="section-title text-5xl md:text-6xl text-foreground mb-6">Галерея</h2>
          <div className="gold-line max-w-24 mx-auto" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {GALLERY_ITEMS.map((item, i) => (
            <div key={i}
              className={`relative overflow-hidden cursor-pointer group ${i === 0 ? "row-span-2" : ""}`}
              style={{ height: i === 0 ? "496px" : "240px" }}>
              <img src={item.img} alt={item.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="font-cormorant text-lg text-white">{item.title}</p>
                <p className="text-[#C9A84C] text-xs tracking-widest flex items-center gap-1">
                  <Icon name="MapPin" size={10} /> {item.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="gold-line opacity-20" />

      {/* ОТЗЫВЫ */}
      <section id="reviews" className="py-28 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-[#C9A84C] text-xs tracking-[0.4em] uppercase mb-4">✦ Слова путешественников ✦</p>
          <h2 className="section-title text-5xl md:text-6xl text-foreground mb-6">Отзывы</h2>
          <div className="gold-line max-w-24 mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {REVIEWS.map((review, i) => (
            <div key={i} className="p-8 border border-white/5 relative"
              style={{ background: "linear-gradient(145deg, rgba(201,168,76,0.04) 0%, transparent 50%)" }}>
              <div className="absolute top-6 right-6 font-cormorant text-6xl text-[#C9A84C]/15 leading-none select-none">"</div>
              <div className="flex gap-1 mb-6">
                {Array.from({ length: review.stars }).map((_, j) => (
                  <span key={j} className="text-[#C9A84C] text-sm">★</span>
                ))}
              </div>
              <p className="text-[#B0A080] leading-relaxed mb-8 text-sm italic">"{review.text}"</p>
              <div className="border-t border-white/5 pt-5 flex items-center justify-between">
                <div>
                  <p className="font-cormorant text-lg text-[#E8C97A]">{review.name}</p>
                  <p className="text-[#9A8A6A] text-xs tracking-wider">{review.route}</p>
                </div>
                <span className="text-[#9A8A6A] text-xs">{review.date}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 relative overflow-hidden h-48 md:h-64">
          <img src={MANSION_IMG} alt="Статистика" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-[#0A0C10]/60 flex items-center justify-center">
            <div className="grid grid-cols-3 gap-12 text-center">
              {[
                { num: "8+", label: "лет опыта" },
                { num: "340+", label: "туристов" },
                { num: "48", label: "маршрутов" },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="font-cormorant text-5xl text-[#C9A84C]">{stat.num}</p>
                  <p className="text-[#9A8A6A] text-xs tracking-widest uppercase mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="gold-line opacity-20" />

      {/* БРОНИРОВАНИЕ */}
      <section id="booking" className="py-28 px-6 md:px-12 max-w-4xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-[#C9A84C] text-xs tracking-[0.4em] uppercase mb-4">✦ Начни путешествие ✦</p>
          <h2 className="section-title text-5xl md:text-6xl text-foreground mb-6">Бронирование</h2>
          <div className="gold-line max-w-24 mx-auto" />
          <p className="text-[#9A8A6A] mt-8 max-w-lg mx-auto leading-relaxed">
            Оставьте заявку — мы свяжемся с вами в течение 24 часов и согласуем все детали вашего мистического путешествия
          </p>
        </div>

        <div className="border border-[#C9A84C]/20 p-8 md:p-12"
          style={{ background: "linear-gradient(145deg, rgba(201,168,76,0.04) 0%, transparent 60%)" }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs tracking-widest uppercase text-[#9A8A6A] mb-2">Ваше имя</label>
              <input type="text" value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Как к вам обращаться?"
                className="w-full bg-transparent border border-[#C9A84C]/20 px-4 py-3 text-foreground placeholder-[#9A8A6A]/50 focus:outline-none focus:border-[#C9A84C]/60 transition-colors text-sm" />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-[#9A8A6A] mb-2">Телефон</label>
              <input type="tel" value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+7 (___) ___-__-__"
                className="w-full bg-transparent border border-[#C9A84C]/20 px-4 py-3 text-foreground placeholder-[#9A8A6A]/50 focus:outline-none focus:border-[#C9A84C]/60 transition-colors text-sm" />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-[#9A8A6A] mb-2">Маршрут</label>
              <select value={formData.route}
                onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                className="w-full bg-[#0E1015] border border-[#C9A84C]/20 px-4 py-3 text-foreground focus:outline-none focus:border-[#C9A84C]/60 transition-colors text-sm">
                <option value="">Выберите маршрут...</option>
                <option value="path-of-shadows">Путь теней</option>
                <option value="north-mystery">Северная мистерия</option>
                <option value="crimea-secrets">Крымские тайны</option>
                <option value="custom">Персональный тур</option>
              </select>
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-[#9A8A6A] mb-2">Желаемые даты</label>
              <input type="text" value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                placeholder="Например: июнь 2025"
                className="w-full bg-transparent border border-[#C9A84C]/20 px-4 py-3 text-foreground placeholder-[#9A8A6A]/50 focus:outline-none focus:border-[#C9A84C]/60 transition-colors text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs tracking-widest uppercase text-[#9A8A6A] mb-2">Сообщение</label>
              <textarea value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Расскажите о ваших пожеланиях и интересах..."
                rows={4}
                className="w-full bg-transparent border border-[#C9A84C]/20 px-4 py-3 text-foreground placeholder-[#9A8A6A]/50 focus:outline-none focus:border-[#C9A84C]/60 transition-colors resize-none text-sm" />
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <button className="w-full sm:w-auto px-10 py-4 bg-[#C9A84C] text-[#0A0C10] text-sm tracking-widest uppercase font-medium hover:bg-[#E8C97A] transition-all duration-300 glow-border">
              Отправить заявку
            </button>
            <p className="text-[#9A8A6A] text-xs leading-relaxed text-center sm:text-left">
              Нажимая кнопку, вы соглашаетесь<br />на обработку персональных данных
            </p>
          </div>
        </div>
      </section>

      <div className="gold-line opacity-20" />

      {/* КОНТАКТЫ */}
      <section id="contacts" className="py-28 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-[#C9A84C] text-xs tracking-[0.4em] uppercase mb-4">✦ Найдите нас ✦</p>
          <h2 className="section-title text-5xl md:text-6xl text-foreground mb-6">Контакты</h2>
          <div className="gold-line max-w-24 mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          {[
            { icon: "Phone", title: "Телефон", value: "+7 (495) 000-00-00", sub: "Пн–Пт, 10:00–20:00" },
            { icon: "Mail", title: "Email", value: "info@teni-proshlogo.ru", sub: "Ответим в течение дня" },
            { icon: "MapPin", title: "Офис", value: "Москва, Арбат 12", sub: "По предварительной записи" },
          ].map((contact, i) => (
            <div key={i} className="text-center p-8 border border-[#C9A84C]/10 hover:border-[#C9A84C]/30 transition-all duration-300">
              <div className="w-12 h-12 border border-[#C9A84C]/30 flex items-center justify-center mx-auto mb-5">
                <Icon name={contact.icon as "Phone"} size={20} className="text-[#C9A84C]" />
              </div>
              <p className="text-xs tracking-widest uppercase text-[#9A8A6A] mb-2">{contact.title}</p>
              <p className="font-cormorant text-xl text-[#E8C97A] mb-1">{contact.value}</p>
              <p className="text-[#9A8A6A] text-xs">{contact.sub}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-[#9A8A6A] text-sm mb-6">Следите за нами в социальных сетях</p>
          <div className="flex items-center justify-center gap-4">
            {[
              { icon: "Send", label: "Telegram" },
              { icon: "Instagram", label: "Instagram" },
              { icon: "Youtube", label: "YouTube" },
            ].map((social, i) => (
              <button key={i}
                className="w-10 h-10 border border-[#C9A84C]/20 flex items-center justify-center text-[#9A8A6A] hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all duration-300">
                <Icon name={social.icon as "Send"} size={16} />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#C9A84C]/10 py-10 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border border-[#C9A84C] rotate-45 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-[#C9A84C] rotate-45" />
            </div>
            <span className="font-cormorant text-lg font-light tracking-[0.2em] text-[#C9A84C] uppercase">
              Тени Прошлого
            </span>
          </div>
          <p className="text-[#9A8A6A] text-xs tracking-wider text-center">
            © 2025 Тени Прошлого · Мистические туры по России
          </p>
          <div className="flex gap-6">
            {NAV_ITEMS.slice(0, 3).map((item) => (
              <a key={item.href} href={item.href}
                className="text-xs tracking-widest uppercase text-[#9A8A6A] hover:text-[#C9A84C] transition-colors">
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}