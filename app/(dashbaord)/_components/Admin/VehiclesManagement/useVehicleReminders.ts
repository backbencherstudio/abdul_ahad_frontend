import { useMemo } from "react";
import { addDays, isAfter, isBefore } from "date-fns";

interface Vehicle {
  id: string;
  mot_expiry_date: string | null;
}

interface UseVehicleRemindersProps {
  vehicles: Vehicle[];
  autoReminderEnabled: boolean;
  reminderDaysInAdvance: number;
}

export function useVehicleReminders({
  vehicles,
  autoReminderEnabled,
  reminderDaysInAdvance,
}: UseVehicleRemindersProps) {
  const vehiclesNeedingReminder = useMemo(() => {
    if (!autoReminderEnabled) return [];

    const today = new Date();
    const reminderDate = addDays(today, reminderDaysInAdvance);

    return vehicles.filter((vehicle) => {
      if (!vehicle.mot_expiry_date) return false;
      const expiryDate = new Date(vehicle.mot_expiry_date);
      return isAfter(expiryDate, today) && isBefore(expiryDate, reminderDate);
    });
  }, [vehicles, autoReminderEnabled, reminderDaysInAdvance]);

  return {
    vehiclesNeedingReminder,
    needsReminderCount: vehiclesNeedingReminder.length,
  };
}

