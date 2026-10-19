'use strict';

// ========================================
// DARLING AI - Chat Application
// ========================================

const form = document.querySelector('#form');
const input = document.querySelector('#input');
const messages = document.querySelector('#messages');
const clearButton = document.querySelector('#clear');

// ========================================
// RESPONSE COLLECTION
// ========================================

const replies = {
    greeting: [
        'Vanakkam nanba! 👋 Eppadi irukka?',
        'Hey nanba! Darling inga ready-ah irukken. 😊',
        'Hi! Sollu nanba, enna pesalam?'
    ],

    joke: [
        'Teacher: Why are you late? Student: The sign said "School Ahead, Go Slow!" 😄',
        'Programmer-ku favourite place edhu? The Foo Bar! 😂',
        'Computer-ku cold pudicha enna pannum? Windows close pannum! 😆'
    ],

    riddle: [
        'I have keys but no locks, space but no room. What am I? 🤔 Hint: typing-ku use pannuva!',
        'What gets wetter as it dries? Think pannitu sollu nanba!'
    ],

    motivation: [
        'Small steps every day, nanba. Consistency dhaan real superpower. ⚡',
        'Mistake-na failure illa; adhu next attempt-ku lesson. Keep learning! 💚',
        'Un goal-ah perusa vechikko, daily practice-ah chinnadha start pannu.'
    ]
};

// ========================================
// RANDOM RESPONSE
// ========================================

function pick(items) {
    return items[Math.floor(Math.random() * items.length)];
}

// ========================================
// SIMPLE CALCULATOR
// ========================================

function calculate(text) {
    const match = text.match(
        /^\s*(-?\d+(?:\.\d+)?)\s*([+\-*/x])\s*(-?\d+(?:\.\d+)?)\s*\??\s*$/i
    );

    if (!match) {
        return null;
    }

    const a = Number(match[1]);
    const operator = match[2].toLowerCase();
    const b = Number(match[3]);

    if (operator === '/' && b === 0) {
        return 'Zero-voda divide panna mudiyadhu, nanba.';
    }

    let answer;

    switch (operator) {
        case '+':
            answer = a + b;
            break;

        case '-':
            answer = a - b;
            break;

        case '*':
        case 'x':
            answer = a * b;
            break;

        case '/':
            answer = a / b;
            break;

        default:
            return null;
    }

    return 'Answer: ' + answer;
}

// ========================================
// DARLING RESPONSE ENGINE
// ========================================

function reply(raw) {
    const text = raw.toLowerCase().trim();

    // Calculator
    const math = calculate(text);

    if (math !== null) {
        return math;
    }

    // Greeting
    if (
        /\b(hi|hello|hey|vanakkam|hii|hai)\b/.test(text) ||
        /வணக்கம்/.test(text)
    ) {
        return pick(replies.greeting);
    }

    // Name
    if (
        /un peru|your name|who are you|nee yaar|per enna|name sollu/.test(text)
    ) {
        return 'En peru Darling Robot, nanba. 🤖';
    }

    // Creator
    if (
        /creator|owner|who made|yaaru create|vimal/.test(text)
    ) {
        return 'En creator Vimal MS. Namma project-ah step-by-step build pannuvom! 💗';
    }

    // Thanks
    if (
        /\b(thanks?|thank you|tnx)\b/.test(text) ||
        /nandri|நன்றி/.test(text)
    ) {
        return pick([
            'You’re welcome, nanba! 💚',
            'Paravalla nanba, anytime!',
            'Happy to help!'
        ]);
    }

    // Jokes
    if (
        /\b(joke|funny|comedy)\b/.test(text) ||
        /sirippu|சிரிப்பு/.test(text)
    ) {
        return pick(replies.joke);
    }

    // Riddles
    if (
        /\b(riddle|puzzle)\b/.test(text) ||
        /puthir|புதிர்/.test(text)
    ) {
        return pick(replies.riddle);
    }

    // Motivation
    if (
        /motivat|positive|encourage|confidence|tired|sad|kastam/.test(text)
    ) {
        return pick(replies.motivation);
    }

    // Features
    if (
        /what can you do|help|features|enna pannuva|enna theriyum|capabilit/.test(text)
    ) {
        return 'Ippo naan basic chat, jokes, riddles, motivation, and simple calculations help pannuren. Real AI, voice, and ESP32 connection later add pannalam.';
    }

    // How are you?
    if (
        /how are you|eppadi irukka|epdi iruka/.test(text)
    ) {
        return pick([
            'Naan super-ah irukken nanba! Nee eppadi?',
            'System ready! 😄 Nee sollu nanba, eppadi irukka?'
        ]);
    }

    // Music
    if (
        /\b(music|song)\b/.test(text) ||
        /paatu|பாட்டு/.test(text)
    ) {
        return 'Music feature-ah next update-la add pannalam nanba. 🎵';
    }

    // ESP32
    if (
        /esp32|oled|robot connect|connect robot/.test(text)
    ) {
        return 'ESP32 connection next phase-la add pannuvom. Ippo indha page browser demo mattum; hardware-ku firmware and connection setup venum. 🤖';
    }

    // Tamil / Tanglish
    if (
        /\btamil\b|\btanglish\b|தமிழ்/.test(text)
    ) {
        return 'Tamil/Tanglish-la pesalam nanba! Un message-ah purinjikka try pannuren. 💗';
    }

    // Default
    return 'Puriyudhu nu nenaikkiren, nanba. 😊 Innum konjam different-ah sollu. Ippo naan basic rule-based version; real AI-ah later connect pannuvom.';
}

// ========================================
// DISPLAY CHAT MESSAGE
// ========================================

function add(text, who) {
    if (!messages) {
        return;
    }

    const row = document.createElement('div');
    row.className = 'message ' + who;

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = who === 'user' ? 'V' : 'D';

    const wrap = document.createElement('div');

    const label = document.createElement('label');
    label.textContent = who === 'user' ? 'YOU' : 'DARLING';

    const paragraph = document.createElement('p');
    paragraph.textContent = text;

    const time = document.createElement('small');
    time.textContent = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    }).toUpperCase();

    wrap.append(label, paragraph, time);
    row.append(avatar, wrap);

    messages.append(row);
    messages.scrollTop = messages.scrollHeight;
}

// ========================================
// SEND MESSAGE
// ========================================

function send(text) {
    if (typeof text !== 'string' || !text.trim()) {
        return;
    }

    const userMessage = text.trim();

    add(userMessage, 'user');

    if (input) {
        input.value = '';
        input.focus();
    }

    window.setTimeout(function () {
        add(reply(userMessage), 'bot');
    }, 250);
}

// ========================================
// INITIALIZE CHAT EVENTS
// ========================================

if (form && input && messages && clearButton) {

    // Send using form
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        send(input.value);
    });

    // Quick prompt buttons
    document.querySelectorAll('[data-prompt]').forEach(function (button) {
        button.addEventListener('click', function () {
            send(button.dataset.prompt || '');
        });
    });

    // Clear chat
    clearButton.addEventListener('click', function () {
        messages.replaceChildren();

        add(
            'Chat cleared, nanba. 💚 Fresh-ah start pannalam!',
            'bot'
        );
    });

} else {
    console.error(
        'DARLING AI: Missing HTML elements. Check #form, #input, #messages and #clear in your HTML.'
    );
}
