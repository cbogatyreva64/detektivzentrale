import { useEffect, useState } from 'preact/hooks';
import { isParentUnlocked } from './lib/gate';
import { useRoute } from './router';
import { Gate } from './views/parent/Gate';
import { ParentArea } from './views/parent/ParentArea';
import { PrintSheet } from './views/parent/PrintSheet';
import { init, tick, updateSetting, useAppState } from './store';
import { Calendar } from './views/Calendar';
import { CaseFile } from './views/CaseFile';
import { DayView } from './views/DayView';
import { Journal } from './views/Journal';

export function App() {
  const route = useRoute();
  const { ready, settings } = useAppState();
  const [, setUnlockTick] = useState(0);

  useEffect(() => {
    void init();
    // Datum regelmäßig prüfen: um Mitternacht oder nach dem Aufwecken des Tablets
    const id = window.setInterval(tick, 30_000);
    const onVis = () => document.visibilityState === 'visible' && tick();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  if (!ready) return <div class="screen loading" />;

  return (
    <>
      {settings.simulatedDate && (
        <div class="testmode-banner">
          TESTMODUS · simuliertes Datum {settings.simulatedDate}
          <button onClick={() => void updateSetting('simulatedDate', null)}>beenden</button>
        </div>
      )}
      {route.name === 'print' ? (
        isParentUnlocked() ? (
          <PrintSheet kind={route.kind} />
        ) : (
          <Gate onUnlock={() => setUnlockTick((n) => n + 1)} />
        )
      ) : route.name === 'eltern' ? (
        isParentUnlocked() ? (
          <ParentArea />
        ) : (
          <Gate onUnlock={() => setUnlockTick((n) => n + 1)} />
        )
      ) : route.name === 'day' ? (
        <DayView key={route.tag} tag={route.tag} />
      ) : route.name === 'akte' ? (
        <CaseFile />
      ) : route.name === 'tagebuch' ? (
        <Journal />
      ) : (
        <Calendar />
      )}
    </>
  );
}
