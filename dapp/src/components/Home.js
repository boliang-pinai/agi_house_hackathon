import React, { useState, useEffect, useCallback, useRef } from "react";
import czTweets from "./cz_tweets.txt";
import promptFile from "./prompt.txt";
import czAvatar from "./cz_avatar.jpg";
import { useNavigate } from "react-router-dom";
import './Home.css'; // Import custom CSS for animations

// Import images (Note: Make sure these image files exist when actually using them)
import bgMain from "../images/bg-main.png";
import connectTwitterImage from "../images/connect_twitter.png";
import generateTweetImage from "../images/generate_tweet.png";

export const Home = () => {
  const [isTwitterConnecting, setIsTwitterConnecting] = useState(false);
  const [isTwitterConnected, setIsTwitterConnected] = useState(false);
  const [isGeneratingTweet, setIsGeneratingTweet] = useState(false);
  const [tweets, setTweets] = useState([]);  // Array of tweet objects
  const [selectedTweetIndex, setSelectedTweetIndex] = useState(0);  // Index of selected tweet
  const [showTweetModal, setShowTweetModal] = useState(false);
  const [showCZTweetsModal, setShowCZTweetsModal] = useState(false);
  const [czTweetsContent, setCZTweetsContent] = useState("");
  const [promptContent, setPromptContent] = useState("");
  const [statusMessageIndex, setStatusMessageIndex] = useState(0);
  const statusMessages = [
    "Crafting a creative crypto tweet just for you...",
    "Connecting to X to retrieve twitter data...",
    "Talking to MCP server to retrieve information...",
    "Retrieving news...",
    "Retrieving trending topics..."
  ];
  const connectButtonRef = useRef(null);
  const statusIntervalRef = useRef(null);

  // 从localStorage加载BSC地址并获取钱包数据
  useEffect(() => {
    // Check if Twitter is connected from localStorage
    const twitterConnected = localStorage.getItem('twitter_connected') === 'true';
    setIsTwitterConnected(twitterConnected);

    // Load CZ tweets content
    fetch(czTweets)
      .then(response => response.text())
      .then(text => setCZTweetsContent(text))
      .catch(error => console.error('Error loading CZ tweets:', error));
      
    // Load prompt content
    fetch(promptFile)
      .then(response => response.text())
      .then(text => setPromptContent(text))
      .catch(error => console.error('Error loading prompt file:', error));
  }, []);

  const handleAddressChange = (address) => {
    if (address) {
      console.log('Wallet connected with address:', address);
      localStorage.setItem('bscAddress', address);
    } else {
      console.log('Wallet disconnected');
      localStorage.removeItem('bscAddress');
    }
  };

  const navigate = useNavigate();

  // Handle generating a tweet
  const handleGenerateTweet = async () => {
    if (!isTwitterConnected) {
      alert("Please connect to Twitter first");
      return;
    }
    
    console.log("Generating tweet...");
    
    // Show loading state and start status message animation
    setIsGeneratingTweet(true);
    setStatusMessageIndex(0);
    
    // Function to update status message and set a new random timeout
    const updateStatusMessage = () => {
      setStatusMessageIndex(prevIndex => (prevIndex + 1) % statusMessages.length);
      
      // Clear existing timeout if any
      if (statusIntervalRef.current) {
        clearTimeout(statusIntervalRef.current);
      }
      
      // Set new timeout with random duration between 500ms and 1000ms
      const randomInterval = Math.floor(Math.random() * (2000 - 500 + 1)) + 500;
      statusIntervalRef.current = setTimeout(updateStatusMessage, randomInterval);
    };
    
    // Start the first update with random interval
    const initialInterval = Math.floor(Math.random() * (2000 - 500 + 1)) + 500;
    statusIntervalRef.current = setTimeout(updateStatusMessage, initialInterval);
    
    try {
    // Call GPT-4o model to generate tweets
    console.log('Calling GPT-4o to generate tweets');
    
    // Define the API endpoint
    const apiEndpoint = 'https://api.openai.com/v1/chat/completions';
    
    // Create the prompt for generating BNB Chain related tweets
    const prompt = {
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a crypto expert who creates concise, engaging tweets about BNB Chain. Each tweet should be under 280 characters, be informative yet casual, and include relevant hashtags. Focus on BNB Chain developments, DeFi, Web3, or crypto adoption."
        },
        {
          role: "user",
          content: promptContent || "Generate 5 unique tweets about BNB Chain, crypto, or Web3 that would be suitable for a crypto influencer to post. Make them sound natural, informative, and engaging. Each tweet should be concise (under 280 characters) and include relevant hashtags."
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    };
    
    // Get the API key from environment or a secure source
    // For demo purposes, we'll use a placeholder - in production, this should be securely managed
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY || 'your-api-key';
    
    // Make the API call
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(prompt)
    });
    
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API response:', data);
    
    // Parse the generated tweets from the response
    const content = data.choices[0].message.content;
    
    // Split the content by numbered lines or newlines to extract individual tweets
    const tweetRegex = /\d+\. (.+?)(?=\n\d+\.|$)/gs;
    const matches = [...content.matchAll(tweetRegex)];
    
    let tweetArray = [];
    
    if (matches.length >= 5) {
      // If we successfully parsed 5 tweets with the regex
      tweetArray = matches.slice(0, 5).map(match => match[1].trim());
    } else {
      // Fallback: just split by newlines and filter empty lines
      tweetArray = content.split('\n')
        .filter(line => line.trim() !== '')
        .map(line => line.replace(/^\d+\.\s*/, '').trim()) // Remove leading numbers
        .slice(0, 5);
    }
    
    // Ensure we have exactly 5 tweets
    while (tweetArray.length < 5) {
      tweetArray.push("BNB Chain continues to innovate in the blockchain space. Excited to see what's next! #BNBChain #Crypto #Web3");
    }
    
    // If we have more than 5, trim to 5
    tweetArray = tweetArray.slice(0, 5);
      
      // Simulate loading with a delay
      const delayTime = Math.floor(Math.random() * (10000 - 7000 + 1)) + 7000; // Random delay between 4-7 seconds
      await new Promise(resolve => setTimeout(resolve, delayTime));
      
      // Set the tweets in state and show modal
      setTweets(tweetArray);
      setSelectedTweetIndex(0); // Select the first tweet by default
      setShowTweetModal(true);
      
    } catch (error) {
      console.error('Error generating tweet:', error);
      alert('Failed to generate tweet. Please try again later.');
    } finally {
      // Clear the status message timeout and reset loading state
      if (statusIntervalRef.current) {
        clearTimeout(statusIntervalRef.current);
        statusIntervalRef.current = null;
      }
      setIsGeneratingTweet(false);
    }  
  };

  // Handle Twitter OAuth
  const handleTwitterConnect = () => {
    // If already connected, disconnect
    if (isTwitterConnected) {
      setIsTwitterConnected(false);
      localStorage.removeItem('twitter_connected');
      localStorage.removeItem('twitter_code_verifier');
      localStorage.removeItem('twitter_access_token');
      return;
    }
    
    setIsTwitterConnecting(true);
    
    try {
      // Generate PKCE code verifier and challenge
      const codeVerifier = generateRandomString(43);
      localStorage.setItem('twitter_code_verifier', codeVerifier);
      
      // Create the code challenge from the verifier
      const codeChallenge = createCodeChallenge(codeVerifier);
      
      // Create a random state value to prevent CSRF attacks
      const state = generateRandomString(16);
      localStorage.setItem('twitter_oauth_state', state);
      
      // Prepare the OAuth URL
      const authUrl = new URL('https://twitter.com/i/oauth2/authorize');
      authUrl.searchParams.append('client_id', 'S3dEZUd3NFZZbGtmRUR2TDUwTDY6MTpjaQ');
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('redirect_uri', 'http://localhost:3456/oauth/callback?state=twitter&code=YUpnYmtRS3NpaHAxejVtZm9sbUU3c1hRQm03cnV4aDR4UXRqQmM4dV9SaFJkOjE3NDQ1MDM4MjE3MDg6MToxOmFjOjE');
      authUrl.searchParams.append('scope', 'tweet.read users.read offline.access');
      authUrl.searchParams.append('state', state);
      authUrl.searchParams.append('code_challenge', codeChallenge);
      authUrl.searchParams.append('code_challenge_method', 'S256');
      
      // Open the auth URL in a new window and store the reference
      const oauthWindow = window.open(authUrl.toString(), 'twitter-oauth', 'width=600,height=700');
      
      // Set up message listener to receive the OAuth callback result
      const handleOAuthCallback = (event) => {
        // Check if the message is from our expected origin
        if (event.origin !== 'http://localhost:3456') return;
        
        // Parse the message data
        const { type, code, receivedState, error } = event.data;
        
        if (type === 'oauth-callback' && receivedState === state) {
          if (code && !error) {
            // OAuth succeeded, exchange code for token (in a real app)
            console.log('OAuth successful, received code:', code);
            
            // Set connected state
            setIsTwitterConnected(true);
            localStorage.setItem('twitter_connected', 'true');
            
            // Close the OAuth window
            if (oauthWindow && !oauthWindow.closed) {
              oauthWindow.close();
            }
          } else {
            // OAuth failed
            console.error('OAuth failed:', error);
          }
        }
        
        // Clean up
        window.removeEventListener('message', handleOAuthCallback);
        setIsTwitterConnecting(false);
      };
      
      // Add the message event listener
      window.addEventListener('message', handleOAuthCallback);
      
      // Check if the OAuth window was closed without completing authentication
      const checkWindowClosed = setInterval(() => {
        if (oauthWindow && oauthWindow.closed) {
          clearInterval(checkWindowClosed);
          window.removeEventListener('message', handleOAuthCallback);
          setIsTwitterConnecting(false);
          setIsTwitterConnected(true);
          localStorage.setItem('twitter_connected', 'true');
          console.log('OAuth window was closed by user, setting connection to true');
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error starting Twitter OAuth:', error);
      setIsTwitterConnecting(false);
    }
  };
  
  // Helper function to generate a random string for PKCE
  const generateRandomString = (length) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let text = '';
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };
  
  // Helper function to create a code challenge from a code verifier
  const createCodeChallenge = (codeVerifier) => {
    // In a real implementation, you would use the crypto API to create a SHA-256 hash
    // and then base64url encode it
    // This is a simplified version for demonstration purposes
    // In a production app, you would implement this properly:
    /*
    async function createCodeChallenge(codeVerifier) {
      const encoder = new TextEncoder();
      const data = encoder.encode(codeVerifier);
      const digest = await window.crypto.subtle.digest('SHA-256', data);
      
      return base64URLEncode(digest);
    }
    
    function base64URLEncode(buffer) {
      return btoa(String.fromCharCode(...new Uint8Array(buffer)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    }
    */
    return codeVerifier; // This is not secure, just for demonstration
  };

  return (
    <div className="w-full min-h-screen bg-element-lightwhite overflow-y-auto">
      <div className="relative w-full pb-20">
        {/* Background image */}
        <div className="fixed inset-0 z-0 overflow-hidden">
          <img
            className="w-full h-full object-cover"
            alt="Bg main"
            src={bgMain}
          />
        </div>

        {/* Twitter Connect Panel - Full screen overlay */}
        <div className="fixed inset-0 z-10 flex items-center justify-center">
          <div className="w-full h-full flex items-center justify-center">
            <img
              src={isTwitterConnected ? generateTweetImage : connectTwitterImage}
              alt={isTwitterConnected ? "Generate Tweet" : "Connect Twitter"}
              className="w-full h-full object-contain"
              onClick={handleTwitterConnect}
            />
          </div>
        </div>
        

        {/* Content container */}
        <div className="relative z-5 pt-2 pb-20 flex flex-col items-center">
          {/* Header with logo and connect wallet button */}
          <div className="sticky top-0 left-0 right-0 z-20 flex justify-between items-center w-full px-4 py-3">

            {/* Twitter and Connect wallet buttons */}
            <div className="absolute top-4 right-4 z-10 flex items-center">
              {/* Twitter button */}
              <button 
                onClick={handleTwitterConnect}
                disabled={isTwitterConnecting}
                className={`mr-4 w-10 h-10 flex items-center justify-center ${isTwitterConnected ? 'bg-gradient-to-r from-pink-300 via-purple-300 via-blue-300 via-green-300 via-yellow-300 via-orange-300 to-red-300' : 'bg-white'} rounded-full shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden`}
                title={isTwitterConnected ? "Connected to Twitter (click to disconnect)" : "Connect to Twitter"}
              >
                {isTwitterConnecting ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className={`absolute inset-0 ${isTwitterConnected ? 'animate-gradient-x bg-gradient-to-r from-pink-300 via-purple-300 via-blue-300 via-green-300 via-yellow-300 via-orange-300 to-red-300 opacity-100' : 'opacity-0'}`}></div>
                    <img 
                      src="https://d1m299lrt4bqhp.cloudfront.net/logo_twitter.png" 
                      alt="Twitter" 
                      className="w-6 h-6 relative z-10" 
                    />
                  </div>
                )}
              </button>
              
              {/* Connect wallet button */}
              {/* <div className="w-40">
                <ConnectButton
                  onAddressChange={handleAddressChange}
                  ref={connectButtonRef}
                />
              </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Transparent Generate Tweet button at the bottom */}
      {isTwitterConnected && (
        <div className="fixed bottom-0 left-0 right-0 z-20 flex justify-center w-full">
          <button
            onClick={handleGenerateTweet}
            disabled={isGeneratingTweet}
            className="w-full h-16 bg-transparent"
          >
            {/* Completely transparent button with no content */}
          </button>
        </div>
      )}
      
      {/* Tweet Generation Loading Animation */}
      {isGeneratingTweet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white bg-opacity-10 rounded-2xl p-8 shadow-2xl border border-white border-opacity-20 max-w-md w-full mx-4 overflow-hidden">
            <div className="flex flex-col items-center">
              {/* Animated Twitter/X Logo */}
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full bg-[#D3FA37] flex items-center justify-center animate-pulse shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                  </svg>
                </div>
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-pink-300 via-purple-300 via-blue-300 via-green-300 via-yellow-300 via-orange-300 to-red-300 opacity-70 blur-md animate-gradient-x"></div>
              </div>
              
              {/* Loading Text */}
              <h3 className="text-white text-xl font-bold mb-4">Generating Your Tweets</h3>
              
              {/* Loading Animation */}
              <div className="flex space-x-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-[#D3FA37] animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 rounded-full bg-[#D3FA37] animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-3 h-3 rounded-full bg-[#D3FA37] animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 bg-opacity-30 rounded-full h-2 mb-4 overflow-hidden">
                <div className="bg-[#D3FA37] h-2 rounded-full animate-progress-bar"></div>
              </div>
              
              {/* Animated Status Messages */}
              <div className="h-6 relative w-full overflow-hidden">
                {statusMessages.map((message, index) => (
                  <p 
                    key={index}
                    className={`text-white text-opacity-80 text-center text-sm absolute inset-x-0 transition-all duration-500 ${index === statusMessageIndex ? 'opacity-100 transform-none' : 'opacity-0 -translate-y-4'}`}
                  >
                    {message}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* CZ Tweets Modal */}
      {showCZTweetsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-70">
          <div className="bg-black bg-opacity-90 rounded-xl shadow-xl w-full max-w-md h-[80vh] overflow-hidden transform transition-all border border-gray-800">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">CZ X Posts</h3>
                <button 
                  onClick={() => setShowCZTweetsModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="bg-black p-4 rounded-lg mb-4 border border-gray-800 h-[65vh] overflow-y-auto">
                {czTweetsContent.split('\n').map((tweet, index) => (
                  tweet.trim() && (
                    <div key={index} className="mb-4 pb-4 border-b border-gray-800 last:border-0 last:mb-0 last:pb-0">
                      <div className="flex items-start">
                        <img src={czAvatar} alt="CZ" className="w-10 h-10 rounded-full mr-3 flex-shrink-0" />
                        <div>
                          <div className="flex items-center mb-1">
                            <span className="text-white font-bold">CZ</span>
                            <span className="text-gray-500 text-sm ml-2">@cz_binance</span>
                          </div>
                          <p className="text-white">{tweet}</p>
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Tweet Modal */}
      {showTweetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <h3 className="text-lg font-bold text-gray-900">Your Generated Tweets</h3>
                  <button 
                    onClick={() => setShowCZTweetsModal(true)}
                    className="ml-2 text-xs text-gray-500 underline hover:text-gray-700"
                  >
                    X footprints
                  </button>
                </div>
                <button 
                  onClick={() => setShowTweetModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Tweet selection tabs */}
              <div className="flex mb-3 overflow-x-auto pb-1">
                {tweets.map((tweet, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedTweetIndex(index)}
                    className={`px-3 py-1 mr-2 rounded-full text-sm font-medium transition-colors ${index === selectedTweetIndex 
                      ? 'bg-[#D3FA37] text-black' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    #{index + 1}
                  </button>
                ))}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                <p className="text-gray-800">{tweets[selectedTweetIndex] || ''}</p>
              </div>
              
              <div className="flex justify-between space-x-3">
                <button
                  onClick={() => {
                    // Open Twitter with pre-populated tweet
                    const tweetText = encodeURIComponent(tweets[selectedTweetIndex] || '');
                    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
                  }}
                  className="flex-1 bg-[#D3FA37] text-black py-2 px-4 rounded-lg font-medium hover:bg-[#c2e830] transition-colors"
                >
                  Post to Twitter
                </button>
                <button
                  onClick={() => {
                    setShowTweetModal(false);
                    handleGenerateTweet();
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Regenerate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
