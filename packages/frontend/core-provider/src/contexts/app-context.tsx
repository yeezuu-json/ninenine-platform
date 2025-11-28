import React from 'react';

export const version = '0.0.1';

export interface AppContextValue {
  appName: string;
  appVersion?: string;
}

export const AppContextDefaultValue: AppContextValue = {
  appName: 'Lotto 9999',
  appVersion: version,
};

export const AppContext = React.createContext<AppContextValue>(
  AppContextDefaultValue
);
