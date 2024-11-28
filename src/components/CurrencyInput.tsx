import React, { useState } from 'react';
import currencyData from '../data/currencies-with-flags.json';

interface Currency {
    code: string;
    name: string;
    country: string;
    countryCode: string;
    flag?: string;
}

interface CurrencyInputProps {
    price: string;
    currencyCode: string;
    onPriceChange: (price: string) => void;
    onCurrencyChange: (currencyCode: string) => void;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({ price, currencyCode, onPriceChange, onCurrencyChange }) => {
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const handleCurrencySelect = (code: string) => {
        onCurrencyChange(code);
        setDropdownOpen(false);
    };

    const selectedCurrency = currencyData.find(currency => currency.code === currencyCode);

    // Filter currencies based on search term
    const filteredCurrencies = currencyData.filter(currency =>
        currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        currency.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full max-w-sm ">
        <div className="flex items-center border-4 border-black">
            {/* Input Field */}
            <input
                type="number"
                required
                min="0"
                value={price}
                onChange={(e) => onPriceChange(e.target.value)}
                className="flex-1 w-full min-w-[80px] max-w-[250px] px-3 py-2 text-lg font-bold text-black bg-white placeholder-gray-700 focus:outline-none focus:bg-yellow-300"
                placeholder="Enter amount"
            />
    
            {/* Currency Info */}
            <div
                className="flex items-center px-3 py-2 cursor-pointer space-x-2 border-l-4 border-black bg-white hover:bg-yellow-300 transition-colors"
                onClick={() => setDropdownOpen(!isDropdownOpen)}
            >
                {selectedCurrency?.flag && (
                    <div className="w-6 h-6 border-2 border-black">
                        <img
                            src={selectedCurrency.flag}
                            alt={`${selectedCurrency.name} flag`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
                <span className="text-lg font-bold text-black">
                    {selectedCurrency?.code || currencyCode}
                </span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 text-black stroke-current stroke-2"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>
    
        {/* Dropdown */}
        {isDropdownOpen && (
            <div className="absolute z-10 left-0 right-0 mt-2 bg-white border-4 border-black shadow-none max-h-60 overflow-y-auto">
                {/* Search Input */}
                <div className="p-2">
                    <input
                        type="text"
                        placeholder="Search currency..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border-4 border-black text-lg font-bold text-black focus:outline-none focus:bg-yellow-300"
                    />
                </div>
                {/* Filtered Currency List */}
                {filteredCurrencies.length > 0 ? (
                    filteredCurrencies.map(currency => (
                        <div
                            key={currency.code}
                            onClick={() => handleCurrencySelect(currency.code)}
                            className="flex items-center px-3 py-2 border-t-4 border-black hover:bg-yellow-300 cursor-pointer transition-colors"
                        >
                            <div className="w-6 h-6 border-2 border-black mr-2">
                                <img 
                                    src={currency.flag} 
                                    alt={currency.name} 
                                    className="w-full h-full object-cover" 
                                />
                            </div>
                            <span className="text-lg font-bold text-black">
                                {currency.name} ({currency.code})
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="p-3 text-lg font-bold text-black text-center border-t-4 border-black">
                        No results found
                    </div>
                )}
            </div>
        )}
    </div>
    );
};

export default CurrencyInput;
