import React, { Dispatch, SetStateAction, useState } from 'react';
import '@geoapify/geocoder-autocomplete/styles/minimal.css';
import {
  GeoapifyGeocoderAutocomplete,
  GeoapifyContext,
} from '@geoapify/react-geocoder-autocomplete';

interface LocationDetails {
  formattedAddress: string;
  country: string;
  city: string;
  state: string;
}

interface LocationInputProps {
  setCurrentLocation: Dispatch<SetStateAction<string>>;
  isEditing: boolean; 
  currentLocation: string;
}

export const LocationInput: React.FC<LocationInputProps> = ( {setCurrentLocation, currentLocation, isEditing}: any) => {
  const [locationDetails, setLocationDetails] = useState<LocationDetails>({
    formattedAddress: '',
    country: '',
    city: '',
    state: ''
  });

  setCurrentLocation(locationDetails)

  const onPlaceSelect = (result: any) => {
    if (result && result.properties) {
      const addressComponents = result.properties;
      
      setLocationDetails({
        formattedAddress: addressComponents.formatted || '',
        country: addressComponents.country || '',
        city: addressComponents.city || addressComponents.county || '',
        state: addressComponents.state || ''
      });

      console.log('Full Location Details:', {
        formattedAddress: addressComponents.formatted,
        country: addressComponents.country,
        city: addressComponents.city || addressComponents.county,
        state: addressComponents.state
      });
    }
  };

  const onSuggestionChange = (value: string) => {
    console.log('Current suggestion:', value);
  };

  const geoapify_api_key = import.meta.env.VITE_GEOAPIFY_API_KEY

  console.log(geoapify_api_key, isEditing)

  return (
    <GeoapifyContext apiKey={geoapify_api_key} >
      <div className={`w-full px-3 py-2 bg-white 
                ${isEditing 
                  ? 'border-4 border-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black' 
                  : 'border-0'
                }`}>
        <GeoapifyGeocoderAutocomplete
          placeholder={currentLocation ? currentLocation.toString(): "Enter location (e.g., Lagos, Nigeria)"}
          placeSelect={onPlaceSelect}
          suggestionsChange={onSuggestionChange}
        />
      </div>
    </GeoapifyContext>
  );
};