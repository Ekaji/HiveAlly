
-- Enum types
CREATE TYPE subscription_tier AS ENUM ('Basic', 'Pro', 'Enterprise');
CREATE TYPE billing_period AS ENUM ('Monthly', 'Quarterly', 'Annual');
CREATE TYPE discount_type AS ENUM ('Percentage', 'Fixed');
CREATE TYPE subscription_status AS ENUM ('Active', 'Cancelled', 'Expired', 'PastDue');
CREATE TYPE currency_type AS ENUM ('USD', 'NGN');

CREATE TYPE listings_status AS ENUM (
    'Active',
    'Inactive'
);

CREATE TYPE image_metadata AS (
    url TEXT,
    width INTEGER,
    height INTEGER,
    size INTEGER,
    format TEXT
);
-- Create Categories Table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Create Subcategories Table with Description
CREATE TABLE subcategories (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL  -- column for subcategory description
);

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone_number TEXT UNIQUE,
    profile_picture TEXT,
    location TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY select_profiles ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY insert_profiles ON profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY update_profiles ON profiles FOR UPDATE USING (id = auth.uid());

CREATE TABLE amenities (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT -- Optional description of the amenity
);


-- Modify the listings table
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category_id INT REFERENCES categories(id) ON DELETE CASCADE,
    subcategory_id INT REFERENCES subcategories(id) ON DELETE CASCADE,
    price NUMERIC(10, 2) NOT NULL,
    featured_image image_metadata,
    images image_metadata[],
    -- Location fields
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    postal_code TEXT,
    location gis.geography(POINT) NOT NULL DEFAULT gis.ST_Point(0, 0)::gis.geography,
    listings_status listings_status DEFAULT 'Active',
    rules TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
-- Create spatial index
CREATE INDEX listings_location_idx ON public.listings USING GIST (location);
CREATE POLICY select_listings ON listings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY insert_listings ON listings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY update_listings ON listings FOR UPDATE USING (user_id = auth.uid());

CREATE TABLE listing_amenities (
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    amenity_id INT REFERENCES amenities(id) ON DELETE CASCADE,
    PRIMARY KEY (listing_id, amenity_id)  -- Composite primary key
);

CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    listing_id UUID REFERENCES listings (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY select_favorites ON favorites FOR SELECT USING (user_id = auth.uid());
CREATE POLICY update_favorites ON favorites FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY insert_favorites ON favorites FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES auth.users ON DELETE CASCADE,
    recipient_id UUID REFERENCES auth.users ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY select_messages ON messages 
FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY insert_messages ON messages
FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY update_messages ON messages
FOR UPDATE USING (sender_id = auth.uid());

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_notifications ON notifications
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY insert_notifications ON notifications
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES listings (id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES auth.users ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_reviews ON reviews
FOR SELECT
USING (listing_id IN (SELECT id FROM listings WHERE user_id = auth.uid()));

CREATE POLICY insert_reviews ON reviews
FOR INSERT
WITH CHECK (reviewer_id = auth.uid());

-- Plans table to define different subscription plans
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    tier subscription_tier NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pricing table to handle different billing periods and amounts
CREATE TABLE plan_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID REFERENCES plans(id) ON DELETE CASCADE,
    billing_period billing_period NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency currency_type NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(plan_id, billing_period, currency)
);

-- Discounts table to manage various types of discounts
CREATE TABLE discounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type discount_type NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    currency currency_type,  -- NULL for percentage discounts
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    min_purchase_amount DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Ensure currency is set for fixed discounts and NULL for percentage
    CONSTRAINT check_discount_currency CHECK (
        (discount_type = 'Fixed' AND currency IS NOT NULL) OR
        (discount_type = 'Percentage' AND currency IS NULL)
    )
);

-- Modified subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    plan_id UUID REFERENCES plans(id),
    subscription_status subscription_status DEFAULT 'Active',
    billing_period billing_period NOT NULL,
    currency currency_type NOT NULL,
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT false,
    cancelled_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription discounts junction table
CREATE TABLE subscription_discounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
    discount_id UUID REFERENCES discounts(id),
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Billing history table
CREATE TABLE billing_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency currency_type NOT NULL,
    billing_period_start TIMESTAMPTZ NOT NULL,
    billing_period_end TIMESTAMPTZ NOT NULL,
    discount_applied DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(10,2) NOT NULL,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create an index for currency filtering
CREATE INDEX idx_plan_prices_currency ON plan_prices(currency);
CREATE INDEX idx_billing_history_currency ON billing_history(currency);





-- Function to find nearby listings
CREATE OR REPLACE FUNCTION nearby_listings(
    lat FLOAT,
    long FLOAT,
    radius_meters FLOAT DEFAULT 5000
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    price NUMERIC(10, 2),
    address TEXT,
    distance_meters FLOAT,
    lat FLOAT,
    long FLOAT
)
LANGUAGE sql
STABLE
AS $$
    SELECT 
        l.id,
        l.title,
        l.description,
        l.price,
        l.address,
        gis.st_distance(l.location, gis.ST_Point(long, lat)::gis.geography) as distance_meters,
        gis.ST_Y(l.location::gis.geometry) as lat,
        gis.ST_X(l.location::gis.geometry) as long
    FROM public.listings l
    WHERE 
        l.listings_status = 'Active'
        AND gis.ST_DWithin(
            l.location,
            gis.ST_Point(long, lat)::gis.geography,
            radius_meters
        )
    -- ORDER BY l.location <-> gis.ST_Point(long, lat)::gis.geography;
    ORDER BY gis.st_distance(l.location, gis.st_point(long, lat)::gis.geography);
$$;

