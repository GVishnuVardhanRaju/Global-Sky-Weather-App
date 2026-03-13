import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        headerRef.current.style.background =
          window.scrollY > 50 ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.05)";
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

        .landing-root {
          font-family: Poppins, sans-serif;
          background: linear-gradient(-45deg, #0f172a, #1e293b, #2563eb, #0ea5e9);
          background-size: 400% 400%;
          animation: gradientMove 12s ease infinite;
          color: white;
          overflow-x: hidden;
          min-height: 100vh;
        }

        @keyframes gradientMove {
          0% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
          100% { background-position: 0% 50% }
        }

        .landing-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 25px 60px;
          position: fixed;
          width: 100%;
          top: 0;
          z-index: 1000;
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(10px);
          transition: 0.3s;
        }

        .landing-logo {
          font-size: 24px;
          font-weight: bold;
        }

        .landing-nav a {
          margin-left: 25px;
          text-decoration: none;
          color: white;
          position: relative;
          cursor: pointer;
        }

        .landing-nav a::after {
          content: '';
          width: 0;
          height: 2px;
          background: #ff6b6b;
          position: absolute;
          bottom: -5px;
          left: 0;
          transition: 0.3s;
        }

        .landing-nav a:hover::after {
          width: 100%;
        }

        .landing-hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        /* background video sits behind overlay but above parent backgrounds */
        .landing-hero {
          position: relative; /* establish stacking context */
          z-index: 0;
        }
        .landing-hero video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 0; /* stay behind overlay */
        }

        .landing-hero::after {
          content: "";
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          /* slightly lighter overlay for better readability */
          background: rgba(0,0,0,0.35);
          z-index: 1; /* overlay above video */
        }

        .hero-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 2; /* above overlay */
          padding: 0 20px;
          color: #fff;
          text-shadow: 0 2px 8px rgba(0,0,0,0.6);
        }

        .hero-content h1 {
          font-size: 70px;
          margin-bottom: 15px;
          animation: fadeUp 1s ease;
          white-space: nowrap;         /* keep on single line */
          overflow-wrap: normal;
          /* ensure the animation starts from centered position */
        }

        .hero-content p {
          font-size: 20px;
          opacity: 0.9;
          line-height: 1.6;
        }

        .landing-btn {
          margin-top: 30px;
          padding: 15px 40px;
          border: none;
          border-radius: 40px;
          font-size: 18px;
          background: linear-gradient(135deg, #00d4ff, #2563eb);
          color: white;
          cursor: pointer;
          transition: 0.3s;
          font-family: Poppins, sans-serif;
        }

        .landing-btn:hover {
          transform: scale(1.05);
        }

        .floating-icons span {
          position: absolute;
          font-size: 30px;
          opacity: 0.6;
          animation: float 8s infinite ease-in-out;
          z-index: 1;
        }

        .floating-icons span:nth-child(1) { top: 20%; left: 10%; }
        .floating-icons span:nth-child(2) { top: 60%; left: 20%; }
        .floating-icons span:nth-child(3) { top: 40%; right: 15%; }
        .floating-icons span:nth-child(4) { top: 70%; right: 10%; }

        @keyframes float {
          0% { transform: translateY(0) }
          50% { transform: translateY(-20px) }
          100% { transform: translateY(0) }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .section-title {
          text-align: center;
          font-size: 42px;
          font-weight: 600;
          margin-top: 80px;
          margin-bottom: 10px;
          letter-spacing: 1px;
          scroll-margin-top: 120px;
        }

        .section-subtitle {
          text-align: center;
          font-size: 18px;
          opacity: 0.85;
          max-width: 650px;
          margin: auto;
          margin-bottom: 50px;
          line-height: 1.6;
        }

        .landing-features {
          padding: 20px 40px 80px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 30px;
        }

        .landing-card {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(15px);
          border-radius: 20px;
          padding: 30px;
          transition: all 0.3s ease;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          position: relative;
          overflow: hidden;
        }

        .landing-card::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transition: left 0.5s;
        }

        .landing-card:hover::before { left: 100%; }

        .landing-card:hover {
          transform: translateY(-10px);
          background: rgba(255,255,255,0.2);
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }

        .landing-card h3 {
          margin-bottom: 10px;
          font-size: 24px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .landing-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 30px;
          padding: 80px 40px;
          max-width: 900px;
          margin: auto;
          scroll-margin-top: 100px;
        }

        .landing-stat {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(15px);
          border-radius: 20px;
          padding: 30px;
          transition: all 0.3s ease;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          position: relative;
          overflow: hidden;
          text-align: center;
        }

        .landing-stat::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transition: left 0.5s;
        }

        .landing-stat:hover::before { left: 100%; }

        .landing-stat:hover {
          transform: translateY(-10px);
          background: rgba(255,255,255,0.2);
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }

        .landing-stat h2 {
          font-size: 40px;
          margin-bottom: 10px;
        }

        .landing-stat p { opacity: 0.9; }

        .landing-footer {
          text-align: center;
          padding: 25px;
          margin-top: 40px;
          opacity: 0.8;
          backdrop-filter: blur(10px);
          background: rgba(255,255,255,0.05);
          border-top: 1px solid rgba(255,255,255,0.1);
          scroll-margin-top: 120px;
        }

  /* ===== Mobile Responsive Fixes ===== */

.mobile-break{
  display:none;
}
@media (max-width:768px){

.mobile-break{
  display:block;
}
/* 1️⃣ Fix Header Layout */
.landing-header{
  padding:15px 20px;
  flex-direction:column;
  gap:10px;
}

/* Navigation alignment */
.landing-nav{
  display:flex;
  flex-wrap:wrap;
  justify-content:center;
}

/* 2️⃣ Adjust Hero Text Size */
.hero-content h1{
    font-size:34px;
    line-height:1.2;
    max-width:200px;
    margin:auto;
    text-align:center;
}

.hero-content p{
  font-size:15px;
}

/* 3️⃣ Hide Floating Icons for Mobile */
.floating-icons{
  display:none;
}

/* 4️⃣ Improve Feature Cards Layout */
.landing-features{
  padding:20px;
  grid-template-columns:1fr;
}

/* 5️⃣ Fix Stats Section Grid */
.landing-stats{
  grid-template-columns:1fr 1fr;
  gap:15px;
}

/* 6️⃣ Improve Section Titles */
.section-title{
  font-size:28px;
}

}

/* Prevent Horizontal Scroll */
body{
  overflow-x:hidden;
}
  </style>

      <div className="landing-root">
        <header ref={headerRef} className="landing-header">
          <div className="landing-logo">🌤 Global Sky</div>
          <nav className="landing-nav">
            <a href="#hero">Home</a>
            <a href="#features">Features</a>
            <a href="#stats">Stats</a>
            <a href="#contact">Contact</a>
          </nav>
        </header>

        <section className="landing-hero" id="hero">
          {/* background video from public/intro.mp4 */}
          <video className="hero-video" autoPlay loop muted playsInline>
            <source src="/intro.mp4" type="video/mp4" />
          </video>
          <div className="floating-icons">
            <span>☁</span>
            <span>🌧</span>
            <span>⛈</span>
            <span>🌤</span>
          </div>
          <div className="hero-content">
            <h1>Global Weather <br className="mobile-break" />Intelligence</h1>
            <p>
              Explore real-time weather forecasts, interactive global maps,
              air quality insights, and powerful analytics.
            </p>
            <button className="landing-btn" onClick={() => navigate("/app")}>
              Launch Weather App
            </button>
          </div>
        </section>

        <h2 className="section-title" id="features">Powerful Weather Features</h2>

        <section className="landing-features">
          <div className="landing-card">
            <h3>🌍 Global Weather</h3>
            <p>Search any city worldwide and get real-time weather conditions.</p>
          </div>
          <div className="landing-card">
            <h3>🗺 Interactive Map</h3>
            <p>Explore weather visually through an interactive world map.</p>
          </div>
          <div className="landing-card">
            <h3>⛅ Smart Forecast</h3>
            <p>Detailed hourly and weekly weather predictions.</p>
          </div>
          <div className="landing-card">
            <h3>🌫 Air Quality</h3>
            <p>Track pollution levels and environmental conditions.</p>
          </div>
        </section>

        <h2 className="section-title">Global Weather Insights</h2>
        <p className="section-subtitle">
          Powering accurate weather intelligence for users around the world
        </p>

        <section className="landing-stats" id="stats">
          <div className="landing-stat">
            <h2>1M+</h2>
            <p>Users</p>
          </div>
          <div className="landing-stat">
            <h2>150+</h2>
            <p>Countries</p>
          </div>
          <div className="landing-stat">
            <h2>10M+</h2>
            <p>Weather Searches</p>
          </div>
          <div className="landing-stat">
            <h2>99%</h2>
            <p>Forecast Accuracy</p>
          </div>
        </section>

        <footer className="landing-footer" id="contact">
          <h3>Global Sky Weather</h3>
          <p>support@globalsky.com</p>
          <p>Real-time weather intelligence for the world.</p>
          <p>© 2026 Global Sky • All rights reserved</p>
        </footer>
      </div>
    </>
  );
};

export default Landing;
