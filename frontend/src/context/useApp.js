import { useContext } from "react";
import { AppContext } from "./contextValue";

export function useApp() {
  return useContext(AppContext);
}