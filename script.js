// Tarayıcının Web Speech API'yi destekleyip desteklemediğini kontrol et
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// Eğer desteklemiyorsa kullanıcıyı uyar
if (!window.SpeechRecognition) {
    alert("Maalesef tarayıcınız konuşma tanımayı desteklemiyor. Lütfen Chrome veya Edge deneyin.");
} else {
    // Gerekli DOM elemanlarını seç
    const recognition = new SpeechRecognition();
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const output = document.getElementById('output');
    const status = document.getElementById('status');
    const languageSelect = document.getElementById('languageSelect');

    let isListening = false;
    let final_transcript = ''; // Nihai, onaylanmış metin

    // Ayarlar
    recognition.continuous = true;   // Sürekli dinle
    recognition.interimResults = true; // Konuşurken geçici sonuçları göster
    recognition.lang = languageSelect.value; // Dil ayarını seçilenden al

    // Dil seçimi değiştiğinde API'nin dilini güncelle
    languageSelect.onchange = () => {
        recognition.lang = languageSelect.value;
    };

    // Başlat düğmesine tıklanınca
    startButton.onclick = () => {
        if (isListening) return;
        
        recognition.start();
        isListening = true;
        startButton.disabled = true;
        stopButton.disabled = false;
    };

    // Durdur düğmesine tıklanınca
    stopButton.onclick = () => {
        if (!isListening) return;
        
        recognition.stop();
        isListening = false;
        startButton.disabled = false;
        stopButton.disabled = true;
    };

    // Dinleme başladığında
    recognition.onstart = () => {
        status.textContent = "Durum: Dinleniyor... (Lütfen konuşun)";
    };

    // Dinleme bittiğinde (manuel durdurma)
    recognition.onend = () => {
        status.textContent = "Durum: Beklemede";
        isListening = false;
        startButton.disabled = false;
        stopButton.disabled = true;
    };

    // Hata olursa
    recognition.onerror = (event) => {
        if (event.error === 'no-speech') {
            status.textContent = "Durum: Ses algılanmadı. Tekrar deneniyor.";
        } else if (event.error === 'not-allowed') {
            status.textContent = "Durum: Hata! Mikrofon izni verilmedi.";
        } else {
            status.textContent = `Durum: Hata - ${event.error}`;
        }
    };

    // Konuşma algılandığında (En önemli kısım)
    recognition.onresult = (event) => {
        let interim_transcript = ''; // Geçici, değişebilen metin

        // event.results, bize bir dizi sonuç listesi verir
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
                // Eğer konuşma bittiyse (cümle tamamlandıysa)
                final_transcript += transcript + ' ';
            } else {
                // Henüz konuşuyorsanız
                interim_transcript += transcript;
            }
        }

        // Hem tamamlanmış metni hem de o anki geçici metni göster
        output.value = final_transcript + interim_transcript;
    };
}