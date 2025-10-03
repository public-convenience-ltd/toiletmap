import { useCallback, useMemo, useState } from 'react';
import ToiletMap, { type Loo } from './features/map/ToiletMap';
import { looTileCache } from '@/lib/graphqlClient';
import {
  AppShell,
  Button,
  Card,
  Heading,
  Panel,
  Stack,
  Text,
} from './design-system';

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);

const App = () => {
  const [loos, setLoos] = useState<Loo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadState, setReloadState] = useState<{ key: number; forceNetwork: boolean }>(
    () => ({ key: 0, forceNetwork: false }),
  );
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isPrimingUk, setIsPrimingUk] = useState(false);

  const handleData = useCallback((data: Loo[]) => {
    setLoos(data);
    setLastUpdated(new Date());
    setError(null);
  }, []);

  const handleError = useCallback((message: string) => {
    setError(message);
  }, []);

  const handleLoadingChange = useCallback((isLoading: boolean) => {
    setLoading(isLoading);
  }, []);

  const handlePrimeUk = useCallback(async () => {
    setIsPrimingUk(true);
    try {
      await looTileCache.primeUkTiles();
      setReloadState(({ key }) => ({ key: key + 1, forceNetwork: false }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to prime UK cache';
      setError(message);
    } finally {
      setIsPrimingUk(false);
    }
  }, [setReloadState, setError]);

  const sidePanel = useMemo(() => {
    const topLoos = loos.slice(0, 5);

    return (
      <Card>
        <Stack>
          <Stack
            direction="horizontal"
            style={{ justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-s)' }}
          >
            <Heading level={2}>Nearby toilets</Heading>
            <Stack direction="horizontal" style={{ gap: 'var(--space-s)', alignItems: 'center' }}>
              <Button
                onClick={() =>
                  setReloadState(({ key }) => ({ key: key + 1, forceNetwork: true }))
                }
                disabled={loading}
                aria-label="Refresh toilet results from the API"
              >
                Refresh
              </Button>
              <Button
                onClick={handlePrimeUk}
                disabled={isPrimingUk}
                aria-label="Fetch and cache UK toilets"
              >
                {isPrimingUk ? 'Priming…' : 'Prime UK cache'}
              </Button>
            </Stack>
          </Stack>
          <Text size="small">
            {loading
              ? 'Updating results…'
              : `Showing ${loos.length} toilet${loos.length === 1 ? '' : 's'} in the current view.`}
          </Text>
          {isPrimingUk ? <Text size="small">Priming UK cache…</Text> : null}
          {lastUpdated ? (
            <Text size="small">Last updated at {formatTime(lastUpdated)}.</Text>
          ) : (
            <Text size="small">Results load when the map is ready.</Text>
          )}
          {error ? (
            <Text tone="emphasis">{error}</Text>
          ) : null}
          <Panel title="Quick glance" emptyContent="Markers will appear once data loads.">
            {topLoos.map((loo) => (
              <Card key={loo.id} padding="s">
                <Stack>
                  <Heading level={3}>
                    {loo.name ?? `Toilet ${loo.id.slice(0, 6)}`}
                  </Heading>
                  <Text size="small">
                    {[
                      loo.accessible ? 'Accessible' : 'Standard access',
                      loo.noPayment ? 'Free to use' : 'May require payment',
                      loo.babyChange ? 'Baby change' : null,
                      loo.radar ? 'RADAR key' : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                </Stack>
              </Card>
            ))}
          </Panel>
        </Stack>
      </Card>
    );
  }, [
    loos,
    loading,
    lastUpdated,
    error,
    handlePrimeUk,
    isPrimingUk,
    setReloadState,
  ]);

  return (
    <AppShell
      header={
        <Stack direction="horizontal" style={{ alignItems: 'center', gap: 'var(--space-m)' }}>
          <Heading>Toilet Map Explorer</Heading>
          <Text tone="emphasis">Minimal frontend prototype</Text>
        </Stack>
      }
      sidePanel={sidePanel}
    >
      <ToiletMap
        onData={handleData}
        onError={handleError}
        onLoadingChange={handleLoadingChange}
        reloadKey={reloadState.key}
        reloadForceNetwork={reloadState.forceNetwork}
      />
    </AppShell>
  );
};

export default App;
