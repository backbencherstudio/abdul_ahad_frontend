import React from 'react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LuImagePlus } from "react-icons/lu";
import { ImageDownIcon } from "lucide-react";
import Image from 'next/image';

interface ProfileImageUploadProps {
    profileImage: string;
    onImageClick: () => void;
    onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    onImageError: () => void;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
    profileImage,
    onImageClick,
    onImageChange,
    fileInputRef,
    onImageError
}) => (
    <div className="flex items-center space-x-4 mb-6">
        <div className="relative">
            <Avatar className="h-24 w-24 cursor-pointer" onClick={onImageClick}>
                {
                    profileImage ? (
                        <Image
                            src={profileImage}
                            alt="Profile"
                            width={500}
                            height={500}
                            onError={onImageError}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <AvatarFallback className="bg-gray-200 border-2 border-gray-300">
                            <ImageDownIcon className="h-8 w-8 text-gray-400" />
                        </AvatarFallback>
                    )
                }
            </Avatar>
            {/* Upload icon overlay */}
            <button
                type="button"
                onClick={onImageClick}
                className="absolute -bottom-1 right-1 cursor-pointer hover:bg-green-600 transition-all duration-300 bg-green-500 rounded-full p-1 border-2 border-white shadow"
                style={{ zIndex: 10 }}
                tabIndex={-1}
            >
                <LuImagePlus className="h-5 w-5 text-white" />
            </button>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onImageChange}
                className="hidden"
            />
        </div>
        <div>
            <h3 className="text-base sm:text-lg font-medium">Profile Picture</h3>
            <p className="text-xs sm:text-sm text-gray-500">Click to upload a new image</p>
        </div>
    </div>
);

export default ProfileImageUpload;
