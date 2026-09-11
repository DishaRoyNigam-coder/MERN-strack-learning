import { SettingsContext } from './settings-context';
import { useSettings } from '../hooks';

export function SettingsProvider({ children }) {
  const settings = useSettings();

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}