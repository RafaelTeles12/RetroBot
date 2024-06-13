document.getElementById('voice-button').addEventListener('click', startVoiceRecognition);

function startVoiceRecognition() {
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.start();
    recognition.onresult = function(event) {
        const messageInput = document.getElementById('message-input');
        const last = event.results.length - 1;
        const message = event.results[last][0].transcript;
        messageInput.value = message;
    };

    recognition.onerror = function(event) {
        console.error('Erro no reconhecimento de voz:', event.error);
    };
}

document.getElementById('upload-image-button').addEventListener('click', uploadImage);

function uploadImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            processImage(file);
        }
    };
    input.click();
}

function processImage(imageFile) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const imageBase64 = event.target.result;
        recognizeTextInImage(imageBase64);
    };
    reader.readAsDataURL(imageFile);
}

function recognizeTextInImage(imageBase64) {
    fetch('https://vision.googleapis.com/v1/images:annotate?key=YOUR_KEY', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            requests: [{
                image: { content: imageBase64.replace('data:image/jpeg;base64,', '') },
                features: [{ type: 'TEXT_DETECTION' }]
            }]
        })
    })
    .then(response => response.json())
    .then(data => {
        const text = data.responses[0].textAnnotations[0].description;
        const messageInput = document.getElementById('message-input');
        messageInput.value = text;
    })
    .catch(error => {
        console.error('Erro ao reconhecer texto na imagem:', error);
    });
}

const apiKey = "YOUR_KEY";

let conversationHistory = [];

function sendMessage() {
    var message = document.getElementById('message-input');
    if (!message.value) {
        message.style.border = '2px solid red';
        return;
    }
    message.style.border = 'none';
    var status = document.getElementById('status');
    var btnSubmit = document.getElementById('btn-submit');
    status.style.display = 'block';
    status.innerHTML = 'Carregando...';
    btnSubmit.disabled = true;
    btnSubmit.style.cursor = 'not-allowed';
    message.disabled = true;

    fetch("https://api.openai.com/v1/completions", {
        method: 'POST',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo-instruct",
            prompt: constructPrompt(message.value),
            max_tokens: 2048,
            temperature: 0.6
        })
    })
    .then((response) => response.json())
    .then((response) => {
        let r = response.choices[0]['text'];
        status.style.display = 'none';
        showHistory(message.value, r);
        conversationHistory.push({ userMessage: message.value, botResponse: r });
    })
    .catch((e) => {
        console.log(`Error -> ${e}`);
        status.innerHTML = 'Erro, tente novamente mais tarde...';
    })
    .finally(() => {
        btnSubmit.disabled = false;
        btnSubmit.style.cursor = 'pointer';
        message.disabled = false;
        message.value = '';
    });
}

function constructPrompt(userMessage) {
    let context = conversationHistory.map(entry => `User: ${entry.userMessage}\nBot: ${entry.botResponse}`).join('\n');
    return `${context}\nUser: ${userMessage}\nBot:`;
}

function showHistory(message, response) {
    var historyBox = document.getElementById('history');

    // Mensagem do usuário
    var boxMyMessage = document.createElement('div');
    boxMyMessage.className = 'box-my-message';

    var myMessage = document.createElement('p');
    myMessage.className = 'my-message';
    myMessage.innerHTML = 'Usuário: ' + message;

    boxMyMessage.appendChild(myMessage);
    historyBox.appendChild(boxMyMessage);

    // Mensagem de resposta
    var boxResponseMessage = document.createElement('div');
    boxResponseMessage.className = 'box-response-message';

    var chatResponse = document.createElement('p');
    chatResponse.className = 'response-message';
    chatResponse.innerHTML = 'Retro Bot: ';

    boxResponseMessage.appendChild(chatResponse);
    historyBox.appendChild(boxResponseMessage);

    var index = 0;
    var typingInterval = setInterval(function() {
        chatResponse.innerHTML += response[index];
        historyBox.scrollTop = historyBox.scrollHeight;
        index++;
        if (index === response.length) {
            clearInterval(typingInterval);
        }
    }, 12);
}

document.getElementById('message-input').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

function sendAssessment() {
    var assessment = document.getElementById('assessment-input');
    if (!assessment.value) {
        assessment.style.border = '2px solid red';
        return;
    }
    assessment.style.border = 'none';
    var status = document.getElementById('status');
    var btnAssessment = document.getElementById('btn-assessment');
    status.style.display = 'block';
    status.innerHTML = 'Recebendo avaliação...';
    btnAssessment.disabled = true;
    btnAssessment.style.cursor = 'not-allowed';
    assessment.disabled = true;

    fetch("YOUR_API_LINK_GOES_HERE", {
        method:'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({texto: assessment.value})
    })
    .then((response) => response.json())
    .then((response) => {showAssessment(response.resultado)})
    
    .catch((e) => {
        console.log(`Error -> ${e}`);
        status.innerHTML = 'Erro, tente novamente mais tarde...';
    })
        
    .finally(() => {
        btnAssessment.disabled = false;
        btnAssessment.style.cursor = 'pointer';
        assessment.disabled = false;
        assessment.value = '';
    });
}

function showAssessment(resultado) {
    var status = document.getElementById('status');
    if (resultado === 'positivo') {
        status.innerHTML = 'Obrigado pela avaliação positiva!';
    }
    
    else {
        status.innerText = 'Pedimos desculpas pela experiência negativa. Faremos o possível para melhorar.';
    }
}