import Image from 'next/image';
import React from 'react'

interface GarageProfileCardProps {
    garageName?: string;
    address?: string;
    postcode?: string;
    contact?: string;
    phoneNumber?: string;
    email?: string;
    vtsNumber?: string;
    price?: string;
    avatarUrl?: string | null;
    onMoreDetails?: () => void;
    onBookMOT?: () => void;
}

interface GarageDetailsProps {
    address: string;
    postcode: string;
    contact: string;
    phoneNumber: string;
    email: string;
    vtsNumber: string;
}

interface ActionButtonsProps {
    onMoreDetails?: () => void;
    onBookMOT?: () => void;
    className?: string;
    buttonSize?: 'sm' | 'md' | 'lg';
}

interface GarageImageProps {
    className?: string;
    iconSize?: 'sm' | 'md' | 'lg';
    imageUrl?: string | null;
}

// Reusable Components
const GarageImage: React.FC<GarageImageProps> = ({ className, iconSize = 'md', imageUrl }) => {
    const [imageError, setImageError] = React.useState(false);
    const [imageLoading, setImageLoading] = React.useState(true);
    
    const iconSizes = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12'
    };

    // Validate and normalize image URL
    const isValidUrl = imageUrl && typeof imageUrl === 'string' && imageUrl.trim().length > 0;

    React.useEffect(() => {
        if (isValidUrl) {
            setImageError(false);
            setImageLoading(true);
        } else {
            setImageError(true);
            setImageLoading(false);
        }
    }, [isValidUrl]);

    if (isValidUrl && !imageError) {
        return (
            <div className={`rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden ${className} relative`}>
                {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
                    </div>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <Image
                    width={100}
                    height={100}
                    src={imageUrl.trim()}
                    alt="Garage avatar"
                    className={`w-full h-full object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                    onLoad={() => setImageLoading(false)}
                    onError={() => {
                        setImageError(true);
                        setImageLoading(false);
                    }}
                />
            </div>
        );
    }

    return (
        <div className={`border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 ${className}`}>
            <div className="text-gray-400">
                <svg className={iconSizes[iconSize]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
        </div>
    );
};

const GarageDetails: React.FC<GarageDetailsProps> = ({ address, postcode, contact, phoneNumber, email, vtsNumber }) => {
    const details = [
        { label: 'Address', value: address },
        { label: 'Postcode', value: postcode },
        { label: 'Contact', value: contact },
        { label: 'Phone', value: phoneNumber },
        { label: 'Email', value: email },
        { label: 'VTS Number', value: vtsNumber }
    ];

    return (
        <div className="space-y-2 text-sm text-gray-600">
            {details.map((detail, index) => (
                <div key={index}>
                    <span className="font-medium">{detail.label} :</span> {detail.value}
                </div>
            ))}
        </div>
    );
};

const ActionButtons: React.FC<ActionButtonsProps> = ({ onMoreDetails, onBookMOT, className, buttonSize = 'md' }) => {
    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-5 py-2.5',
        lg: 'px-6 py-3'
    };

    const baseClasses = `w-full rounded-lg font-medium transition-colors ${sizes[buttonSize]}`;

    return (
        <div className={`space-y-3 ${className}`}>
            <button
                onClick={onMoreDetails}
                className={`${baseClasses} border border-[#19CA32] cursor-pointer text-[#19CA32] hover:bg-[#19CA32]/10`}
            >
                More Details
            </button>
            {/* <button
                onClick={onBookMOT}
                className={`${baseClasses} bg-[#19CA32] cursor-pointer text-white hover:bg-[#16b82e]`}
            >
                Book My MOT
            </button> */}
        </div>
    );
};

const PriceDisplay: React.FC<{ price: string; className?: string }> = ({ price, className }) => (
    <div className={`font-bold text-green-500 ${className}`}>
        £ {price}
    </div>
);

export default function GarageProfileCard({
    garageName = "QuickFix Auto - London",
    address = "xxxxxxxxxxx",
    postcode = "xxxxxxxxxxx",
    contact = "xxxxxxxxxxx",
    phoneNumber = "xxxxxxxxxxx",
    email = "xxxxxxxxxxx",
    vtsNumber = "xxxxxxxxxxx",
    price = "00.00",
    avatarUrl = null,
    onMoreDetails,
    onBookMOT
}: GarageProfileCardProps) {

    const garageDetailsProps = { address, postcode, contact, phoneNumber, email, vtsNumber };
    const actionButtonsProps = { onMoreDetails, onBookMOT };

    return (
        <div className="bg-white rounded-lg  border border-gray-200 w-full">
            {/* Mobile Layout */}
            <div className="flex flex-col sm:hidden gap-4 p-4">
                <div className="flex items-start justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 flex-1 pr-2">
                        Garage: {garageName}
                    </h2>
                    <PriceDisplay price={price} className="text-xl" />
                </div>

                <GarageImage className="w-full h-32" iconSize="md" imageUrl={avatarUrl || undefined} />
                <GarageDetails {...garageDetailsProps} />
                <ActionButtons {...actionButtonsProps} buttonSize="lg" />
            </div>

            {/* Tablet Layout */}
            <div className="hidden sm:flex lg:hidden gap-5 p-5 min-h-[200px]">
                <div className="flex-shrink-0">
                    <GarageImage className="w-40 h-full" iconSize="lg" imageUrl={avatarUrl || undefined} />
                </div>

                <div className="flex-1 flex flex-col justify-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Garage: {garageName}
                    </h2>
                    <GarageDetails {...garageDetailsProps} />
                </div>

                <div className="flex flex-col justify-between items-end min-w-[160px]">
                    <ActionButtons {...actionButtonsProps} className="w-full" buttonSize="md" />
                    <PriceDisplay price={price} className="text-2xl mt-4" />
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:flex gap-6 p-6 min-h-[200px]">
                <div className="flex-shrink-0 relative cursor-pointer">
                    <GarageImage className="w-40 h-full" iconSize="lg" imageUrl={avatarUrl || undefined} />
                    {!avatarUrl && (
                        <h1 className='text-center text-gray-500 text-sm absolute bottom-8 font-semibold left-1/2 -translate-x-1/2 -translate-y-1/2'>Preview</h1>
                    )}
                </div>

                <div className="flex-1 flex flex-col justify-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Garage: {garageName}
                    </h2>
                    <GarageDetails {...garageDetailsProps} />
                </div>

                <div className="flex flex-col justify-between items-end min-w-[160px]">
                    <ActionButtons {...actionButtonsProps} className="w-full" buttonSize="md" />
                    <PriceDisplay price={price} className="text-2xl" />
                </div>
            </div>
        </div>
    );
}
