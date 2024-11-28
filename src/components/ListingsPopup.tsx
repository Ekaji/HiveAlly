import { supabase } from '../lib/supabase'; // Ensure you have your Supabase client configured
import React, { useEffect, useState } from 'react';
import CurrencyInput from './CurrencyInput';
import { useImageUpload } from '../hooks/useImageUpload';
import { toast } from 'sonner';

interface Subcategory {
    id: number;
    name: string;
    description: string;
}

interface Category {
    id: number;
    name: string;
}

interface Amenities {
    id: number;
    name: string;
    description: string;
    checked: boolean;
}

interface FormData {
    minStayDuration: number;
    maxStayDuration: number | null;
    stayDurationType: 'night' | 'day' | 'week' | 'month' | 'custom';
    title: string;
    description: string;
    // selectedSubcategoryId: number | null;
    price: string;
    featuredImage: File;
    additionalImages: File[];
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    rules: string;
    amenities: string[];
    currencyCode: string;
    // currency: string;
}

interface ListingsPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

const ListingsPopup: React.FC<ListingsPopupProps> = ({ isOpen, onClose }) => {
    const { uploadImage: uploadListingImage } = useImageUpload('listing_img');
    const [amenities, setAmenities] = useState<Amenities[]>([]);
    // const [selectedAmenities, setSelectedAmenities] = useState<Number[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number | null>(null);
    const [formData, setFormData] = useState<FormData>({
        title: '',
        description: '',
        price: '',
        featuredImage: {
            lastModified: 0,
            name: '',
            webkitRelativePath: '',
            size: 0,
            type: '',
            arrayBuffer: function (): Promise<ArrayBuffer> {
                throw new Error('Function not implemented.');
            },
            bytes: function (): Promise<Uint8Array> {
                throw new Error('Function not implemented.');
            },
            slice: function (_start?: number, _end?: number, _contentType?: string): Blob {
                throw new Error('Function not implemented.');
            },
            stream: function (): ReadableStream<Uint8Array> {
                throw new Error('Function not implemented.');
            },
            text: function (): Promise<string> {
                throw new Error('Function not implemented.');
            }
        },
        minStayDuration: 1,
        maxStayDuration: null,
        stayDurationType: 'custom',
        additionalImages: [],
        address: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        rules: '',
        amenities: [],
        // currency: '',
        currencyCode: 'USD', 
    });

      const handleCheckedStateChange = (item_id: number, isChecked: boolean) => {
        setAmenities((prevAmenities) => {
            return prevAmenities.map((amenity) => {
                if (amenity.id === item_id) {
                    // Toggle the checked state
                    return { ...amenity, checked: !isChecked };
                }
                return amenity; // Return the unmodified amenity
            });
        });
      };

    useEffect(() => {
        const fetchCategories = async () => {
            const { data, error } = await supabase.from('categories').select();
            if (!error) setCategories(data || []);
        };

        const fetchAmenities = async () => {
            const { data, error } = await supabase.from('amenities').select();
            if (!error) {
                setAmenities(() => {
                    return data.map(item => {
                        return { ...item, checked: false };
                    }) || [];
                });
            }
        };

        fetchCategories();
        fetchAmenities();
    }, [selectedCategoryId]);


    useEffect(() => {
        const fetchSubcategories = async () => {
            if (selectedCategoryId) {
                const { data, error } = await supabase
                    .from('subcategories')
                    .select()
                    .eq('category_id', selectedCategoryId);
                    console.log(data || [])
                if (!error) setSubcategories(data || []);
            }
        };

        fetchSubcategories();
    }, [selectedCategoryId]);

    
const uploadImages = async (featuredImage: File, additionalImages?: File[]) => {
    console.log({featuredImage, additionalImages})
    try {
        const featuredImageMetadata = await uploadListingImage(featuredImage);

        let additionalImagesMetadata: { url: string; width: number; height: number; size: number; format: string; }[] = [];
        if (additionalImages && additionalImages.length > 0) {
            const uploadPromises = additionalImages.map(async (image) => {
                return await uploadListingImage(image); // Use the same upload function
            });
            additionalImagesMetadata = await Promise.all(uploadPromises);
        }

        return {
            featuredImageMetadata,
            additionalImagesMetadata
        };
    } catch (error) {
        console.error('Image upload error:', error);
        throw new Error('Failed to upload images');
    }
};

// Main submit handler
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Create an array of IDs for checked amenities
    const updatedSelectedAmenityIds = amenities
        .filter((amenity) => amenity.checked)
        .map((amenity) => amenity.id);

    const {
        additionalImages,
        address,
        city,
        country,
        description,
        featuredImage,
        postalCode,
        price,
        rules,
        state,
        title,
        currencyCode
    } = formData;

    try {
        // Authenticate user
        const { 
            data: userData, 
            // error: userError 
        } = await supabase.auth.getUser();
        const userId = userData?.user?.id;

        // Upload images
        const { 
            featuredImageMetadata, 
            additionalImagesMetadata 
        } = await uploadImages(featuredImage as File, additionalImages);

        // Insert listing
        const { data, error } = await supabase
            .from('listings')
            .insert([
                {
                    user_id: userId,
                    title,
                    description,
                    category_id: selectedCategoryId,
                    subcategory_id: selectedSubCategoryId,
                    price: Number(price),
                    featured_image: featuredImageMetadata,
                    images: additionalImagesMetadata,
                    address,
                    city,
                    state,
                    country,
                    currency: currencyCode,
                    postal_code: postalCode,
                    rules,
                },
            ])
            .select();

        // Handle listing insertion errors
        if (error) {
            throw new Error(error.message);
        }

        const newListingId = data[0]?.id;
        
        // Insert amenities
        if (updatedSelectedAmenityIds.length > 0) {
            const { error: amenitiesError } = await supabase.rpc('insert_listing_amenities', {
                p_listing_id: newListingId,
                amenity_ids: updatedSelectedAmenityIds,
            });

            if (amenitiesError) {
                throw new Error(amenitiesError.message);
            }
            
            toast.success('Successfully added amenities to listing');
        }

        // Success handling
        toast.success('Listing created successfully');
        onClose();

    } catch (err) {
        // General error handling
        toast.error('An error occurred while creating the listing');
        console.error('Error creating listing:', err);
    }
};
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setFormData({ ...formData, additionalImages: files });
    };

    const handlePriceChange = (price: string) => {
        setFormData({ ...formData, price });
    };

    const handleCurrencyChange = (currencyCode: string) => {
        setFormData({ ...formData, currencyCode });
    };

    return (
        isOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white border-4 border-black w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white p-4 border-b-4 border-black flex justify-between items-center">
                        <h2 className="text-4xl font-extrabold text-black">Create New Listing</h2>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-yellow-300 transition-colors"
                        >
                            <span className="text-2xl font-bold text-black">×</span>
                        </button>
                    </div>
    
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Existing fields... */}

                       <div className="space-y-2">
                          <label className="block text-xl font-bold text-black">Title</label>
                           <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-3 py-2 border-4 border-black text-black focus:outline-none focus:bg-yellow-300"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xl font-bold text-black">Description</label>
                            <textarea
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 border-4 border-black text-black focus:outline-none focus:bg-yellow-300 h-32"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xl font-bold text-black">Category</label>
                            <select 
                                onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                                className="w-full px-3 py-2 border-4 border-black text-black focus:outline-none focus:bg-yellow-300"
                            >
                                <option value="">Select a category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xl font-bold text-black">Sub category</label>
                            <select 
                                onChange={(e) => setSelectedSubCategoryId(Number(e.target.value))}
                                className="w-full px-3 py-2 border-4 border-black text-black focus:outline-none focus:bg-yellow-300"
                            >
                                <option value="">{ selectedCategoryId !== null ? 'Select a sub category': 'First select a category' }</option>
                                {subcategories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name} - {cat.description}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-xl font-bold text-black">Price</label>
                                    <CurrencyInput
                                        price={formData.price}
                                        currencyCode={formData.currencyCode}
                                        onPriceChange={handlePriceChange}
                                        onCurrencyChange={handleCurrencyChange}
                                    />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xl font-bold text-black">Featured Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFormData({ ...formData, featuredImage: e.target.files ? e.target.files[0] : null })}
                                    className="w-full px-3 py-2 border-4 border-black text-black focus:outline-none focus:bg-yellow-300"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xl font-bold text-black">Additional Images</label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                className="w-full px-3 py-2 border-4 border-black text-black focus:outline-none focus:bg-yellow-300"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="block text-xl font-bold text-black">Location Details</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-3 py-2 border-4 border-black text-black focus:outline-none focus:bg-yellow-300"
                                />
                                <input
                                    type="text"
                                    placeholder="City"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full px-3 py-2 border-4 border-black text-black focus:outline-none focus:bg-yellow-300"
                                />
                                <input
                                    type="text"
                                    placeholder="State"
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    className="w-full px-3 py-2 border-4 border-black text-black focus:outline-none focus:bg-yellow-300"
                                />
                                <input
                                    type="text"
                                    placeholder="Country"
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    className="w-full px-3 py-2 border-4 border-black text-black focus:outline-none focus:bg-yellow-300"
                                />
                                <input
                                    type="text"
                                    placeholder="Postal Code"
                                    value={formData.postalCode}
                                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                    className="w-full px-3 py-2 border-4 border-black text-black focus:outline-none focus:bg-yellow-300"
                                />
                            </div>
                        </div>


                        <div className="space-y-4">
                            <label className="block text-xl font-bold text-black">Amenities</label>
                            <div className="flex flex-wrap gap-4">
                                {amenities.map((a) => (
                                    <label 
                                        key={a.id}
                                        htmlFor={`custom-checkbox-${a.id}`} 
                                        className="flex items-center cursor-pointer  px-3 py-2 bg-white hover:bg-yellow-300 transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            id={`custom-checkbox-${a.id}`}
                                            name={a.name}
                                            value={a.name}
                                            checked={a.checked}
                                            onChange={() => handleCheckedStateChange(a.id, a.checked)}
                                            className="mr-2 appearance-none w-5 h-5 border-4 border-black bg-white checked:bg-black"
                                        />
                                        <span className="text-lg font-bold text-black">{a.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>


                        <div className="space-y-2">
                            <label className="block text-xl font-bold text-black">Rules</label>
                            <textarea
                                value={formData.rules}
                                onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                                className="w-full px-3 py-2 border-4 border-black text-black focus:outline-none focus:bg-yellow-300 h-32"
                            />
                        </div>

                        {/* <div className="pt-4">
                            <button 
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Submit Listing
                            </button>
                        </div> */}
    
                        {/* New Duration of Stay Section */}
                        <div className="space-y-4">
                            <label className="block text-xl font-bold text-black">Duration of Stay</label>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-black">Minimum Stay Duration</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.minStayDuration}
                                        onChange={(e) => setFormData({ 
                                            ...formData, 
                                            minStayDuration: Number(e.target.value) 
                                        })}
                                        className="w-full px-3 py-2 border-4 border-black text-black focus:outline-none focus:bg-yellow-300"
                                    />
                                </div>
    
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-black">Maximum Stay Duration (Optional)</label>
                                    <input
                                        type="number"
                                        value={formData.maxStayDuration || ''}
                                        onChange={(e) => setFormData({ 
                                            ...formData, 
                                            maxStayDuration: e.target.value ? Number(e.target.value) : null 
                                        })}
                                        className="w-full px-3 py-2 border-4 border-black text-black focus:outline-none focus:bg-yellow-300"
                                    />
                                </div>
                            </div>
    
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-black">Stay Duration Type</label>
                                <select 
                                    value={formData.stayDurationType}
                                    onChange={(e) => setFormData({ 
                                        ...formData, 
                                        stayDurationType: e.target.value 
                                    })}
                                    className="w-full px-3 py-2 border-4 border-black text-black focus:outline-none focus:bg-yellow-300"
                                >
                                    <option value="night">Night</option>
                                    <option value="day">Day</option>
                                    <option value="week">Week</option>
                                    <option value="month">Month</option>
                                    <option value="custom">Custom</option>
                                </select>
                            </div>
                        </div>
    
                        <div className="pt-4">
                            <button 
                                type="submit"
                                className="w-full bg-yellow-300 text-black border-4 border-black py-3 text-lg font-bold hover:bg-black hover:text-yellow-300 transition-colors"
                            >
                                Submit Listing
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    );

    // return (
    //     isOpen && (
    //         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    //             <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
    //                 <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
    //                     <h2 className="text-2xl font-bold text-gray-800">Create New Listing</h2>
    //                     <button 
    //                         onClick={onClose}
    //                         className="p-2 hover:bg-gray-100 rounded-full transition-colors"
    //                     >
    //                         <span className="text-gray-500 text-xl">×</span>
    //                     </button>
    //                 </div>

    //                 <form onSubmit={handleSubmit} className="p-6 space-y-6">
    //                     <div className="space-y-2">
    //                         <label className="block text-xl font-bold text-black">Title</label>
    //                         <input
    //                             type="text"
    //                             required
    //                             value={formData.title}
    //                             onChange={(e) => setFormData({ ...formData, title: e.target.value })}
    //                             className="w-full px-3 py-2 border-4 border-black text-black focus:outline-none focus:bg-yellow-300"
    //                         />
    //                     </div>

    //                     <div className="space-y-2">
    //                         <label className="block text-xl font-bold text-black">Description</label>
    //                         <textarea
    //                             required
    //                             value={formData.description}
    //                             onChange={(e) => setFormData({ ...formData, description: e.target.value })}
    //                             className="w-full px-3 py-2 border-4 border-black text-black focus:outline-none focus:bg-yellow-300 h-32"
    //                         />
    //                     </div>

    //                     <div className="space-y-2">
    //                         <label className="block text-xl font-bold text-black">Category</label>
    //                         <select 
    //                             onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
    //                             className="w-full px-3 py-2 border-4 border-black text-black focus:outline-none focus:bg-yellow-300"
    //                         >
    //                             <option value="">Select a category</option>
    //                             {categories.map((cat) => (
    //                                 <option key={cat.id} value={cat.id}>{cat.name}</option>
    //                             ))}
    //                         </select>
    //                     </div>

    //                     <div className="space-y-2">
    //                         <label className="block text-xl font-bold text-black">Sub category</label>
    //                         <select 
    //                             onChange={(e) => setSelectedSubCategoryId(Number(e.target.value))}
    //                             className="w-full px-3 py-2 border-4 border-black text-black focus:outline-none focus:bg-yellow-300"
    //                         >
    //                             <option value="">{ selectedCategoryId !== null ? 'Select a sub category': 'First select a category' }</option>
    //                             {subcategories.map((cat) => (
    //                                 <option key={cat.id} value={cat.id}>{cat.name} - {cat.description}</option>
    //                             ))}
    //                         </select>
    //                     </div>

    //                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    //                         <div className="space-y-2">
    //                             <label className="block text-xl font-bold text-black">Price</label>
    //                                 <CurrencyInput
    //                                     price={formData.price}
    //                                     currencyCode={formData.currencyCode}
    //                                     onPriceChange={handlePriceChange}
    //                                     onCurrencyChange={handleCurrencyChange}
    //                                 />
    //                         </div>

    //                         <div className="space-y-2">
    //                             <label className="block text-xl font-bold text-black">Featured Image</label>
    //                             <input
    //                                 type="file"
    //                                 accept="image/*"
    //                                 onChange={(e) => setFormData({ ...formData, featuredImage: e.target.files ? e.target.files[0] : null })}
    //                                 className="w-full px-3 py-2 border-4 border-black text-black focus:outline-none focus:bg-yellow-300"
    //                             />
    //                         </div>
    //                     </div>

    //                     <div className="space-y-2">
    //                         <label className="block text-xl font-bold text-black">Additional Images</label>
    //                         <input
    //                             type="file"
    //                             accept="image/*"
    //                             multiple
    //                             onChange={handleImageChange}
    //                             className="w-full px-3 py-2 border-4 border-black text-black focus:outline-none focus:bg-yellow-300"
    //                         />
    //                     </div>

    //                     <div className="space-y-4">
    //                         <label className="block text-xl font-bold text-black">Location Details</label>
    //                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    //                             <input
    //                                 type="text"
    //                                 placeholder="Address"
    //                                 value={formData.address}
    //                                 onChange={(e) => setFormData({ ...formData, address: e.target.value })}
    //                                 className="w-full px-3 py-2 border-4 border-black text-black focus:outline-none focus:bg-yellow-300"
    //                             />
    //                             <input
    //                                 type="text"
    //                                 placeholder="City"
    //                                 value={formData.city}
    //                                 onChange={(e) => setFormData({ ...formData, city: e.target.value })}
    //                                 className="w-full px-3 py-2 border-4 border-black text-black focus:outline-none focus:bg-yellow-300"
    //                             />
    //                             <input
    //                                 type="text"
    //                                 placeholder="State"
    //                                 value={formData.state}
    //                                 onChange={(e) => setFormData({ ...formData, state: e.target.value })}
    //                                 className="w-full px-3 py-2 border-4 border-black text-black focus:outline-none focus:bg-yellow-300"
    //                             />
    //                             <input
    //                                 type="text"
    //                                 placeholder="Country"
    //                                 value={formData.country}
    //                                 onChange={(e) => setFormData({ ...formData, country: e.target.value })}
    //                                 className="w-full px-3 py-2 border-4 border-black text-black focus:outline-none focus:bg-yellow-300"
    //                             />
    //                             <input
    //                                 type="text"
    //                                 placeholder="Postal Code"
    //                                 value={formData.postalCode}
    //                                 onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
    //                                 className="w-full px-3 py-2 border-4 border-black text-black focus:outline-none focus:bg-yellow-300"
    //                             />
    //                         </div>
    //                     </div>


    //                     <div className="space-y-2">
    //                         <label className="block text-xl font-bold text-black">Amenities</label>
    //                             { amenities.map((a) => (
    //                                 <label className="cursor-pointer ml-1 mr-4 whitespace-nowrap text-slate-600 text-sm" htmlFor={`custom-checkbox-${a.id}`} >
    //                                     <input
    //                                         type="checkbox"
    //                                         id={`custom-checkbox-${a.id}`}
    //                                         name={a.name}
    //                                         value={a.name}
    //                                         checked={a.checked}
    //                                         onChange={() => handleCheckedStateChange(a.id, a.checked)}
    //                                         className='whitespace-nowrap ml-1 mr-1'
    //                                      />
    //                                         {a.name}
    //                                     </label>
    //                             ))}
    //                     </div>

    //                     <div className="space-y-2">
    //                         <label className="block text-xl font-bold text-black">Rules</label>
    //                         <textarea
    //                             value={formData.rules}
    //                             onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
    //                             className="w-full px-3 py-2 border-4 border-black text-black focus:outline-none focus:bg-yellow-300 h-32"
    //                         />
    //                     </div>

    //                     <div className="pt-4">
    //                         <button 
    //                             type="submit"
    //                             className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    //                         >
    //                             Submit Listing
    //                         </button>
    //                     </div>
    //                 </form>
    //             </div>
    //         </div>
    //     )
    // );
};

export default ListingsPopup;