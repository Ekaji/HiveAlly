import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

interface ListingCardProps {
  listing: {
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
}

export default function Card ({ listing }: ListingCardProps) {

  const extractImageUrl = (imageString = '') => {
    const match = imageString.match(/\((.*?),/);
    return match ? match[1] : '';
  };

  console.log(listing )
  return (
      <Link to={`/listing/${listing.id}`}>
    <div className="border-2 border-black bg-white p-4">
      <div className="relative">
        <img
          className="w-full h-64 object-cover border-2 border-black"
          src={listing.featured_image?.url}
          alt={listing.title}
        />
        <div className="absolute inset-0 bg-black opacity-10 hover:opacity-0 transition-opacity"></div>
      
        <a href="#!">
          <div className="absolute top-4 right-4 h-12 w-12 border-2 border-black bg-yellow-400 flex items-center justify-center cursor-pointer hover:bg-black hover:text-yellow-400">
            <Heart className="text-black hover:text-yellow-400" />
          </div>
        </a>
      </div>
      <div className="mt-4">
        <a
          href="#"
          className="font-bold text-2xl text-black underline hover:no-underline"
        >
          {listing?.title || ''}
        </a>
        <p className="text-sm text-black mt-2">{listing?.description || ''}</p>
      </div>
      <div className="mt-4 flex justify-between items-center border-t-2 border-black pt-4">
        <a
          href="#"
          className="font-medium text-sm text-black flex items-center hover:underline"
        >
          <span className="ml-1">
            {listing?.city || ''}, {listing?.state || ''}
          </span>
        </a>
        <div className="font-bold text-xl text-red-500">
          {listing?.price || ''} {listing?.currency || ''}
        </div>
      </div>
    </div>
    </Link>
  );
}

