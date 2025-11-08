'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/rtk';
import {
    setSearchFilter,
    setTypeFilter,
    setApprovedFilter,
    clearFilters
} from '@/rtk';
import { useDebounce } from '@/hooks/useDebounce';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

export default function FilterSearch() {
    const dispatch = useAppDispatch();
    const { filters } = useAppSelector((state) => state.usersManagement);

    // Local state for filters
    const [searchTerm, setSearchTerm] = useState(filters.search);
    const [selectedType, setSelectedType] = useState(filters.type);
    const [selectedApproved, setSelectedApproved] = useState<string>(
        filters.approved === null ? 'all' : filters.approved.toString()
    );

    // Debounce search term
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Update Redux search filter when debounced value changes
    useEffect(() => {
        dispatch(setSearchFilter(debouncedSearchTerm));
    }, [debouncedSearchTerm, dispatch]);

    // Handle type filter change
    const handleTypeChange = (type: string) => {
        setSelectedType(type);
        dispatch(setTypeFilter(type));
    };

    // Handle approved filter change
    const handleApprovedChange = (approved: string) => {
        setSelectedApproved(approved);
        const approvedValue = approved === 'all' ? null : approved === 'true';
        dispatch(setApprovedFilter(approvedValue));
    };

    // Clear all filters
    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedType('');
        setSelectedApproved('all');
        dispatch(clearFilters());
    };

    return (
        <div className="bg-white rounded-xl px-6 py-4">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filter & Search</h3>
                <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 cursor-pointer text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 border border-gray-200"
                >
                    Clear All Filters
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Search */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Search Users
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name, email, or phone..."
                            className="pl-10 h-10 bg-gray-50/50 focus:bg-white transition-colors"
                        />
                    </div>
                </div>

                {/* Type Filter */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        User Type
                    </label>
                    <Select value={selectedType || "all"} onValueChange={(value) => handleTypeChange(value === "all" ? "" : value)}>
                        <SelectTrigger className=" bg-gray-50/50 cursor-pointer focus:bg-white transition-colors">
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem className='cursor-pointer' value="all">All Types</SelectItem>
                            <SelectItem className='cursor-pointer' value="DRIVER">Driver</SelectItem>
                            <SelectItem className='cursor-pointer' value="GARAGE">Garage</SelectItem>
                            <SelectItem className='cursor-pointer' value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Status Filter */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Status
                    </label>
                    <Select value={selectedApproved} onValueChange={handleApprovedChange}>
                        <SelectTrigger className=" bg-gray-50/50 cursor-pointer focus:bg-white transition-colors">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem className='cursor-pointer' value="all">All Status</SelectItem>
                            <SelectItem className='cursor-pointer' value="true">Unban</SelectItem>
                            <SelectItem className='cursor-pointer' value="false">Ban</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
