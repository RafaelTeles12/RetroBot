const apiKey = "yourKey";

function sendMessage(){
    var message = document.getElementById('message-input')
    if(!message.value){
    message.style.border = '2px solid red'
    return;
    }
    
    message.style.border = 'none'
    
    var status = document.getElementById('status')
    var btnSubmit = document.getElementById('btn-submit')
    
    status.style.display = 'block'
    status.innerHTML = 'Carregando...'
    btnSubmit.disabled = true
    btnSubmit.style.cursor = 'not-allowed'
    message.disabled = true
    
    fetch("https://api.openai.com/v1/completions",{
        method: 'POST',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo-instruct",
            prompt: message.value,
            max_tokens: 2048,
            temperature: 0.6
        })
    })
        
    .then((response) => response.json())
    .then((response) => {
        let r = response.choices[0]['text']
        status.style.display = 'none'
        showHistory(message.value,r)
    })
    .catch((e) => {
        console.log(`Error -> ${e}`)
        status.innerHTML = 'Erro, tente novamente mais tarde...'
    })
    .finally(() => {
        btnSubmit.disabled = false
        btnSubmit.style.cursor = 'pointer'
        message.disabled = false
        message.value = ''
    })
}

function showHistory(message, response) {
    var historyBox = document.getElementById('history');

    // My message
    var boxMyMessage = document.createElement('div');
    boxMyMessage.className = 'box-my-message';

    var myMessage = document.createElement('p');
    myMessage.className = 'my-message';
    myMessage.innerHTML = 'Usuário: ' + message;

    boxMyMessage.appendChild(myMessage);

    historyBox.appendChild(boxMyMessage);

    // Response message
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