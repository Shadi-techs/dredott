'use client'


export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '80px 24px 80px' }}>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.3em', color: '#D4A843', textTransform: 'uppercase', marginBottom: 16 }}>
          — Legal
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 44, fontWeight: 400, color: '#2C3A6B', marginBottom: 8 }}>Terms of Service</h1>
        <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 40 }}>Last updated: May 2026</p>

        {[
          { title: '1. Platform Role', body: 'DREDOTT is a listing platform that connects property owners, car owners, and service providers with potential guests and customers. We are not a party to any rental or service agreement between users.' },
          { title: '2. Owner Responsibilities', body: 'Owners are responsible for: the accuracy of all listing information and photos, compliance with Egyptian law regarding property rental, having valid documentation for any vehicle listed, responding to guest inquiries in a timely manner, and honoring any arrangements made directly with guests.' },
          { title: '3. Listing Standards', body: 'Photos must be of the actual property or vehicle. Misleading information, stock photos, or false claims will result in immediate removal without refund. DREDOTT reserves the right to remove any listing at its discretion.' },
          { title: '4. Subscriptions & Payments', body: 'Annual subscriptions are non-refundable once a listing has been approved and published. Subscription fees are due annually and listings become inactive if not renewed. DREDOTT does not take commission on rental transactions.' },
          { title: '5. Service Providers', body: 'Service providers must submit valid commercial registration or professional licensing. Operating without valid documentation may result in suspension. DREDOTT may verify submitted documents at any time.' },
          { title: '6. Rating Integrity', body: 'Submitting fake ratings, coordinating review manipulation, or creating multiple accounts to abuse ratings will result in a permanent ban. DREDOTT uses technical measures to detect rating fraud.' },
          { title: '7. Real Estate Transactions', body: 'For property sales facilitated through DREDOTT, a commission of 2.5% of the sale price is charged to the buyer. This is separate from rental subscription fees.' },
          { title: '8. Prohibited Content', body: 'Users may not post: false or misleading information, content that violates Egyptian law, offensive or discriminatory content, or contact information designed to bypass the platform before listing is approved.' },
          { title: '9. Limitation of Liability', body: 'DREDOTT is not liable for disputes between owners and guests, the quality or safety of listed properties or services, or any loss arising from use of the platform. We provide a listing service only.' },
          { title: '10. Changes to Terms', body: 'We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the updated terms. Contact hello@dredott.com for questions.' },
        ].map((section, i) => (
          <div key={i} style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: '#2C3A6B', marginBottom: 8 }}>{section.title}</h2>
            <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.8 }}>{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}