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

function useObject(node, collectionName, objectId) {
  const [record, setRecord] = useState(null);

  const refresh = useCallback(() => {
    if (!node || !collectionName || !objectId) {
      setRecord(null);
      return;
    }

    setRecord(node.read(collectionName, objectId));
  }, [node, collectionName, objectId]);

  useEffect(() => {
    refresh();

    if (!node) {
      return undefined;
    }

    const handleChange = (event) => {
      if (
        event &&
        event.collection === collectionName &&
        event.id === objectId
      ) {
        refresh();
      }
    };

    node.on('change', handleChange);
    return () => node.off('change', handleChange);
  }, [node, collectionName, objectId, refresh]);

  return record;
}

function useDiscovery(node, scope = 'main', options = null) {
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!node || !scope || !options) {
      setJoined(false);
      setError(null);
      return undefined;
    }

    let cancelled = false;

    node.joinDiscovery(scope, options)
      .then(() => {
        if (!cancelled) {
          setJoined(true);
          setError(null);
        }
      })
      .catch((joinError) => {
        if (!cancelled) {
          setJoined(false);
          setError(joinError);
        }
      });

    return () => {
      cancelled = true;
      node.leaveDiscovery(scope).catch(() => undefined);
      setJoined(false);
    };
  }, [node, scope, options]);

  return { joined, error };
}

function useConnectionStats(node, pollIntervalMs = 2000) {
  const [stats, setStats] = useState({ openCount: 0, peerIds: [] });

  const refresh = useCallback(() => {
    if (!node || typeof node.getConnectionStats !== 'function') {
      setStats({ openCount: 0, peerIds: [] });
      return;
    }

    setStats(node.getConnectionStats());
  }, [node]);

  useEffect(() => {
    refresh();

    if (!node || !pollIntervalMs) {
      return undefined;
    }

    const timer = setInterval(refresh, pollIntervalMs);
    return () => clearInterval(timer);
  }, [node, pollIntervalMs, refresh]);

  return stats;
}

function useRoom(node, scope = 'main', options = null) {
  const peersOptions = options && options.peersOptions ? options.peersOptions : {};
  const { joined, error } = useDiscovery(node, scope, options);
  const peers = usePeers(node, scope, peersOptions);
  const connectionStats = useConnectionStats(node, options?.connectionPollMs ?? 2000);

  return {
    joined,
    error,
    peers,
    connectionStats
  };
}

function useMessages(node, filter = null) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!node) {
      setMessages([]);
      return undefined;
    }

    const handleMessage = (message) => {
      if (typeof filter === 'function' && !filter(message)) {
        return;
      }

      setMessages((current) => [...current, message]);
    };

    node.on('message', handleMessage);
    return () => node.off('message', handleMessage);
  }, [node, filter]);

  return messages;
}

module.exports = {
  useDignity,
  useCollection,
  usePeers,
  useObject,
  useDiscovery,
  useConnectionStats,
  useRoom,
  useMessages
};
