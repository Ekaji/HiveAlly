
import Card from "./Card";
import { supabase } from "../lib/supabase";
import { useState, useRef, useEffect } from "react";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  featured_image: {
    url: string;
  };
  city: string;
  state: string;
};

export default function ResponsiveGrid() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true); // Track if more items are available
    const observerRef = useRef();

    const fetchListings = async (page: number) => {
        setLoading(true);
        const { data, error } = await supabase
            .from('listings')
            .select('*')
            .range((page - 1) * 10, page * 10 - 1); // Fetch 10 listings per page

        if (error) {
            console.error('Error fetching listings:', error);
        } else {
            // Check if we received less than requested items
            if (data.length < 10) {
                setHasMore(false); // No more items to fetch
            }
            // Filter out duplicates before updating the state
            setListings((prev) => {
                const existingIds = new Set(prev.map(listing => listing.id));
                const newListings = data.filter(listing => !existingIds.has(listing.id));
                return [...prev, ...newListings]; // Append only unique listings
            });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchListings(page);
    }, [page]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !loading && hasMore) {
                setPage((prev) => prev + 1); // Load next page
            }
        });

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => {
            if (observerRef.current) {
                observer.unobserve(observerRef.current);
            }
        };
    }, [loading, hasMore]);

    return (
        <div className="max-w-screen-xl mx-auto py-5 sm:py-10 md:py-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
                {listings.map((listing) => (
                    <Card key={listing.id} listing={listing} />
                ))}
            </div>
            {loading && <p>Loading more listings...</p>}
            <div ref={observerRef} style={{ height: '20px', backgroundColor: 'transparent' }} />
            {!hasMore && <p>No more listings to load.</p>} {/* Optional message */}
        </div>
    );
}