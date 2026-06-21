/**
 * Reusable WebSocket Helper Service
 * 
 * Provides utility methods to connect to the WMS real-time channels:
 *   - ws/occupancy/
 *   - ws/alerts/
 */

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://127.0.0.1:8000';

/**
 * Creates and configures a raw WebSocket connection.
 * 
 * @param {string} path - The WebSocket path (e.g. '/ws/occupancy/' or '/ws/alerts/')
 * @param {object} eventListeners - Event callback functions: onOpen, onMessage, onError, onClose
 * @returns {WebSocket} The WebSocket instance
 */
export const connectWebSocket = (path, eventListeners = {}) => {
  const fullUrl = `${WS_BASE_URL}${path}`;
  console.warn(`[WebSocket] Initializing connection to: ${fullUrl}`);
  
  const ws = new WebSocket(fullUrl);

  if (eventListeners.onOpen) {
    ws.onopen = (event) => {
      console.log(`[WebSocket] Connected to: ${fullUrl}`);
      eventListeners.onOpen(event);
    };
  }

  if (eventListeners.onMessage) {
    ws.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        eventListeners.onMessage(parsedData, event);
      } catch (err) {
        // Fallback to raw string message if not JSON
        eventListeners.onMessage(event.data, event);
      }
    };
  }

  if (eventListeners.onError) {
    ws.onerror = (event) => {
      console.error(`[WebSocket] Error on path ${path}:`, event);
      eventListeners.onError(event);
    };
  }

  if (eventListeners.onClose) {
    ws.onclose = (event) => {
      console.warn(`[WebSocket] Connection closed for: ${fullUrl}`);
      eventListeners.onClose(event);
    };
  }

  return ws;
};

/**
 * Subscribes to the live digital twin occupancy feed.
 */
export const subscribeOccupancyFeed = (callbacks = {}) => {
  return connectWebSocket('/ws/occupancy/', callbacks);
};

/**
 * Subscribes to the live WMS alerts feed.
 */
export const subscribeAlertsFeed = (callbacks = {}) => {
  return connectWebSocket('/ws/alerts/', callbacks);
};
