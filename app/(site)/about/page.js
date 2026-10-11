export default function AboutPage() {
  return (
    <>
      <section className="hero" style={{ padding: '70px 0' }}>
        <div className="container">
          <h1>About LEGAL THREATs BD
</h1>
          <p>
            We build a trusted bridge between citizens of Bangladesh who need
            legal help and verified legal practitioners who can provide it.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid-3">
            <div className="card card-pad" style={{ textAlign: 'center' }}>
              <div className="value" style={{ fontSize: 30, fontWeight: 700, color: 'var(--navy)' }}>12,000+</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Legal cases guided</div>
            </div>
            <div className="card card-pad" style={{ textAlign: 'center' }}>
              <div className="value" style={{ fontSize: 30, fontWeight: 700, color: 'var(--navy)' }}>120+</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Verified lawyers</div>
            </div>
            <div className="card card-pad" style={{ textAlign: 'center' }}>
              <div className="value" style={{ fontSize: 30, fontWeight: 700, color: 'var(--navy)' }}>98%</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Client satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <h2 className="section-title">Our Core Values</h2>
          <div className="grid grid-3">
            <div className="card service-card">
              <div className="icon">⚖</div>
              <h3>Justice</h3>
              <p>We are committed to promoting equal access to justice for everyone in Bangladesh.</p>
            </div>
            <div className="card service-card">
              <div className="icon">💡</div>
              <h3>Innovation</h3>
              <p>We use technology to simplify legal assistance and improve the user experience.</p>
            </div>
            <div className="card service-card">
              <div className="icon">🔒</div>
              <h3>Confidentiality</h3>
              <p>We protect user privacy and ensure the security of all legal information.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
