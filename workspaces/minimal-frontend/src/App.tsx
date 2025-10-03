import { useCallback, useMemo, useState } from 'react';
import ToiletMap, { DEFAULT_RADIUS_METERS, Loo } from './features/map/ToiletMap';
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
  const [reloadKey, setReloadKey] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

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

  const sidePanel = useMemo(() => {
    const topLoos = loos.slice(0, 5);

    return (
      <Card>
        <Stack>
          <Stack direction="horizontal" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Heading level={2}>Nearby toilets</Heading>
            <Button
              onClick={() => setReloadKey((value) => value + 1)}
              disabled={loading}
              aria-label="Refresh toilet results"
            >
              Refresh
            </Button>
          </Stack>
          <Text size="small">
            {loading
              ? 'Updating results…'
              : `Showing ${loos.length} toilet${loos.length === 1 ? '' : 's'} within ${Math.round(
                  DEFAULT_RADIUS_METERS / 1000,
                )}km.`}
          </Text>
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
                  <Heading level={3}>{loo.name ?? 'Public toilet'}</Heading>
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
  }, [loos, loading, lastUpdated, error, setReloadKey]);

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
        reloadKey={reloadKey}
      />
    </AppShell>
  );
};

export default App;
