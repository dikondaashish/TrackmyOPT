"use client";

import { useCallback, useEffect, useState } from "react";
import {
  EMPLOYMENT_SETUP_CHANGED_EVENT,
  type EmploymentSetupAcknowledgment,
  clearEmploymentSetupAck,
  getEmploymentSetupAck,
  setEmploymentSetupAck,
} from "@/lib/immigration/employmentTracking";

export function useEmploymentSetupAck() {
  const [ack, setAckState] = useState<EmploymentSetupAcknowledgment | null>(null);

  const refresh = useCallback(() => {
    setAckState(getEmploymentSetupAck());
  }, []);

  useEffect(() => {
    refresh();
    const onChanged = () => refresh();
    window.addEventListener(EMPLOYMENT_SETUP_CHANGED_EVENT, onChanged);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener(EMPLOYMENT_SETUP_CHANGED_EVENT, onChanged);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);

  const setAck = useCallback((status: EmploymentSetupAcknowledgment) => {
    setEmploymentSetupAck(status);
    setAckState(status);
  }, []);

  const clearAck = useCallback(() => {
    clearEmploymentSetupAck();
    setAckState(null);
  }, []);

  return { ack, setAck, clearAck, refresh };
}
