import React, { useEffect, useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, ArrowLeft } from 'lucide-react'
import { cn } from "@/lib/utils"
import Image from 'next/image'
import { SubscriptionPlan } from '../../../../rtk'

interface PaymentMethodProps {
    onBack: () => void;
    selectedPlan?: SubscriptionPlan | null;
    onCheckout?: () => void;
    isCheckoutLoading?: boolean;
}

interface Country {
    name: {
        common: string;
    };
    cca2: string;
}

export default function PaymentMethod({ onBack, selectedPlan, onCheckout, isCheckoutLoading = false }: PaymentMethodProps) {
    const [countries, setCountries] = useState<{ name: string; code: string; }[]>([])
    const [selectedCountry, setSelectedCountry] = useState<string>("")
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                setLoading(true)
                setError(null)

                const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2')

                if (!response.ok) {
                    throw new Error('Failed to fetch countries')
                }

                const data = await response.json()

                if (!Array.isArray(data)) {
                    throw new Error('Invalid data format received')
                }

                const formattedCountries = data
                    .map(country => ({
                        name: country.name.common,
                        code: country.cca2
                    }))
                    .sort((a, b) => a.name.localeCompare(b.name))

                setCountries(formattedCountries)
            } catch (err) {
                console.error('Error fetching countries:', err)
                setError(err instanceof Error ? err.message : 'Failed to load countries')
            } finally {
                setLoading(false)
            }
        }

        fetchCountries()
    }, [])

    return (
        <div className="w-full max-w-2xl p-6 bg-white rounded-2xl border border-[#19CA32]">
            <div className="mb-6">
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Plans
                </button>
                <h2 className="text-2xl font-semibold text-gray-900">Payment Method</h2>
            </div>

            {selectedPlan && (
                <div className="flex justify-between items-center mb-6">
                    <span className="text-base text-gray-900">{selectedPlan.name}</span>
                    <span className="text-base font-medium text-gray-900">{selectedPlan.price_formatted}/month</span>
                </div>
            )}

            <div className="bg-[#F8FAFB] border rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-6 h-6 rounded-full bg-[#00A651] flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-base text-gray-900">Credit or debit card</span>
                    <div className="flex items-center gap-4 ml-auto">
                        <Image src="/visa.svg" alt="Visa" className="h-10 border rounded-sm" width={50} height={50} />
                        <Image src="/mastercard.svg" alt="Mastercard" className="h-10 border rounded-sm" width={50} height={50} />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-sm text-gray-700">First name</Label>
                            <Input
                                id="firstName"
                                placeholder="Input first name"
                                className="h-11 rounded-lg border-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-[#00A651] focus:border-transparent"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-sm text-gray-700">Last name</Label>
                            <Input
                                id="lastName"
                                placeholder="Input last name"
                                className="h-11 rounded-lg border-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-[#00A651] focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 mb-4">
                        <Label htmlFor="cardNumber" className="text-sm text-gray-700">Card number</Label>
                        <Input
                            id="cardNumber"
                            placeholder="xxxx - xxxx - xxxx - xxxx"
                            className="h-11 rounded-lg border-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-[#00A651] focus:border-transparent"
                        />
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="w-full md:w-1/2 space-y-2">
                            <Label htmlFor="expiry" className="text-sm text-gray-700">Expiry</Label>
                            <Input
                                id="expiry"
                                placeholder="mm/yyyy"
                                className="h-11 rounded-lg border-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-[#00A651] focus:border-transparent"
                            />
                        </div>
                        <div className="w-full md:w-1/2 space-y-2">
                            <Label htmlFor="cvv" className="text-sm text-gray-700">CVV</Label>
                            <Input
                                id="cvv"
                                placeholder="xxx"
                                className="h-11 rounded-lg border-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-[#00A651] focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 mt-4">
                        <div className="w-full md:w-1/2 space-y-2">
                            <Label htmlFor="country" className="text-sm text-gray-700">Country/region</Label>
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={open}
                                        className="w-full h-11 justify-between rounded-lg border-gray-300 bg-white hover:bg-gray-50 font-normal"
                                    >
                                        {selectedCountry
                                            ? countries.find((country) => country.code === selectedCountry)?.name
                                            : "Select country"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                    <Command>
                                        <CommandInput placeholder="Search country..." className="h-9" />
                                        <CommandEmpty>No country found.</CommandEmpty>
                                        <CommandGroup className="max-h-64 overflow-auto">
                                            {loading && <CommandItem disabled>Loading countries...</CommandItem>}
                                            {error && <CommandItem disabled>{error}</CommandItem>}
                                            {!loading && !error && countries.map((country) => (
                                                <CommandItem
                                                    key={country.code}
                                                    value={country.code}
                                                    onSelect={(currentValue) => {
                                                        setSelectedCountry(currentValue === selectedCountry ? "" : currentValue)
                                                        setOpen(false)
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedCountry === country.code ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {country.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="w-full md:w-1/2 space-y-2">
                            <Label htmlFor="postCode" className="text-sm text-gray-700">Post Code</Label>
                            <Input
                                id="postCode"
                                placeholder="Post Code"
                                className="h-11 rounded-lg border-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-[#00A651] focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <Button 
                className="w-full cursor-pointer h-11 bg-[#19CA32] hover:bg-[#19ca31a5] text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onCheckout}
                disabled={isCheckoutLoading}
            >
                {isCheckoutLoading ? 'Processing...' : 'Subscribe'}
            </Button>

            <button
                className="w-full cursor-pointer mt-3 py-2 text-center text-[#00A651] hover:text-[#008C44] font-medium border rounded-lg border-[#00A651]"
                onClick={() => { }}
            >
                Update Payment Method
            </button>
        </div>
    )
}
