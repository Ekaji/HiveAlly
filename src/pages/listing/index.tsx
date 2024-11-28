import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface Listings {
    id: string;
    title: string;
    description: string;
    price: string;
    currency: string;
    featured_image: {
      url: string;
    };
    images: [];
    address: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    rules: string;
    created_at: string;
  };

export default function Listing() {
  const { listingId } = useParams(); // Extracting listing ID from URL params
  const [listing, setListing] = useState<Listings>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListing = async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", listingId)
        .single();

      if (error) {
        console.error("Error fetching listing:", error);
      } else {
        setListing(data);
      }
      setLoading(false);
    };

    fetchListing();
  }, [listingId]);

  if (loading) {
    return <div className="text-center text-2xl font-bold">Loading...</div>;
  }

  if (!listing) {
    return <div className="text-center text-2xl font-bold">Listing not found.</div>;
  }

  const {
    title,
    description,
    price,
    currency,
    featured_image,
    images,
    address,
    city,
    state,
    country,
    postal_code,
    rules,
    created_at,
  } = listing;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-6 lg:px-16">
        {/* Image Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Full Image */}
          <div className="border-4 border-black">
            <img
              src={featured_image?.url || "placeholder.jpg"}
              alt={title}
              className="w-full h-[500px] object-cover"
            />
          </div>

          {/* Right Column: Smaller Images */}
          <div className="grid grid-cols-2 gap-4">
            {images?.length > 0 ? (
              images.slice(0, 4).map((image: { url: any; }, index: React.Key | null | undefined, i) => (
                <div
                  key={index}
                  className="border-4 border-black bg-gray-100 aspect-w-1 aspect-h-1"
                >
                  <img
                    src={image.url || "placeholder.jpg"}
                    alt={`Gallery Image ${i}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center text-gray-500 font-medium">
                No additional images available.
              </div>
            )}
          </div>
        </div>

        {/* Information Section */}
        <div className="mt-12 border-t-4 border-black">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
            {/* Left: Information List */}
            <div className="lg:col-span-3 space-y-6">
              {/* Title */}
              <div className="pb-6 border-b-2 border-black">
                <h1 className="text-4xl font-bold text-black">{title}</h1>
              </div>

              {/* Description */}
              <div className="pb-6 border-b-2 border-black">
                <h2 className="text-2xl font-bold text-black">Description</h2>
                <p className="mt-2 text-gray-700">{description}</p>
              </div>

              {/* Location */}
              <div className="pb-6 border-b-2 border-black">
                <h2 className="text-2xl font-bold text-black">Location</h2>
                <p className="mt-2 text-gray-700">
                  {address}, {city}, {state}, {country} {postal_code}
                </p>
              </div>

              {/* Rules */}
              {rules && (
                <div className="pb-6 border-b-2 border-black">
                  <h2 className="text-2xl font-bold text-black">Rules</h2>
                  <p className="mt-2 text-gray-700">{rules}</p>
                </div>
              )}

              {/* Created At */}
              <div>
                <h2 className="text-2xl font-bold text-black">Listed On</h2>
                <p className="mt-2 text-gray-700">
                  {new Date(created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Right: Pricing */}
            <div className="p-6 border-4 border-black bg-white shadow-xl">
              <h2 className="text-3xl font-bold text-black">Pricing</h2>
              <div className="mt-4">
                <p className="text-4xl font-extrabold text-indigo-600">
                  {price} {currency}
                </p>
              </div>
              <button className="mt-6 w-full py-3 bg-black text-white text-lg font-bold border-2 border-black hover:bg-gray-800 transition">
                Contact Owner
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
