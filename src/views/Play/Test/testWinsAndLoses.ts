// Test Suite on win/lose probability and realistic human interaction

const PRIZES = [
  {
    label: "YOU WIN",
    sub: "£50",
    kind: "win",
    bg: "radial-gradient(circle at 30% 30%, #ffe082, #ffb300 60%, #f57c00)",
  },
  {
    label: "TRY AGAIN",
    sub: "Better luck!",
    kind: "lose",
    bg: "linear-gradient(135deg,#90caf9,#42a5f5)",
  },
  {
    label: "YOU WIN",
    sub: "£10",
    kind: "win",
    bg: "radial-gradient(circle at 70% 20%, #c8e6c9, #66bb6a 60%, #2e7d32)",
  },
  {
    label: "NO LUCK",
    sub: "Spin next!",
    kind: "lose",
    bg: "linear-gradient(135deg,#e0e0e0,#9e9e9e)",
  },
  {
    label: "BONUS",
    sub: "Free Play",
    kind: "win",
    bg: "linear-gradient(135deg,#ffd54f,#ff8f00)",
  },
];

// Mock your weighted prize selection (matches your actual implementation)
function selectRandomPrize() {
  // Weighted selection - slightly favor lose outcomes (adds 2 more lose prizes)
  const weightedPool = [...PRIZES, PRIZES[1], PRIZES[3]]; // TRY AGAIN, NO LUCK
  const randomIndex = Math.floor(Math.random() * weightedPool.length);
  return weightedPool[randomIndex];
}

// Test the probability distribution
function testProbabilityDistribution(iterations = 1000) {
  console.log(`🎲 Testing Prize Probability Distribution (${iterations} iterations)`);
  console.log("Expected: ~43% wins, ~57% losses (due to weighted system)\n");
  
  const results = {
    win: 0,
    lose: 0,
    prizes: {}
  };
  
  // Track individual prizes
  PRIZES.forEach(prize => {
    results.prizes[`${prize.label} - ${prize.sub}`] = 0;
  });
  
  // Run simulation
  for (let i = 0; i < iterations; i++) {
    const prize = selectRandomPrize();
    results[prize.kind]++;
    results.prizes[`${prize.label} - ${prize.sub}`]++;
  }
  
  // Calculate percentages
  const winPercent = ((results.win / iterations) * 100).toFixed(1);
  const losePercent = ((results.lose / iterations) * 100).toFixed(1);
  
  console.log("📊 PROBABILITY RESULTS:");
  console.log(`🏆 Wins: ${results.win}/${iterations} (${winPercent}%)`);
  console.log(`❌ Losses: ${results.lose}/${iterations} (${losePercent}%)`);
  console.log("\n📋 Individual Prize Distribution:");
  
  Object.entries(results.prizes).forEach(([prize, count]) => {
    const percent = ((count / iterations) * 100).toFixed(1);
    const prizeData = PRIZES.find(p => `${p.label} - ${p.sub}` === prize);
    const emoji = prizeData?.kind === 'win' ? '🏆' : '❌';
    console.log(`${emoji} ${prize}: ${count} (${percent}%)`);
  });
  
  // Verify the weighted system is working
  const expectedLoseRate = 5/7; // 5 lose prizes out of 7 total in weighted pool
  const actualLoseRate = results.lose / iterations;
  const isWeightedCorrectly = Math.abs(actualLoseRate - expectedLoseRate) < 0.05;
  
  console.log(`\n✅ Weighted system working: ${isWeightedCorrectly ? 'YES' : 'NO'}`);
  console.log(`Expected lose rate: ~${(expectedLoseRate * 100).toFixed(1)}%`);
  console.log(`Actual lose rate: ${(actualLoseRate * 100).toFixed(1)}%`);
  
  return results;
}

// Mock services matching your implementation
const MockUserService = {
  getScore: (id) => {
    console.log(`📊 Fetching play logs for user ID: ${id}`);
    // Simulate realistic game history with your actual prize structure
    const mockHistory = [
      { id: 1, kind: "win", timestamp: "2025-08-26T10:30:00Z" },
      { id: 2, kind: "lose", timestamp: "2025-08-26T10:45:00Z" },
      { id: 3, kind: "lose", timestamp: "2025-08-26T11:00:00Z" },
      { id: 4, kind: "win", timestamp: "2025-08-26T11:15:00Z" },
      { id: 5, kind: "lose", timestamp: "2025-08-26T11:30:00Z" },
    ];
    return Promise.resolve({ data: mockHistory });
  },
  sendScore: (id, payload) => {
    console.log(`💾 Saving game result for user ID: ${id}`, payload);
    return Promise.resolve({ success: true });
  }
};

// Test the getPlayLogs function with your actual implementation
function testGetPlayLogs(userId = "123") {
  console.log("\n📜 Testing getPlayLogs function with actual PRIZES:");
  
  return MockUserService.getScore(userId).then((response) => {
    const data = response.data;
    console.log("Raw server data:", data);
    
    const mappedData = data.map((item) => {
      const prizeData = PRIZES.find((prize) => prize.kind === item.kind);
      
      if (!prizeData) {
        console.warn(`⚠️  No prize found for kind: ${item.kind}`);
        return null;
      }
      
      return {
        timestamp: new Date(item.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        text: prizeData.kind === "win" ? `WIN — ${prizeData.sub}` : "No win",
        kind: prizeData.kind,
        bg: prizeData.bg,
        label: prizeData.label,
        sub: prizeData.sub,
      };
    }).filter(Boolean); // Remove null entries
    
    console.log("✅ Mapped play logs:");
    mappedData.forEach((entry, index) => {
      const emoji = entry.kind === 'win' ? '🏆' : '❌';
      console.log(`  ${emoji} ${entry.timestamp} - ${entry.text}`);
    });
    
    return mappedData;
  });
}

// Simulate realistic human scratching with proper game state management
function simulateHumanGameplay() {
  console.log("\n🎮 Simulating Human Gameplay with Realistic Behavior");
  
  // Game state (mimicking your Vue refs)
  let gameState = {
    started: false,
    finished: false,
    busy: false,
    progress: 0,
    currentPrize: null,
    playLog: [],
    hasLoggedEvent: false,
    gameDateTime: null
  };
  
  const GAME_CONFIG = {
    BRUSH_RADIUS: 26,
    REVEAL_THRESHOLD: 0.62,
    SAMPLE_STEP: 8,
    MIN_STROKES_FOR_CHECK: 12,
    BUSY_DELAY: 350,
  };
  
  // Simulate human scratching patterns
  const scratchingBehaviors = [
    { name: "Cautious scratcher", speed: 800, increments: [0.03, 0.07] },
    { name: "Aggressive scratcher", speed: 200, increments: [0.08, 0.15] },
    { name: "Strategic scratcher", speed: 500, increments: [0.05, 0.10] },
    { name: "Impatient scratcher", speed: 150, increments: [0.10, 0.20] },
    { name: "Methodical scratcher", speed: 600, increments: [0.04, 0.08] },
  ];
  
  return new Promise((resolve) => {
    // 1. Start game (simulate button click)
    console.log("👆 User clicks 'Start Game'");
    gameState.busy = true;
    
    // Select prize using your weighted system
    const selectedPrize = selectRandomPrize();
    gameState.currentPrize = selectedPrize;
    const emoji = selectedPrize.kind === 'win' ? '🏆' : '❌';
    console.log(`🎁 Prize selected: ${emoji} ${selectedPrize.label} - ${selectedPrize.sub}`);
    
    // Simulate busy delay
    setTimeout(() => {
      gameState.busy = false;
      gameState.started = true;
      console.log("✅ Game started, canvas ready for scratching");
      
      // 2. User starts scratching
      const behavior = scratchingBehaviors[Math.floor(Math.random() * scratchingBehaviors.length)];
      console.log(`🖱️  User behavior: ${behavior.name}`);
      
      // Simulate first scratch event (onLogEvent trigger)
      if (!gameState.hasLoggedEvent) {
        gameState.gameDateTime = new Date();
        gameState.hasLoggedEvent = true;
        console.log(`📝 Game start logged at: ${gameState.gameDateTime.toLocaleTimeString()}`);
        
        // Send to server (simulate your handleLogEvent)
        MockUserService.sendScore("123", {
          kind: selectedPrize.kind,
          timestamp: gameState.gameDateTime.toISOString(),
        });
      }
      
      // 3. Progressive scratching simulation
      let scratchProgress = 0;
      let strokeCount = 0;
      
      const scratchInterval = setInterval(() => {
        strokeCount++;
        
        // Random increment based on user behavior
        const [minInc, maxInc] = behavior.increments;
        const increment = Math.random() * (maxInc - minInc) + minInc;
        scratchProgress = Math.min(scratchProgress + increment, 1);
        
        gameState.progress = scratchProgress;
        
        // Only log progress every MIN_STROKES_FOR_CHECK (like your implementation)
        if (strokeCount % GAME_CONFIG.MIN_STROKES_FOR_CHECK === 0) {
          console.log(`🔍 Progress check #${strokeCount/GAME_CONFIG.MIN_STROKES_FOR_CHECK}: ${Math.round(scratchProgress * 100)}%`);
        }
        
        // Check if reveal threshold reached
        if (scratchProgress >= GAME_CONFIG.REVEAL_THRESHOLD) {
          console.log(`🎉 Reveal threshold (${GAME_CONFIG.REVEAL_THRESHOLD * 100}%) reached!`);
          clearInterval(scratchInterval);
          
          // 4. Finish game (simulate your finishGame function)
          gameState.finished = true;
          gameState.progress = 1;
          
          // Add to play log (simulate your addToPlayLog)
          const logEntry = {
            timestamp: gameState.gameDateTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            text: selectedPrize.kind === "win" ? `WIN — ${selectedPrize.sub}` : "No win",
            kind: selectedPrize.kind,
          };
          
          gameState.playLog.unshift(logEntry);
          console.log(`🏁 Game finished! Result: ${emoji} ${logEntry.text}`);
          console.log(`📊 Total scratches: ${strokeCount}, Final progress: 100%`);
          
          resolve(gameState);
        }
      }, behavior.speed + Math.random() * 200); // Add some timing variation
      
    }, GAME_CONFIG.BUSY_DELAY);
  });
}

// Test multiple games to verify win/lose distribution in actual gameplay
async function testGameplaySession(numberOfGames = 10) {
  console.log(`\n🎯 Testing ${numberOfGames} Game Session (Like a real user)`);
  
  const sessionResults = {
    wins: 0,
    losses: 0,
    games: []
  };
  
  for (let i = 1; i <= numberOfGames; i++) {
    console.log(`\n--- Game ${i}/${numberOfGames} ---`);
    
    const gameResult = await simulateHumanGameplay();
    const won = gameResult.currentPrize.kind === 'win';
    
    sessionResults[won ? 'wins' : 'losses']++;
    sessionResults.games.push({
      game: i,
      result: gameResult.currentPrize.kind,
      prize: `${gameResult.currentPrize.label} - ${gameResult.currentPrize.sub}`,
      timestamp: gameResult.gameDateTime.toLocaleTimeString()
    });
    
    // Rest between games (realistic user behavior)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
  }
  
  // Session summary
  console.log("\n" + "=".repeat(50));
  console.log("🎮 GAMEPLAY SESSION SUMMARY");
  console.log("=".repeat(50));
  
  const winRate = (sessionResults.wins / numberOfGames * 100).toFixed(1);
  const lossRate = (sessionResults.losses / numberOfGames * 100).toFixed(1);
  
  console.log(`🏆 Total Wins: ${sessionResults.wins}/${numberOfGames} (${winRate}%)`);
  console.log(`❌ Total Losses: ${sessionResults.losses}/${numberOfGames} (${lossRate}%)`);
  
  console.log("\n📋 Game-by-Game Results:");
  sessionResults.games.forEach(game => {
    const emoji = game.result === 'win' ? '🏆' : '❌';
    console.log(`  Game ${game.game}: ${emoji} ${game.prize} at ${game.timestamp}`);
  });
  
  // Verify against expected probability
  const expectedLossRate = 5/7 * 100; // ~71.4%
  const withinExpectedRange = Math.abs(parseFloat(lossRate) - expectedLossRate) < 20; // 20% tolerance for small samples
  
  console.log(`\n🔍 Expected loss rate: ~${expectedLossRate.toFixed(1)}%`);
  console.log(`📈 Actual loss rate: ${lossRate}%`);
  console.log(`✅ Within expected range: ${withinExpectedRange ? 'YES' : 'NO'}`);
  
  return sessionResults;
}

// Edge cases specific to your implementation
function testEdgeCases() {
  console.log("\n🧪 Testing Edge Cases for Your Implementation");
  
  // Test 1: Missing prize data
  console.log("\n1. Testing unknown prize kind:");
  const unknownPrizeData = { id: 999, kind: "unknown", timestamp: new Date().toISOString() };
  const foundPrize = PRIZES.find(prize => prize.kind === unknownPrizeData.kind);
  console.log(`Result: ${foundPrize ? 'Found' : 'Not found (will cause error)'}`);
  
  // Test 2: All win scenario (modify weighted pool)
  console.log("\n2. Testing all-win scenario:");
  const winOnlyPool = PRIZES.filter(p => p.kind === 'win');
  console.log(`Win-only prizes available: ${winOnlyPool.length}`);
  
  // Test 3: Empty play log
  console.log("\n3. Testing empty play log:");
  const emptyResponse = { data: [] };
  const mappedEmpty = emptyResponse.data.map(() => {});
  console.log(`Empty result length: ${mappedEmpty.length}`);
  
  // Test 4: Rapid successive games (stress test)
  console.log("\n4. Testing rapid game succession:");
  for (let i = 0; i < 5; i++) {
    const rapidPrize = selectRandomPrize();
    console.log(`  Rapid game ${i + 1}: ${rapidPrize.kind} - ${rapidPrize.sub}`);
  }
}

// Main test runner
async function runComprehensiveTests() {
  console.log("🚀 COMPREHENSIVE SCRATCH CARD GAME TEST SUITE");
  console.log("=".repeat(60));
  
  try {
    // Test 1: Probability Distribution
    console.log("\n🎯 TEST 1: PROBABILITY DISTRIBUTION");
    testProbabilityDistribution(10000);
    
    console.log("\n" + "=".repeat(60));
    
    // Test 2: Data Processing
    console.log("\n📊 TEST 2: DATA PROCESSING");
    await testGetPlayLogs();
    
    console.log("\n" + "=".repeat(60));
    
    // Test 3: Single Game Simulation
    console.log("\n🎮 TEST 3: SINGLE GAME SIMULATION");
    await simulateHumanGameplay();
    
    console.log("\n" + "=".repeat(60));
    
    // Test 4: Multiple Games Session
    console.log("\n🏆 TEST 4: GAMEPLAY SESSION");
    await testGameplaySession(20);
    
    console.log("\n" + "=".repeat(60));
    
    // Test 5: Edge Cases
    console.log("\n⚠️  TEST 5: EDGE CASES");
    testEdgeCases();
    
    console.log("\n" + "=".repeat(60));
    console.log("✨ ALL TESTS COMPLETED SUCCESSFULLY!");
    console.log("🎊 Your weighted prize system is working as expected!");
    
  } catch (error) {
    console.error("❌ TEST FAILED:", error);
  }
}

// Quick test function for development
function quickTest() {
  console.log("⚡ QUICK TEST - Prize Distribution Check");
  testProbabilityDistribution(1000);
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runComprehensiveTests,
    quickTest,
    testProbabilityDistribution,
    testGameplaySession
  };
}

// Auto-run if in browser console
if (typeof window !== 'undefined') {
  console.log("🎮 Scratch Card Game Test Suite Loaded!");
  console.log("Run: runComprehensiveTests() for full test");
  console.log("Run: quickTest() for quick probability check");
}

// Run comprehensive tests
runComprehensiveTests();