import NodeCache from 'node-cache';

// Cache for 1 hour (3600 seconds)
const cache = new NodeCache({ stdTTL: 3600 });

export default cache;
