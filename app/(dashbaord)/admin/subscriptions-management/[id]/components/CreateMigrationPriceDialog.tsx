'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (price: number) => void;
  isLoading: boolean;
}

export default function CreateMigrationPriceDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: Props) {
  const [newPricePence, setNewPricePence] = useState<string>('');

  const handleSubmit = () => {
    if (!newPricePence || isNaN(Number(newPricePence))) {
      return;
    }
    onSubmit(Number(newPricePence));
    setNewPricePence('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Migration Price</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 mt-4">
          <div className="grid gap-2">
            <Label htmlFor="new_price_pence">New Price (in pence)</Label>
            <Input
              id="new_price_pence"
              type="number"
              value={newPricePence}
              onChange={(e) => setNewPricePence(e.target.value)}
              placeholder="Enter new price in pence"
              min="0"
            />
            <p className="text-xs text-gray-500">
              Example: 1000 pence = £10.00
            </p>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setNewPricePence('');
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !newPricePence}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isLoading ? 'Creating...' : 'Create Price'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

