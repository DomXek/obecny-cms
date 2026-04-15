-- ROZŠÍRENIA
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- TENANTI (obce)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  custom_domain VARCHAR(255),
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#1a56db',
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  address TEXT,
  ico VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- POUŽÍVATELIA (rozšírenie Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'editor',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STRÁNKY
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) NOT NULL,
  content TEXT,
  meta_title VARCHAR(255),
  meta_description TEXT,
  is_published BOOLEAN DEFAULT false,
  is_homepage BOOLEAN DEFAULT false,
  parent_id UUID REFERENCES pages(id),
  sort_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

-- NOVINKY
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) NOT NULL,
  excerpt TEXT,
  content TEXT,
  cover_image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

-- ÚRADNÁ TABUĽA (LEGISLATÍVNE KRITICKÉ)
CREATE TABLE official_notices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  content TEXT,
  document_url TEXT,
  document_filename VARCHAR(255),
  category VARCHAR(100),
  reference_number VARCHAR(100),
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  removed_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  published_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT expires_min_15_days CHECK (
    expires_at IS NULL OR expires_at >= published_at + INTERVAL '15 days'
  )
);

-- AUDIT LOG
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXY
CREATE INDEX idx_pages_tenant ON pages(tenant_id);
CREATE INDEX idx_posts_tenant ON posts(tenant_id);
CREATE INDEX idx_notices_tenant_status ON official_notices(tenant_id, status);
CREATE INDEX idx_notices_expires ON official_notices(expires_at) WHERE status = 'published';
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);

-- RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE official_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies: verejné čítanie published notices
CREATE POLICY "Public read published notices" ON official_notices
  FOR SELECT USING (status IN ('published', 'archived'));

-- RLS Policies: admin vidí všetko v svojom tenante
CREATE POLICY "Admin full access notices" ON official_notices
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies: profiles
CREATE POLICY "Users see own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Admin sees tenant profiles" ON profiles
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );
