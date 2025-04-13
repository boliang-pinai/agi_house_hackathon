// OAuth Callback Server for Binance Mini App
const http = require('http');
const url = require('url');

let callbackServer = null;
let pendingMainWindow = null;

/**
 * Create HTTP server for OAuth callback
 * @param {Object} options - Configuration options
 * @param {Function} options.handleAuthCallback - Function to handle the authorization callback
 * @param {number} options.port - Port to listen on (default: 3456)
 * @param {string} options.host - Host to listen on (default: 'localhost')
 * @returns {Object} - Server control methods
 */
const createCallbackServer = (options = {}) => {
  const {
    handleAuthCallback,
    port = 3456,
    host = 'localhost'
  } = options;

  if (callbackServer) {
    return {
      getServerUrl: () => `http://${host}:${port}`
    };
  }

  callbackServer = http.createServer(async (req, res) => {
    try {
      // Only handle requests to /oauth/callback
      if (req.url.startsWith("/oauth/callback")) {
        const parsedUrl = url.parse(req.url, true);
        const query = parsedUrl.query;

        // Send a response to close the browser window
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Authentication Complete</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  text-align: center; 
                  padding: 50px; 
                  background-color: #f8f9fa;
                  color: #1c1f25;
                }
                .container {
                  max-width: 500px;
                  margin: 0 auto;
                  background-color: white;
                  border-radius: 16px;
                  padding: 30px;
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }
                .success { 
                  color: #02C076; 
                  font-size: 24px;
                  margin-bottom: 16px;
                }
                .error { 
                  color: #F6465D; 
                  font-size: 24px;
                  margin-bottom: 16px;
                }
                p {
                  color: #676C77;
                  font-size: 16px;
                  line-height: 1.5;
                }
                .binance-logo {
                  width: 120px;
                  margin-bottom: 20px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                ${
                  query.error
                    ? `<h2 class="error">Authentication Error</h2><p>${query.error}</p>`
                    : `<h2 class="success">Authentication Successful</h2><p>You can close this window now. Returning to the app...</p>`
                }
                <script>
                  // Send message to parent window
                  window.addEventListener('DOMContentLoaded', () => {
                    const message = {
                      type: 'oauth-callback',
                      code: ${query.code ? `"${query.code}"` : 'null'},
                      receivedState: ${query.state ? `"${query.state}"` : 'null'},
                      error: ${query.error ? `"${query.error}"` : 'null'}
                    };
                    
                    // Post message to the opener window
                    if (window.opener) {
                      window.opener.postMessage(message, 'http://localhost:3000');
                    }
                    
                    // Close this window after a delay
                    setTimeout(() => window.close(), 3000);
                  });
                </script>
              </div>
            </body>
          </html>
        `);

        // Process the OAuth callback
        if (query.code && query.state && handleAuthCallback) {
          console.log("Received authorization code:", query.code);
          await handleAuthCallback(query);
        } else if (query.error) {
          console.error("OAuth error:", query.error);
        }
      } else {
        res.writeHead(404);
        res.end("Not Found");
      }
    } catch (error) {
      console.error("Error handling callback request:", error);
      res.writeHead(500);
      res.end("Internal Server Error");
    }
  });

  callbackServer.listen(port, host, () => {
    console.log(`OAuth callback server listening on http://${host}:${port}`);
  });

  callbackServer.on("error", (error) => {
    console.error("OAuth callback server error:", error);
  });

  return {
    getServerUrl: () => `http://${host}:${port}`,
    close: () => closeCallbackServer()
  };
};

// Close the callback server
const closeCallbackServer = () => {
  if (callbackServer) {
    callbackServer.close();
    callbackServer = null;
    pendingMainWindow = null;
    console.log("OAuth callback server closed");
    return true;
  }
  return false;
};

module.exports = {
  createCallbackServer,
  closeCallbackServer
};
