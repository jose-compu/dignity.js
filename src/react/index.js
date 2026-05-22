const { useCallback, useEffect, useState } = require('react');
const DignityP2P = require('../core/dignity-p2p');

function useDignity(config) {
  const [node, setNode] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!config) {
      return undefined;
    }

    let cancelled = false;
    const instance = new DignityP2P(config);
    setNode(instance);
    setStatus('starting');
    setError(null);

    instance.start()
      .then(() => {
        if (!cancelled) {
          setStatus('running');
        }
      })
      .catch((startError) => {
        if (!cancelled) {
          setError(startError);
          setStatus('error');
        }
      });

    return () => {
      cancelled = true;
      instance.stop()
        .catch(() => undefined)
        .finally(() => {
          setStatus('stopped');
          setNode(null);
        });
    };
  }, [config]);

  return {
    node,
    status,
    error
  };
}

function useCollection(node, collectionName) {
  const [records, setRecords] = useState([]);

  const refresh = useCallback(() => {
    if (!node || !collectionName) {
      setRecords([]);
      return;
    }

    setRecords(node.list(collectionName));
  }, [node, collectionName]);

  useEffect(() => {
    refresh();

    if (!node) {
      return undefined;
    }

    node.on('change', refresh);
    return () => node.off('change', refresh);
  }, [node, refresh]);

  return records;
}

function usePeers(node, scope = 'main', options = {}) {
  const includeSelf = options.includeSelf !== false;
  const [peers, setPeers] = useState([]);

  const refresh = useCallback(() => {
    if (!node) {
      setPeers([]);
      return;
    }

    setPeers(node.listPeers(scope, { includeSelf }));
  }, [node, scope, includeSelf]);

  useEffect(() => {
    refresh();

    if (!node) {
      return undefined;
    }

    const handlePresenceChange = () => refresh();
    node.on('peerdiscovered', handlePresenceChange);
    node.on('peerleft', handlePresenceChange);

    return () => {
      node.off('peerdiscovered', handlePresenceChange);
      node.off('peerleft', handlePresenceChange);
    };
  }, [node, refresh]);

  return peers;
}

module.exports = {
  useDignity,
  useCollection,
  usePeers
};
