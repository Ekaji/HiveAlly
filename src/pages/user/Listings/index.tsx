import { lazy, Suspense, useState } from 'react';
import { Plus } from 'lucide-react';
import ListingsPopup from '../../../components/ListingsPopup';
import EditListingsPopup from '../../../components/EditListingPopup';
import { CustomButton } from '../../../components/Buttons';

const MyListings = lazy(() => import('../../../components/Listings'));

export default function Listings() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);

  const handleOpenPopup = () => {
      setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
      setIsPopupOpen(false);
  };

  const handleOpenEditPopup = () => {
    setIsEditPopupOpen(true);
};

const handleCloseEditPopup = () => {
    setIsEditPopupOpen(false);
};

  return (
    <Suspense fallback={'Loading...'}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Your Listings</h1>
          <CustomButton onClick={handleOpenPopup} label={'New Listing'} icon={Plus} />
          {/* <div
            // to="/listings/new"
            onClick={handleOpenPopup}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Listing
          </div> */}
        </div>
        <ListingsPopup isOpen={isPopupOpen} onClose={handleClosePopup} />
        <EditListingsPopup isOpen={isEditPopupOpen} onClose={handleCloseEditPopup}  />
        <MyListings  onOpen={handleOpenEditPopup}  />
    </div>
    </Suspense>
  );
}