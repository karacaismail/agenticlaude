import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/spotlight/styles.css';
import './stiller/genel.scss';
import { tema } from './tema';
import { App } from './App';
import { DurumSaglayici } from './durum/depo';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={tema} defaultColorScheme="auto">
      <DurumSaglayici>
        <App />
      </DurumSaglayici>
    </MantineProvider>
  </StrictMode>,
);
