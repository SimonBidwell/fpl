"use client";

import { ReactNode, useEffect } from "react";

export interface Props {
  defaultGameWeek: number;
  currentGameWeek?: number;
  isValidGameWeek: (gameWeek: number, defaultGameWeek: number) => boolean;
  onNavigate: (gameWeek: number) => void;
  children: ReactNode;
}

export const WithDefaultGameWeek = ({
  defaultGameWeek,
  currentGameWeek,
  children,
  isValidGameWeek,
  onNavigate,
}: Props) => {
  useEffect(() => {
    if (
      currentGameWeek === undefined ||
      !isValidGameWeek(currentGameWeek, defaultGameWeek)
    ) {
      onNavigate(defaultGameWeek);
    }
  }, [currentGameWeek, defaultGameWeek, isValidGameWeek, onNavigate]);

  if (
    currentGameWeek !== undefined &&
    isValidGameWeek(currentGameWeek, defaultGameWeek)
  ) {
    return <>{children}</>;
  }

  return null;
};