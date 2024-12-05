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

import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import getSymbolFromCurrency from 'currency-symbol-map'
import { supabase } from '../../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Calendar, Book, Mail } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"


export default function InteractiveListingDetails() {
  const [listing, setListing] = useState<Listings>();
  const [selectedImage, setSelectedImage] = useState("placeholder.jpg")
  const [isLoading, setIsLoading] = useState(false)

  const handleImageClick = (imageUrl: string) => {
    setIsLoading(true)
    setSelectedImage(imageUrl)
  }

  const handleImageLoad = () => {
    setIsLoading(false)
  }

  const { listingId } = useParams(); // Extracting listing ID from URL params
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
        setSelectedImage(data.featured_image.url)
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

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 lg:px-8">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
              {/* Left Column: Main Image and Carousel */}
              <div className="space-y-4">
                <div className="relative aspect-video overflow-hidden rounded-lg border-2 border-primary">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedImage}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="relative w-full h-full"
                    >
                      {isLoading && (
                        <Skeleton className="absolute inset-0 z-10" />
                      )}
                      <img
                          src={selectedImage}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                          onLoad={handleImageLoad}
                        />
                    </motion.div>
                  </AnimatePresence>
                </div>
                <Carousel className="w-full">
                  <CarouselContent>
                    {[listing.featured_image, ...listing.images].map((image, index) => (
                      <CarouselItem key={index} className="basis-1/4">
                        <div className="relative aspect-square overflow-hidden rounded-md">
                        <img
                          src={image.url}
                          alt={`Gallery Image ${index}`}
                          className="w-full h-full object-cover cursor-pointer transition-transform hover:scale-110"
                          onClick={() => handleImageClick(image.url)}
                        />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>

              {/* Right Column: Listing Details */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-4xl font-bold text-primary">{listing.title}</h1>
                  <div className="flex items-center mt-2 text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{listing.city}, {listing.state}, {listing.country}</span>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{listing.description}</p>
                  </CardContent>
                </Card>

                {listing.rules && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Rules</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{listing.rules}</p>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-between items-center">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Listed on {new Date(listing.created_at).toLocaleDateString()}</span>
                  </div>
                  <Badge variant="secondary" className="text-lg">
                    {getSymbolFromCurrency(listing.currency)} {listing.price} {listing.currency}
                  </Badge>
                </div>

                <Button className="w-full text-lg" size="lg">
                  <Mail className="w-5 h-5 mr-2" />
                  Contact Owner
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary" />
                <span>{listing.address}, {listing.postal_code}</span>
              </div>
              {/* <div className="flex items-center">
                <Book className="w-5 h-5 mr-2 text-primary" />
                <span>ID: {listing.id}</span>
              </div> */}
              {/* Add more details as needed */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
