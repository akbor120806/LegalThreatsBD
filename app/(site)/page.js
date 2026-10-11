export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getUserSession } from '@/lib/session';
import LawyerCard from '@/components/LawyerCard';
import CallBackForm from '@/components/CallBackForm';
import T from '@/components/T';
import HeroSearchBar from '@/components/HeroSearchBar';
import HeroDistrictSelect from '@/components/HeroDistrictSelect';
import DISTRICTS from '@/lib/districts';
import HeroSlider from '@/components/HeroSlider';
import DistrictNote from '@/components/DistrictNote';

async function getViewerDistrict() {
  const session = await getUserSession();
  if (!session) return null;
  const [[row]] = await db().query('SELECT district FROM users WHERE id = ?', [session.id]);
  return row?.district || null;
}

async function getData(district, explicit) {
  const conn = db();
  const [categories] = await conn.query('SELECT * FROM legal_categories ORDER BY id');

  if (district && explicit) {
    // The visitor picked a district in the hero: show EVERY verified
    // lawyer in that district (no cap, no silent fallback).
    const [districtLawyers] = await conn.query(
      `SELECT l.*, c.slug AS category_slug FROM lawyers l
       LEFT JOIN legal_categories c ON c.id = l.category_id
       WHERE l.is_verified = 1 AND l.district = ?
       ORDER BY l.rating DESC`,
      [district]
    );
    return { lawyers: districtLawyers, categories, matchedDistrict: districtLawyers.length > 0, emptyDistrict: districtLawyers.length === 0 };
  }

  if (district) {
    const [districtLawyers] = await conn.query(
      `SELECT l.*, c.slug AS category_slug FROM lawyers l
       LEFT JOIN legal_categories c ON c.id = l.category_id
       WHERE l.is_verified = 1 AND l.district = ?
       ORDER BY l.rating DESC LIMIT 8`,
      [district]
    );
    if (districtLawyers.length) {
      return { lawyers: districtLawyers, categories, matchedDistrict: true, emptyDistrict: false };
    }
  }

  const [lawyers] = await conn.query(
    `SELECT l.*, c.slug AS category_slug FROM lawyers l
     LEFT JOIN legal_categories c ON c.id = l.category_id
     WHERE l.is_verified = 1
     ORDER BY l.rating DESC LIMIT 8`
  );
  return { lawyers, categories, matchedDistrict: false, emptyDistrict: false };
}

export default async function HomePage({ searchParams }) {
  const sp = await searchParams;
  const picked = typeof sp?.district === 'string' && DISTRICTS.includes(sp.district) ? sp.district : null;
  const district = picked || (await getViewerDistrict());
  const { lawyers, categories, matchedDistrict, emptyDistrict } = await getData(district, !!picked);

  return (
    <>
      <section className="hero">
        <HeroSlider />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <T k="hero_title" as="h1" />
          <T k="hero_subtitle" as="p" />
          <div className="hero-search-row">
            <HeroSearchBar />
            <HeroDistrictSelect currentDistrict={picked || ''} />
          </div>
          <div className="hero-actions" style={{ marginTop: 26 }}>
            <Link href="/lawyers" className="btn btn-primary"><T k="hero_find_lawyer_btn" /></Link>
            <Link href="/legal-awareness" className="btn btn-outline"><T k="hero_explore_btn" /></Link>
          </div>
        </div>
      </section>

      <section id="find-lawyer" className="section" style={{ background: 'var(--card)' }}>
        <div className="container">
          <T k="find_lawyer_title" as="h2" className="section-title" />
          <T k="find_lawyer_subtitle" as="p" className="section-subtitle" />
          <DistrictNote matched={matchedDistrict} fallback={!matchedDistrict && !emptyDistrict} district={district} empty={emptyDistrict} />

          <div className="category-tabs">
            <Link href="/lawyers" className="active"><T k="category_all" /></Link>
            {categories.map((c) => (
              <Link key={c.id} href={`/lawyers?category=${c.slug}`}>{c.name}</Link>
            ))}
          </div>

          <div className="grid grid-4 lawyer-grid">
            {lawyers.map((l) => (
              <LawyerCard key={l.id} lawyer={l} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <T k="services_title" as="h2" className="section-title" />
          <T k="services_subtitle" as="p" className="section-subtitle" />
          <div className="grid grid-3">
            <div className="card service-card">
              <div className="icon">⚖</div>
              <T k="service_find_lawyer_title" as="h3" />
              <T k="service_find_lawyer_desc" as="p" />
              <Link href="/lawyers" className="btn btn-navy btn-sm" style={{ marginTop: 16 }}>Browse Lawyers</Link>
            </div>
            <div className="card service-card">
              <div className="icon">📄</div>
              <T k="service_documents_title" as="h3" />
              <T k="service_documents_desc" as="p" />
              <Link href="/documents" className="btn btn-navy btn-sm" style={{ marginTop: 16 }}>View Documents</Link>
            </div>
            <div className="card service-card">
              <div className="icon">📚</div>
              <T k="service_knowledge_title" as="h3" />
              <T k="service_knowledge_desc" as="p" />
              <Link href="/legal-awareness" className="btn btn-navy btn-sm" style={{ marginTop: 16 }}>Learn More</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section callback-band">
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: 'center' }}>
            <div>
              <T k="callback_title" as="h2" style={{ fontSize: 28, marginBottom: 10 }} />
              <T k="callback_subtitle" as="p" style={{ color: '#c9d0e6', maxWidth: 420 }} />
            </div>
            <CallBackForm />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="quote-block">
            <p>
              "The Companies Act 1994 provides the legal foundation for company
              formation, corporate governance, and regulatory compliance in
              Bangladesh — protecting the interests of shareholders and stakeholders."
            </p>
            <span>— Legal Threats BD, Corporate Law Resource</span>
          </div>
        </div>
      </section>
    </>
  );
}
