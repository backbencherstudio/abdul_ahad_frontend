import { useState, useEffect } from "react";

const STORAGE_KEYS = {
  ENABLED: "autoReminderEnabled",
  DAYS_IN_ADVANCE: "reminderDaysInAdvance",
  MESSAGE: "predefinedReminderMessage",
} as const;

const DEFAULT_MESSAGE =
  "Your vehicle's MOT is due soon. Please book your MOT test to ensure your vehicle remains roadworthy.";

export function useAutoReminderSettings() {
  const [autoReminderEnabled, setAutoReminderEnabledState] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEYS.ENABLED) === "true";
    }
    return false;
  });

  const [reminderDaysInAdvance, setReminderDaysInAdvanceState] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEYS.DAYS_IN_ADVANCE);
      return saved ? parseInt(saved, 10) : 14;
    }
    return 14;
  });

  const [predefinedMessage, setPredefinedMessageState] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEYS.MESSAGE);
      return saved || DEFAULT_MESSAGE;
    }
    return DEFAULT_MESSAGE;
  });

  // Save to localStorage when values change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.ENABLED, String(autoReminderEnabled));
    }
  }, [autoReminderEnabled]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.DAYS_IN_ADVANCE, String(reminderDaysInAdvance));
    }
  }, [reminderDaysInAdvance]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.MESSAGE, predefinedMessage);
    }
  }, [predefinedMessage]);

  const setAutoReminderEnabled = (value: boolean) => {
    setAutoReminderEnabledState(value);
  };

  const setReminderDaysInAdvance = (value: number) => {
    setReminderDaysInAdvanceState(value);
  };

  const setPredefinedMessage = (value: string) => {
    setPredefinedMessageState(value);
  };

  return {
    autoReminderEnabled,
    reminderDaysInAdvance,
    predefinedMessage,
    setAutoReminderEnabled,
    setReminderDaysInAdvance,
    setPredefinedMessage,
  };
}

