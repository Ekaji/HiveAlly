import { useState } from 'react'
import { Link } from "react-router-dom";
import { Heart, MapPin, DollarSign } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Listing {
  id: string
  title: string
  description: string
  featured_image: { url: string }
  city: string
  state: string
  price: string
  currency: string
}

interface ListingCardProps {
  listing: Listing
}

export default function InteractiveListingCard({ listing }: ListingCardProps) {
  const [isLiked, setIsLiked] = useState(false)

  return (
    <Link to={`/listing/${listing.id}`} >
      <Card className="group w-full max-w-md mx-auto overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
        <CardContent className="p-0">
          <div className="relative">
            <img
              className="w-full h-64 object-cover"
              src={listing.featured_image?.url}
              alt={listing.title}
              width={400}
              height={256}
            />
            <motion.div 
              className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm border-none hover:bg-white"
                    onClick={(e: { preventDefault: () => void }) => {
                      e.preventDefault()
                      setIsLiked(!isLiked)
                    }}
                  >
                    <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isLiked ? 'Remove from favorites' : 'Add to favorites'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="p-4">
            <h2 className="font-bold text-2xl text-primary mb-2 group-hover:underline">
              {listing.title}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">{listing.description}</p>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  {listing.city}, {listing.state}
                </span>
              </div>
              <Badge variant="secondary" className="text-lg font-bold">
                <DollarSign className="h-4 w-4 mr-1" />
                {listing.price} {listing.currency}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}



