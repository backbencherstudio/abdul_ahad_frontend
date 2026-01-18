"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Package,
  ShoppingCart,
  FileText,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import {
  TCreateSubscription,
  useCreateASubscriptionMutation,
  useGetAllSubscriptionsQuery,
} from "@/rtk/api/admin/subscriptions-management/subscriptionManagementAPI";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function SubscriptionsManagement() {
  const router = useRouter();

  // Fetch all subscriptions without pagination (using a high limit)
  const allSubscriptions = useGetAllSubscriptionsQuery({
    page: 1,
    limit: 1000, // High limit to get all subscriptions
  });

  const handleViewDetails = (id: string) => {
    router.push(`/admin/subscriptions-management/${id}`);
  };

  // Format price from pence to pounds
  const formatPrice = (pence: number) => {
    return `£${(pence / 100).toFixed(2)}`;
  };

  // Get features list for a subscription
  const getFeatures = (subscription: any) => {
    const features = [
      {
        icon: Package,
        text: "Unlimited opportunity to receive MOT bookings — 24/7",
      },
      {
        icon: ShoppingCart,
        text: "Boost Your Garage's Visibility.",
      },
      {
        icon: FileText,
        text: "Opportunity to upsell and offer extra services!",
      },
      {
        icon: TrendingUp,
        text: "No Contract. No commission.",
      },
      {
        icon: Package,
        text: "Simple set up.",
      },
    ];

    return features;
  };

  const [createSubscription, { isLoading }] = useCreateASubscriptionMutation();
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, reset } = useForm<TCreateSubscription>();

  const onSubmit = async (data: TCreateSubscription) => {
    try {
      const payload = {
        name: "One Simple Plan",
        description: "One Simple Plan",
        price_pence: Number(data.price_pence),
        max_bookings_per_month: 1000,
        max_vehicles: 1000,
      };

      const res = await createSubscription(payload).unwrap();
      toast.success("Subscription created successfully!");

      reset();
      setOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create subscription.");
    }
  };

  return (
    <>
      {allSubscriptions?.data?.data?.length === 0 && (
        <div className="mb-6 flex justify-between">
          <h1 className="text-2xl font-semibold">List of All Subscriptions</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="justify-start bg-white hover:bg-white text-black cursor-pointer"
              >
                <Plus className="mr-1" /> Add Subscription
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleSubmit(onSubmit)}>
                <DialogHeader>
                  <DialogTitle>Add Subscription</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 mt-6">
                  {/* <div className="grid gap-3">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    {...register("name", { required: true })}
                    placeholder="Subscription name"
                  />
                </div> */}

                  <div className="grid gap-3">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price_pence"
                      type="number"
                      {...register("price_pence", { required: true, min: 0 })}
                      placeholder="Subscription price (£)"
                    />
                  </div>

                  {/* <div className="grid gap-3">
                  <Label htmlFor="max_bookings_per_month">
                    Max bookings per month
                  </Label>
                  <Input
                    id="max_bookings_per_month"
                    type="number"
                    {...register("max_bookings_per_month", {
                      required: true,
                      min: 1,
                    })}
                    placeholder="Max bookings"
                  />
                </div> */}

                  {/* <div className="grid gap-3">
                  <Label htmlFor="max_vehicles">Max Vehicles</Label>
                  <Input
                    id="max_vehicles"
                    type="number"
                    {...register("max_vehicles", { required: true, min: 1 })}
                    placeholder="Max vehicles"
                  />
                </div> */}

                  {/* <div className="grid gap-3">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Description"
                  />
                </div> */}
                </div>

                <DialogFooter className="mt-4">
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="bg-red-800 hover:bg-red-700 cursor-pointer text-white hover:text-white"
                    >
                      Cancel
                    </Button>
                  </DialogClose>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-green-600 cursor-pointer hover:bg-green-500"
                  >
                    {isLoading ? "Creating..." : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Subscription Cards Grid */}
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)] py-8">
        {allSubscriptions.isLoading ? (
          <div className="w-full max-w-md">
            {/* Shimmer Skeleton Card */}
            <div className="bg-white rounded-lg border-2 border-green-200 p-6 shadow-sm animate-pulse">
              {/* Title Skeleton */}
              <Skeleton className="h-8 w-3/4 mb-2" />

              {/* Description Skeleton */}
              <Skeleton className="h-4 w-full mb-6" />
              <Skeleton className="h-4 w-5/6 mb-6" />

              {/* Membership Section Skeleton */}
              <div className="mb-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <div className="flex items-baseline gap-2 mb-1">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-3 w-full" />
              </div>

              {/* Button Skeleton */}
              <Skeleton className="h-10 w-full mb-6 rounded-md" />

              {/* Features Section Skeleton */}
              <div>
                <Skeleton className="h-4 w-20 mb-3" />
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Skeleton className="h-5 w-5 rounded mt-0.5" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Badge Skeleton */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          </div>
        ) : allSubscriptions?.data?.data?.length === 0 ? (
          <div className="text-center text-gray-500">
            No subscriptions found. Create your first subscription!
          </div>
        ) : (
          <div className="w-full max-w-md">
            {allSubscriptions?.data?.data?.map((subscription: any) => {
              const features = getFeatures(subscription);
              const price = formatPrice(subscription.price_pence);

              return (
                <div
                  key={subscription.id}
                  className="bg-white rounded-lg border-2 border-green-200 p-6 shadow-sm hover:shadow-md transition-shadow w-full"
                >
                  {/* Title */}
                  <h2 className="text-2xl font-bold text-black mb-2">
                    {/* {subscription.name} */}
                    One Simple Plan
                  </h2>

                  {/* Description */}
                  {/* {subscription.description && (
                    <p className="text-sm text-gray-700 mb-6">
                      {subscription.description}
                    </p>
                  )} */}
                  <p className="text-sm text-gray-700 mb-6">
                    We believe in fairness and transparency - no hidden fees, no
                    contracts, no commissions, and no confusing tiers. Just full
                    access for one simple price.
                  </p>

                  {/* Membership Section */}
                  <div className="mb-6">
                    <div className="text-sm font-semibold text-black mb-2">
                      Membership
                    </div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-4xl font-bold text-black">
                        {subscription.price_formatted || price.split(".")[0]}
                      </span>
                      <span className="text-lg text-black">/month</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {subscription.price_formatted || price} billed
                      automatically every month on the sign-up date (unless
                      cancelled)
                    </p>
                  </div>

                  {/* Details Button */}
                  <Button
                    onClick={() => handleViewDetails(subscription.id)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md mb-6 cursor-pointer"
                  >
                    Details
                  </Button>

                  {/* Features Section */}
                  <div>
                    <div className="text-sm font-semibold text-black mb-3">
                      Features
                    </div>
                    <div className="space-y-3">
                      {features.map((feature, index) => {
                        const IconComponent = feature.icon;
                        return (
                          <div key={index} className="flex items-start gap-3">
                            <IconComponent className="h-5 w-5 text-black mt-0.5 flex-shrink-0 stroke-1" />
                            <span className="text-sm text-black">
                              {feature.text}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <span
                      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium ${
                        subscription.is_active
                          ? "bg-green-100 text-green-800 border border-green-300"
                          : "bg-red-100 text-red-800 border border-red-300"
                      }`}
                    >
                      {subscription.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
