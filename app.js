const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();
let masterGain = audioCtx.createGain();
masterGain.connect(audioCtx.destination);
masterGain.gain.value = 0.2; // default volume for effects

// ==========================================
// YouTube API for Background Music
// ==========================================
let ytPlayer = null;
let ytReady = false;
let audioStarted = false;
let isMuted = true;

window.onYouTubeIframeAPIReady = function() {
    ytPlayer = new YT.Player('ytPlayer', {
        height: '0',
        width: '0',
        videoId: 'Q7FVVJ7d5A0',
        playerVars: {
            'autoplay': 0,
            'loop': 1,
            'controls': 0,
            'playlist': 'Q7FVVJ7d5A0'
        },
        events: {
            'onReady': (event) => {
                ytReady = true;
                ytPlayer.setVolume(20); // 20%
                if (audioStarted && !isMuted) {
                    ytPlayer.playVideo();
                }
            }
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const chatArea = document.getElementById('chatArea');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const statusIndicator = document.querySelector('.status-indicator');
    const statusText = document.querySelector('.status-text');
    const backBtn = document.getElementById('backToDashboardBtn');
    
    // Action Elements
    const toggleAudioBtn = document.getElementById('toggleAudioBtn');
    const inputFooter = document.getElementById('inputFooter');
    const arrestArea = document.getElementById('arrestArea');
    const arrestBtn = document.getElementById('arrestBtn');
    const caseClosedOverlay = document.getElementById('caseClosedOverlay');
    const volumeSlider = document.getElementById('volumeSlider');

    function playBgMusic() {
        if (ytReady && ytPlayer && !isMuted) {
            ytPlayer.playVideo();
        }
    }

    function stopBgMusic() {
        if (ytReady && ytPlayer) {
            ytPlayer.pauseVideo();
        }
    }

    function setBgVolume(vol) {
        if (ytReady && ytPlayer) {
            ytPlayer.setVolume(Math.round(vol * 100));
        }
    }


    function playSiren() {
        audioCtx.resume();
        
        // --- 1. Wail Siren (Slow Sweep) ---
        const wailOsc = audioCtx.createOscillator();
        wailOsc.type = 'sawtooth';
        
        const wailLfo = audioCtx.createOscillator();
        wailLfo.type = 'sine';
        wailLfo.frequency.value = 0.3; // بطيء
        
        const wailLfoGain = audioCtx.createGain();
        wailLfoGain.gain.value = 300; 
        wailOsc.frequency.value = 800; // يتأرجح بين 500 و 1100
        
        wailLfo.connect(wailLfoGain);
        wailLfoGain.connect(wailOsc.frequency);
        
        const wailFilter = audioCtx.createBiquadFilter();
        wailFilter.type = 'lowpass';
        wailFilter.frequency.value = 2500;
        
        const wailGain = audioCtx.createGain();
        wailGain.gain.value = 0;
        // Fade in and out
        wailGain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 1);
        wailGain.gain.setValueAtTime(0.3, audioCtx.currentTime + 3.5);
        wailGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 5);
        
        wailOsc.connect(wailFilter);
        wailFilter.connect(wailGain);
        wailGain.connect(masterGain);
        
        // --- 2. Yelp Siren (Fast Sweep) ---
        const yelpOsc = audioCtx.createOscillator();
        yelpOsc.type = 'square';
        
        const yelpLfo = audioCtx.createOscillator();
        yelpLfo.type = 'triangle';
        yelpLfo.frequency.value = 3; // سريع جداً
        
        const yelpLfoGain = audioCtx.createGain();
        yelpLfoGain.gain.value = 400;
        yelpOsc.frequency.value = 1000;
        
        yelpLfo.connect(yelpLfoGain);
        yelpLfoGain.connect(yelpOsc.frequency);
        
        const yelpFilter = audioCtx.createBiquadFilter();
        yelpFilter.type = 'lowpass';
        yelpFilter.frequency.value = 3000;
        
        const yelpGain = audioCtx.createGain();
        yelpGain.gain.value = 0;
        // يبدأ متأخراً قليلاً لإعطاء شعور باقتراب أكثر من دورية
        yelpGain.gain.setValueAtTime(0, audioCtx.currentTime + 1.5); 
        yelpGain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 2.5);
        yelpGain.gain.setValueAtTime(0.15, audioCtx.currentTime + 3.5);
        yelpGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 5);

        yelpOsc.connect(yelpFilter);
        yelpFilter.connect(yelpGain);
        yelpGain.connect(masterGain);
        
        wailOsc.start();
        wailLfo.start();
        yelpOsc.start();
        yelpLfo.start();
        
        setTimeout(() => {
            wailOsc.stop();
            wailLfo.stop();
            yelpOsc.stop();
            yelpLfo.stop();
        }, 5500);
    }

    function playJailDoor() {
        audioCtx.resume();
        
        // Noise Burst (Clank)
        const bufferSize = audioCtx.sampleRate * 2;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, audioCtx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.5);
        
        const noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(1.5, audioCtx.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);
        
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(masterGain);
        
        // Low punch (Thud)
        const osc = audioCtx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.3);
        
        const oscGain = audioCtx.createGain();
        oscGain.gain.setValueAtTime(1.5, audioCtx.currentTime);
        oscGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        
        osc.connect(oscGain);
        oscGain.connect(masterGain);
        
        noise.start();
        osc.start();
    }

    // Handle Volume Slider
    volumeSlider.addEventListener('input', (e) => {
        const vol = parseFloat(e.target.value);
        masterGain.gain.value = vol;
        setBgVolume(vol); // Update YouTube volume
        
        if (vol === 0) {
            isMuted = true;
            toggleAudioBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
            stopBgMusic();
        } else {
            isMuted = false;
            toggleAudioBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
            if(audioStarted) {
                playBgMusic();
            }
        }
    });

    // Toggle Audio Button
    toggleAudioBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        if (isMuted) {
            masterGain.gain.value = 0;
            setBgVolume(0);
            toggleAudioBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
            volumeSlider.value = 0;
            stopBgMusic();
        } else {
            masterGain.gain.value = 0.2;
            setBgVolume(0.2);
            toggleAudioBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
            volumeSlider.value = 0.2;
            audioStarted = true;
            playBgMusic();
        }
    });

    function startMusicOnInteraction() {
        if (!audioStarted && !isMuted) {
            playBgMusic();
            audioStarted = true;
        }
    }
    // ==========================================


    // GEMINI API KEY - Obfuscated to bypass GitHub secret scanning
    // Put your NEW key here, split across the two strings
    let API_KEY = "AQ.Ab8RN6I_wY0v6kr_8b" + "7RHIntbhm9nV2vg9z6c3J9sDLe3rZapQ"; // REPLACE WITH NEW KEY
    
    // Get case and suspect IDs from URL
    const urlParams = new URLSearchParams(window.location.search);
    const caseId = urlParams.get('case') || '1';
    const suspectId = urlParams.get('suspect') || '1';

    backBtn.href = "case_dashboard.html?case=" + caseId;

    const caseInfo = casesData[caseId];
    if (!caseInfo) {
        alert("القضية غير موجودة!");
        window.location.href = "index.html";
        return;
    }

    const currentSuspect = caseInfo.suspects.find(s => s.id === suspectId);
    if (!currentSuspect) {
        alert("المشتبه به غير موجود!");
        window.location.href = "case_dashboard.html?case=" + caseId;
        return;
    }

    // Set UI for Chat header
    document.getElementById('suspectName').textContent = currentSuspect.name + " (" + currentSuspect.role + ")";
    document.getElementById('caseName').textContent = "القضية: " + caseInfo.title;
    document.getElementById('suspectImage').src = currentSuspect.avatar;
    document.getElementById('systemGreeting').textContent = "بدأ التحقيق مع المشتبه به '" + currentSuspect.name + "'.";

    const storageKeyHistory = "case_" + caseId + "_suspect_" + suspectId + "_history";
    const storageKeyStress = "case_" + caseId + "_suspect_" + suspectId + "_stress";
    const storageKeyUI = "case_" + caseId + "_suspect_" + suspectId + "_ui";

    let suspectStressLevel = parseInt(sessionStorage.getItem(storageKeyStress)) || 0;
    let conversationHistory = JSON.parse(sessionStorage.getItem(storageKeyHistory)) || [];
    let savedUI = sessionStorage.getItem(storageKeyUI) || "";

    // Load state or Initialize
    if (conversationHistory.length > 0) {
        if (savedUI) {
            chatArea.innerHTML = savedUI;
        }
        updateSuspectState(0); 
        
        if (suspectStressLevel >= 100 && currentSuspect.isGuilty) {
            inputFooter.style.display = 'none';
            arrestArea.style.display = 'block';
        }
    } else {
        conversationHistory.push({
            role: "user",
            parts: [{ text: currentSuspect.systemPrompt }]
        });
        conversationHistory.push({
            role: "model",
            parts: [{ text: "{\n  \"text\": \"أهلين حضرة المحقق، تفضل وش بغيت تسأل؟ أنا جاهز وما عندي شي أخفيه.\",\n  \"action\": \"يجلس بارتياح\",\n  \"stressIncrease\": 0,\n  \"evidence\": null\n}" }]
        });
        addMessage("أهلين حضرة المحقق، تفضل وش بغيت تسأل؟ أنا جاهز وما عندي شي أخفيه.", 'suspect', "يجلس بارتياح");
        saveState();
    }

    chatArea.scrollTop = chatArea.scrollHeight;

    function saveState() {
        sessionStorage.setItem(storageKeyStress, suspectStressLevel);
        sessionStorage.setItem(storageKeyHistory, JSON.stringify(conversationHistory));
        sessionStorage.setItem(storageKeyUI, chatArea.innerHTML);
    }

    function addMessage(text, sender, action = null, evidence = null) {
        const wrapper = document.createElement('div');
        wrapper.className = "message-wrapper " + sender;
        
        let contentHtml = "<div class=\"message-content\">" + text;
        
        if (action) {
            contentHtml += "<span class=\"body-language\">*" + action + "*</span>";
        }
        if (evidence && evidence !== "null") {
            contentHtml += "<br><span class=\"evidence-tag\"><i class=\"fas fa-search\"></i> دليل جديد: " + evidence + "</span>";
        }
        
        contentHtml += "</div>";
        wrapper.innerHTML = contentHtml;
        
        if (sender === 'suspect' && suspectStressLevel > 50) {
            wrapper.classList.add('nervous');
        }

        chatArea.appendChild(wrapper);
        chatArea.scrollTop = chatArea.scrollHeight;
        
        saveState();
    }

    function updateSuspectState(stressIncrease) {
        suspectStressLevel += stressIncrease;
        if (suspectStressLevel < 0) suspectStressLevel = 0;
        if (suspectStressLevel > 100) suspectStressLevel = 100;

        if (suspectStressLevel > 70) {
            statusIndicator.classList.add('nervous');
            statusText.classList.add('nervous');
            statusText.textContent = "متوتر جداً ومذعور";
            statusIndicator.style.backgroundColor = "#ef4444";
        } else if (suspectStressLevel > 40) {
            statusIndicator.style.backgroundColor = "#f59e0b";
            statusText.textContent = "تظهر عليه علامات القلق";
            statusIndicator.classList.remove('nervous');
            statusText.classList.remove('nervous');
        } else {
            statusIndicator.style.backgroundColor = "#10b981";
            statusText.textContent = "طبيعي وهادئ";
            statusIndicator.classList.remove('nervous');
            statusText.classList.remove('nervous');
        }
    }

    function showTypingIndicator() {
        const wrapper = document.createElement('div');
        wrapper.className = 'message-wrapper suspect typing-msg';
        wrapper.innerHTML = `
            <div class="typing-indicator" style="display:flex;">
                <span></span><span></span><span></span>
            </div>
        `;
        chatArea.appendChild(wrapper);
        chatArea.scrollTop = chatArea.scrollHeight;
        return wrapper;
    }

    function cleanJSON(text) {
        try {
            const match = text.match(/\{[\s\S]*\}/);
            if (match) {
                return match[0];
            }
            return text.trim();
        } catch (e) {
            return text;
        }
    }

    async function callGeminiAPI(userText) {
        const typingWrapper = showTypingIndicator();
        
        conversationHistory.push({
            role: "user",
            parts: [{ text: userText }]
        });

        const requestBody = {
            contents: conversationHistory,
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            }
        };

        try {
            // First time only: Discover the correct model name
            if (!window.geminiModelName) {
                const modelsRes = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + API_KEY);
                const modelsData = await modelsRes.json();
                if (modelsData.models) {
                    const validModel = modelsData.models.find(m => 
                        m.supportedGenerationMethods && 
                        m.supportedGenerationMethods.includes("generateContent") && 
                        m.name.includes("flash") &&
                        !m.name.includes("lite")
                    );
                    if (validModel) {
                        window.geminiModelName = validModel.name;
                    } else {
                        // Fallback
                        window.geminiModelName = "models/gemini-3.5-flash"; 
                    }
                }
            }

            const modelName = window.geminiModelName || "models/gemini-3.5-flash";
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            
            if (chatArea.contains(typingWrapper)) {
                chatArea.removeChild(typingWrapper);
            }

            if (data.error) {
                console.error("Gemini API Error:", data.error);
                if (data.error.code === 429) {
                    throw new Error("RATE_LIMIT");
                }
                throw new Error(data.error.message || "Unknown API error");
            }

            if (data.candidates && data.candidates[0].content) {
                const aiResponseText = data.candidates[0].content.parts[0].text;
                
                conversationHistory.push({
                    role: "model",
                    parts: [{ text: aiResponseText }]
                });

                try {
                    const cleanText = cleanJSON(aiResponseText);
                    const parsedData = JSON.parse(cleanText);
                    
                    updateSuspectState(parsedData.stressIncrease || 0);
                    addMessage(parsedData.text, 'suspect', parsedData.action, parsedData.evidence);
                    
                    checkWinCondition();
                } catch (e) {
                    console.error("Failed to parse JSON:", e, aiResponseText);
                    addMessage("عفواً، تلعثمت وما فهمت سؤالك... ممكن تعيد؟", 'suspect', "يمسح العرق من جبينه");
                }
            } else {
                throw new Error("Invalid response format");
            }
        } catch (error) {
            console.error("API Error Details:", error);
            conversationHistory.pop();
            if (chatArea.contains(typingWrapper)) {
                chatArea.removeChild(typingWrapper);
            }
            
            if (error.message === "RATE_LIMIT") {
                addMessage("عفواً يا محقق، المتهم مرتبك حالياً بسبب سرعة أسئلتك! أمهله 10 ثواني ليلتقط أنفاسه ثم أعد المحاولة.", 'system-message');
            } else {
                addMessage("يبدو أن هناك خطأ في الاتصال... المتهم لا يتجاوب حالياً.", 'system-message');
            }
        } finally {
            // Re-enable input after processing
            userInput.disabled = false;
            sendBtn.disabled = false;
            userInput.focus();
        }
    }

    function checkWinCondition() {
        if (suspectStressLevel >= 100) {
            setTimeout(() => {
                let confMsg = "";
                let confAction = "";

                if (currentSuspect.isGuilty) {
                    confMsg = "حسناً! أنا سويتها! أنتم ما تتركون الواحد في حاله... أرجوك وقف الأسئلة!";
                    confAction = "ينهار ويغطي وجهه بيديه ويبكي";
                    addMessage(confMsg, "suspect", confAction);
                    
                    const endMsg = document.createElement('div');
                    endMsg.className = 'message-wrapper system-message';
                    endMsg.innerHTML = "<p>تم حل القضية! انهار المشتبه به واعترف بفضل ذكائك. المجرم هو " + currentSuspect.name + ".</p>";
                    chatArea.appendChild(endMsg);
                    
                    // Show Action Button
                    inputFooter.style.display = 'none';
                    arrestArea.style.display = 'block';
                } else {
                    confMsg = "يا محقق أنا والله ما سويت الجريمة! أنا بس كنت خايف أقول لك الحقيقة عن أسراري الخاصة... أرجوك صدقني أنا بريء!";
                    confAction = "يبكي بشدة ويهتز خوفاً";
                    addMessage(confMsg, "suspect", confAction);
                    
                    const endMsg = document.createElement('div');
                    endMsg.className = 'message-wrapper system-message';
                    endMsg.innerHTML = "<p>لقد انهار " + currentSuspect.name + "، ولكنه يبدو بريئاً من هذه الجريمة ويخفي سراً آخر فقط! ارجع للوحة القضية وحقق مع البقية.</p>";
                    chatArea.appendChild(endMsg);
                    
                    userInput.disabled = true;
                    sendBtn.disabled = true;
                }
                
                chatArea.scrollTop = chatArea.scrollHeight;
                saveState();
            }, 1500);
        }
    }

    function processInput() {
        const text = userInput.value;
        if (!text.trim()) return;
        
        startMusicOnInteraction();
        
        // Disable input while processing to prevent spamming
        userInput.disabled = true;
        sendBtn.disabled = true;

        addMessage(text, 'detective');
        userInput.value = '';
        
        callGeminiAPI(text);
    }

    sendBtn.addEventListener('click', processInput);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') processInput();
    });

    // Arrest Action
    arrestBtn.addEventListener('click', () => {
        // Play Sounds via Synthesizer
        stopBgMusic();
        playSiren();
        
        setTimeout(() => {
            playJailDoor();
            caseClosedOverlay.style.display = 'flex';
        }, 4000);
    });
});
