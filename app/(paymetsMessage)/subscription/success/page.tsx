"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import axiosClient from "@/helper/axisoClients";
export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = useMemo(() => searchParams.get("session_id"), [searchParams]);
  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any | null>(null);
  const [apiMessage, setApiMessage] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!sessionId) {
        setErrorMessage("Missing session_id in URL.");
        setIsVerifying(false);
        return;
      }
      try {
        const res = await axiosClient.get(`/api/garage-dashboard/subscription/success`, {
          params: { session_id: sessionId },
        });
        const payload = res?.data;
        if (payload?.success) {
          setSubscription(payload?.data?.subscription || null);
          setApiMessage(payload?.message || null);
        } else {
          setErrorMessage(payload?.message || "Unable to verify subscription.");
        }
      } catch (e: any) {
        const msg = e?.response?.data?.message || e?.message || 'Verification failed.';
        setErrorMessage(typeof msg === 'string' ? msg : JSON.stringify(msg));
      } finally {
        setIsVerifying(false);
      }
    };
    run();
  }, [sessionId]);

  const lottieSrc = (() => {
    const status = subscription?.status;
    if (status === 'CANCELLED') {
      return "https://lottie.host/02e17ed2-86fd-4584-ad97-205457f21aab/o4mfWhRrYm.lottie"; // red/cancel
    }
    if (status === 'PAST_DUE' || status === 'SUSPENDED') {
      return "https://lottie.host/3a9e9b2f-3b64-45b5-93b5-1b1b0f6c1d9f/alert-warning.lottie"; // amber/warning
    }
    return "https://lottie.host/584a6454-5877-4549-94f5-4e31ef3c5020/S0E9jP05xq.lottie"; // green/success (ACTIVE default)
  })();

  const statusLabel = (subscription?.status || 'ACTIVE').replaceAll('_', ' ');
  const isCancelled = subscription?.status === 'CANCELLED';
  const isWarning = subscription?.status === 'PAST_DUE' || subscription?.status === 'SUSPENDED';
  const accentBar = isCancelled ? 'from-red-400 via-red-500 to-rose-500' : isWarning ? 'from-amber-400 via-amber-500 to-orange-500' : 'from-green-400 via-green-500 to-emerald-500';
  const badgeClass = isCancelled ? 'bg-red-100 text-red-700 border-red-200' : isWarning ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200';

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-gradient-to-b from-emerald-50 to-white dark:from-slate-950 dark:to-slate-950">
      {/* decorative background blobs */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-1/3 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />

      <div className="max-w-2xl w-full max-h-[90svh] overflow-auto">
        <Card className="overflow-hidden pb-4  supports-[backdrop-filter]:bg-background/80">
          <div className={`h-1 w-full bg-gradient-to-r ${accentBar}`} />
          <CardHeader className="pb-2">
            <div className="flex items-start gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ring-1 ring-black/5 ${isCancelled ? 'bg-red-50' : isWarning ? 'bg-amber-50' : 'bg-emerald-50'}`}>
                {isCancelled ? (
                  <XCircle className="h-7 w-7 text-red-600" />
                ) : isWarning ? (
                  <XCircle className="h-7 w-7 text-amber-600" />
                ) : (
                  <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                )}
              </div>
              <div className="flex-1">
                <CardTitle className="leading-tight">
                  {isCancelled ? 'Subscription cancelled' : isWarning ? 'Subscription attention needed' : 'Subscription activated'}
                </CardTitle>
                <CardDescription className="mt-1">Payment status and next steps</CardDescription>
                <div className={`mt-2 inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium ${badgeClass}`}>
                  <span className="capitalize">{statusLabel.toLowerCase()}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="mx-auto mb-6 flex items-center justify-center">
              <div className="h-[200px] w-[200px] rounded-2xl bg-gradient-to-br from-black/0 via-black/0 to-black/5 p-3 ring-1 ring-black/5">
                <DotLottieReact src={lottieSrc} loop autoplay />
              </div>
            </div>

            {isVerifying ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Finalizing your subscription…</span>
              </div>
            ) : errorMessage ? (
              <div className="space-y-4">
                <p className="text-red-600">{errorMessage}</p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" onClick={() => router.back()}>Go back</Button>
                  <Link href="/">
                    <Button>Go home</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {subscription?.status === 'CANCELLED' ? (
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="h-6 w-6" />
                    <span className="font-medium">{apiMessage || 'Payment cancelled. No changes were made to your subscription.'}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle2 className="h-6 w-6" />
                    <span className="font-medium">{apiMessage || 'Payment successful.'} {subscription?.plan?.name ? `${subscription.plan.name} ` : ''}</span>
                  </div>
                )}

                {subscription?.status === 'CANCELLED' && (
                  <div className="space-y-3">
                    {subscription?.status_explanation && (
                      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                        {subscription.status_explanation}
                      </div>
                    )}
                    {subscription?.status_details && (
                      <div className="grid gap-2 rounded-md border bg-background p-3 text-sm">
                        {typeof subscription.status_details.days_remaining === 'number' && (
                          <p>Days remaining: {subscription.status_details.days_remaining}</p>
                        )}
                        {subscription.status_details.access_until && (
                          <p>Access until: {new Date(subscription.status_details.access_until).toLocaleDateString()}</p>
                        )}
                        {subscription.status_details.cancellation_scheduled && subscription.status_details.cancellation_date && (
                          <p>Cancellation date: {new Date(subscription.status_details.cancellation_date).toLocaleDateString()}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {subscription && subscription?.status !== 'CANCELLED' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Welcome to {subscription?.plan?.name}</h3>
                    {subscription?.status_explanation && (
                      <div className="rounded-md border bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                        {subscription.status_explanation}
                      </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                      {subscription?.trial_information?.is_trial ? (
                        <div className="rounded-lg border bg-green-50 px-3 py-2">
                          <p className="text-sm">{subscription.trial_information.days_remaining} days remaining</p>
                          {subscription.trial_information.trial_end && (
                            <p className="text-xs text-muted-foreground">Trial ends: {new Date(subscription.trial_information.trial_end).toLocaleDateString()}</p>
                          )}
                        </div>
                      ) : (
                        !subscription?.status_explanation && (
                          <div className="rounded-lg border bg-gray-50 px-3 py-2">
                            <p className="text-sm">Your subscription is now active with full access to all features.</p>
                          </div>
                        )
                      )}

                      {/* <div className="rounded-lg border bg-background px-3 py-2">
                        <h4 className="font-medium">Billing</h4>
                        {subscription?.plan?.price_formatted && (
                          <p className="text-sm">Price: {subscription.plan.price_formatted}/month</p>
                        )}
                        {subscription?.next_billing_date && (
                          <p className="text-xs text-muted-foreground">Next billing: {new Date(subscription.next_billing_date).toLocaleDateString()}</p>
                        )}
                      </div> */}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 justify-center">
                  <Link href="/dashboard/garage/subscription">
                    <Button className="cursor-pointer">Go to subscription</Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


